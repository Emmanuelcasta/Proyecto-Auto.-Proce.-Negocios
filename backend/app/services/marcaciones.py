"""
Servicio de marcaciones — lógica de negocio pura.

Implementa:
- Toggle entrada/salida con validaciones
- Cálculo de horas efectivas (descuento 20 min)
- Detección de duplicados (±2 min)
- Corrección manual con auditoría
- Consultas y resúmenes por periodo
"""

import logging
from datetime import date, datetime, timedelta, timezone
from decimal import Decimal, ROUND_HALF_UP

from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.marcacion import Marcacion
from app.models.empleado import Empleado
from app.schemas.marcacion import MarcacionFormSchema, MarcacionCorreccionSchema
from app.utils.exceptions import (
    SysClockException,
    NotFoundException,
)

logger = logging.getLogger("sysclock")

# ── Constantes ─────────────────────────────────────────────────────
DESCANSO_MINUTOS = 20  # Descuento fijo en TODOS los turnos y días


# ── Funciones auxiliares ───────────────────────────────────────────

def _extraer_fecha_bogota(ts: datetime) -> date:
    """Extrae la fecha en zona horaria America/Bogota (UTC-5)."""
    from zoneinfo import ZoneInfo
    bogota = ZoneInfo("America/Bogota")
    return ts.astimezone(bogota).date()


def _calcular_horas_efectivas(entrada: datetime, salida: datetime) -> Decimal:
    """
    Calcula horas efectivas = (salida - entrada) - 20 minutos.
    Retorna Decimal redondeado a 2 decimales. Mínimo 0.
    """
    delta = salida - entrada
    horas_brutas = delta.total_seconds() / 3600
    descuento = DESCANSO_MINUTOS / 60  # 0.3333...
    horas_netas = max(0, horas_brutas - descuento)
    return Decimal(str(round(horas_netas, 4))).quantize(
        Decimal("0.01"), rounding=ROUND_HALF_UP
    )


async def _es_duplicado(
    db: AsyncSession,
    empleado_id: int,
    timestamp: datetime,
    tolerancia_minutos: int = 2,
) -> bool:
    """
    Detecta si ya existe una marcación del mismo empleado
    con timestamp dentro de ±2 minutos.
    """
    rango_min = timestamp - timedelta(minutes=tolerancia_minutos)
    rango_max = timestamp + timedelta(minutes=tolerancia_minutos)

    query = select(Marcacion).where(
        and_(
            Marcacion.empleado_id == empleado_id,
            (
                Marcacion.timestamp_entrada.between(rango_min, rango_max)
                | Marcacion.timestamp_salida.between(rango_min, rango_max)
            ),
        )
    )
    result = await db.execute(query)
    return result.scalars().first() is not None


async def _validar_empleado_existe(db: AsyncSession, empleado_id: int) -> Empleado:
    """Verifica que el empleado exista y esté activo."""
    query = select(Empleado).where(
        and_(Empleado.id == empleado_id, Empleado.activo == True)
    )
    result = await db.execute(query)
    empleado = result.scalars().first()
    if not empleado:
        raise NotFoundException("Empleado", empleado_id)
    return empleado


# ── Registrar marcación (desde Make / Google Forms) ────────────────

async def registrar_marcacion(
    db: AsyncSession, data: MarcacionFormSchema
) -> dict:
    """
    Lógica principal de toggle entrada/salida.

    Reglas:
    - Sin marca hoy + ENTRADA → registra entrada
    - Con ENTRADA + SALIDA → registra salida, calcula horas
    - Con ENTRADA y SALIDA ya → rechaza con alerta
    - SALIDA sin ENTRADA → rechaza
    - Duplicado (±2 min) → ignora silenciosamente
    """
    # 1. Validar que el empleado exista
    await _validar_empleado_existe(db, data.empleado_id)

    # 2. Detectar duplicado
    if await _es_duplicado(db, data.empleado_id, data.timestamp):
        logger.info(
            f"Marcación duplicada ignorada: empleado={data.empleado_id}, "
            f"tipo={data.tipo}, ts={data.timestamp}"
        )
        return {
            "status": "ignorado",
            "message": "Marcación duplicada detectada (±2 min). Ignorada.",
        }

    # 3. Extraer fecha en zona Bogotá
    fecha = _extraer_fecha_bogota(data.timestamp)

    # 4. Buscar marcación existente del día
    query = select(Marcacion).where(
        and_(
            Marcacion.empleado_id == data.empleado_id,
            Marcacion.fecha == fecha,
        )
    )
    result = await db.execute(query)
    marcacion_hoy = result.scalars().first()

    # 5. Aplicar lógica de toggle
    if data.tipo == "ENTRADA":
        if marcacion_hoy is None:
            # ✅ Caso normal: primera marca del día → registrar ENTRADA
            nueva = Marcacion(
                empleado_id=data.empleado_id,
                fecha=fecha,
                timestamp_entrada=data.timestamp,
                fuente="FORM",
            )
            db.add(nueva)
            await db.flush()
            logger.info(
                f"ENTRADA registrada: empleado={data.empleado_id}, "
                f"fecha={fecha}, hora={data.timestamp}"
            )
            return {
                "status": "registrado",
                "message": "Entrada registrada correctamente.",
                "marcacion_id": nueva.id,
                "tipo": "ENTRADA",
            }
        else:
            # ❌ Ya hay registro hoy → no se puede otra ENTRADA
            raise SysClockException(
                f"Ya existe una marcación para el empleado {data.empleado_id} "
                f"en la fecha {fecha}. No se puede registrar otra ENTRADA.",
                status_code=409,
            )

    elif data.tipo == "SALIDA":
        if marcacion_hoy is None:
            # ❌ No hay ENTRADA previa
            raise SysClockException(
                f"No se puede registrar SALIDA sin ENTRADA previa "
                f"para el empleado {data.empleado_id} en la fecha {fecha}.",
                status_code=400,
            )
        elif marcacion_hoy.timestamp_salida is not None:
            # ❌ Ya tiene ENTRADA y SALIDA
            raise SysClockException(
                f"El empleado {data.empleado_id} ya tiene ENTRADA y SALIDA "
                f"registradas en la fecha {fecha}.",
                status_code=409,
            )
        elif marcacion_hoy.timestamp_entrada is None:
            # ❌ Estado inconsistente
            raise SysClockException(
                f"Estado inconsistente: registro sin ENTRADA para "
                f"empleado {data.empleado_id} en la fecha {fecha}.",
                status_code=400,
            )
        else:
            # ✅ Caso normal: tiene ENTRADA, registrar SALIDA
            marcacion_hoy.timestamp_salida = data.timestamp
            marcacion_hoy.horas_efectivas = _calcular_horas_efectivas(
                marcacion_hoy.timestamp_entrada, data.timestamp
            )
            await db.flush()
            logger.info(
                f"SALIDA registrada: empleado={data.empleado_id}, "
                f"fecha={fecha}, horas_efectivas={marcacion_hoy.horas_efectivas}"
            )
            return {
                "status": "registrado",
                "message": "Salida registrada correctamente.",
                "marcacion_id": marcacion_hoy.id,
                "tipo": "SALIDA",
                "horas_efectivas": str(marcacion_hoy.horas_efectivas),
            }


# ── Corrección manual (ADMIN) ─────────────────────────────────────

async def corregir_marcacion(
    db: AsyncSession,
    data: MarcacionCorreccionSchema,
    usuario_id: int,
) -> Marcacion:
    """
    Corrección manual de una marcación existente.
    Registra quién corrigió, cuándo y con qué justificación.
    Nunca se borran registros: solo se actualizan.
    """
    # Buscar la marcación
    query = select(Marcacion).where(Marcacion.id == data.marcacion_id)
    result = await db.execute(query)
    marcacion = result.scalars().first()

    if not marcacion:
        raise NotFoundException("Marcación", data.marcacion_id)

    # Aplicar correcciones
    if data.timestamp_entrada is not None:
        marcacion.timestamp_entrada = data.timestamp_entrada

    if data.timestamp_salida is not None:
        marcacion.timestamp_salida = data.timestamp_salida

    # Recalcular horas si ambos timestamps están presentes
    if marcacion.timestamp_entrada and marcacion.timestamp_salida:
        marcacion.horas_efectivas = _calcular_horas_efectivas(
            marcacion.timestamp_entrada, marcacion.timestamp_salida
        )

    # Auditoría
    marcacion.fuente = "MANUAL"
    marcacion.corregido_por = usuario_id
    marcacion.nota_correccion = data.nota_correccion

    await db.flush()
    logger.info(
        f"Marcación {data.marcacion_id} corregida por usuario {usuario_id}: "
        f"{data.nota_correccion}"
    )
    return marcacion


# ── Consultas ──────────────────────────────────────────────────────

async def listar_marcaciones(
    db: AsyncSession,
    empleado_id: int | None = None,
    fecha_inicio: date | None = None,
    fecha_fin: date | None = None,
) -> list[Marcacion]:
    """Lista marcaciones con filtros opcionales."""
    query = select(Marcacion).order_by(Marcacion.fecha.desc(), Marcacion.empleado_id)

    if empleado_id is not None:
        query = query.where(Marcacion.empleado_id == empleado_id)

    if fecha_inicio is not None:
        query = query.where(Marcacion.fecha >= fecha_inicio)

    if fecha_fin is not None:
        query = query.where(Marcacion.fecha <= fecha_fin)

    result = await db.execute(query)
    return list(result.scalars().all())


async def obtener_resumen(
    db: AsyncSession,
    empleado_id: int,
    fecha_inicio: date,
    fecha_fin: date,
) -> dict:
    """
    Resumen de horas trabajadas por un empleado en un periodo.
    Retorna total de horas, días trabajados y marcaciones incompletas.
    """
    # Verificar empleado
    empleado = await _validar_empleado_existe(db, empleado_id)

    # Consultar marcaciones del periodo
    query = select(Marcacion).where(
        and_(
            Marcacion.empleado_id == empleado_id,
            Marcacion.fecha >= fecha_inicio,
            Marcacion.fecha <= fecha_fin,
        )
    )
    result = await db.execute(query)
    marcaciones = list(result.scalars().all())

    # Calcular totales
    dias_trabajados = len(marcaciones)
    total_horas = sum(
        (m.horas_efectivas or Decimal("0")) for m in marcaciones
    )
    incompletas = sum(
        1 for m in marcaciones
        if m.timestamp_entrada and not m.timestamp_salida
    )

    return {
        "empleado_id": empleado_id,
        "empleado_nombre": empleado.nombre,
        "fecha_inicio": fecha_inicio,
        "fecha_fin": fecha_fin,
        "dias_trabajados": dias_trabajados,
        "total_horas": total_horas.quantize(Decimal("0.01")),
        "marcaciones_incompletas": incompletas,
    }
