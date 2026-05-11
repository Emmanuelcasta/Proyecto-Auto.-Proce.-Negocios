"""
Servicio de turnos — lógica de rotación automática.

Implementa el ciclo de 6 semanas (3 bloques × 2 semanas):
- Bloque 1 (semanas 1-2): A=TURNO_1, B=TURNO_1, C=TURNO_2
- Bloque 2 (semanas 3-4): A=TURNO_1, B=TURNO_2, C=TURNO_1
- Bloque 3 (semanas 5-6): A=TURNO_2, B=TURNO_1, C=TURNO_1

El admin configura fecha_inicio_ciclo una sola vez.
El sistema calcula el turno de cualquier empleado en cualquier fecha.

Definición de turnos:
- TURNO_1: L-V 6:00am–2:00pm, Sáb 6:00am–12:00m
- TURNO_2: L-V 2:00pm–10:00pm, Sáb 12:00m–6:00pm
"""

import logging
from datetime import date, timedelta

from sqlalchemy import select, and_, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.turno import CicloRotacion
from app.models.empleado import Empleado
from app.schemas.turno import CicloRotacionCreate
from app.utils.exceptions import SysClockException, NotFoundException

logger = logging.getLogger("sysclock")

# ── Ciclo de rotación (3 bloques × 2 semanas = 6 semanas) ─────────

CICLO = [
    {"A": "TURNO_1", "B": "TURNO_1", "C": "TURNO_2"},  # Bloque 1 (semanas 1-2)
    {"A": "TURNO_1", "B": "TURNO_2", "C": "TURNO_1"},  # Bloque 2 (semanas 3-4)
    {"A": "TURNO_2", "B": "TURNO_1", "C": "TURNO_1"},  # Bloque 3 (semanas 5-6)
]


# ── Algoritmo de cálculo de turno ──────────────────────────────────

def get_turno_empleado(
    fecha: date,
    empleado_letra: str,
    fecha_inicio_ciclo: date,
) -> dict:
    """
    Calcula el turno de un empleado para una fecha dada.

    Args:
        fecha: La fecha a consultar.
        empleado_letra: 'A', 'B' o 'C'.
        fecha_inicio_ciclo: Fecha de inicio del ciclo (configurada por admin).

    Returns:
        Dict con 'turno' (TURNO_1 o TURNO_2) e 'indice_bloque' (0, 1 o 2).
    """
    if empleado_letra not in ("A", "B", "C"):
        raise SysClockException(
            f"Letra de empleado inválida: '{empleado_letra}'. Debe ser A, B o C.",
            status_code=400,
        )

    # Obtener el lunes de la semana de la fecha
    lunes = fecha - timedelta(days=fecha.weekday())

    # Calcular semanas transcurridas desde el inicio del ciclo
    dias_transcurridos = (lunes - fecha_inicio_ciclo).days
    semanas_transcurridas = dias_transcurridos // 7

    # Cada bloque dura 2 semanas, hay 3 bloques → ciclo de 6 semanas
    indice_bloque = (semanas_transcurridas // 2) % 3

    turno = CICLO[indice_bloque][empleado_letra]

    return {
        "turno": turno,
        "indice_bloque": indice_bloque,
    }


def get_letra_empleado(
    empleado_id: int,
    ciclo: CicloRotacion,
) -> str:
    """
    Determina la letra (A, B, C) de un empleado dentro del ciclo activo.

    Args:
        empleado_id: ID del empleado.
        ciclo: Registro activo del ciclo de rotación.

    Returns:
        'A', 'B' o 'C'.

    Raises:
        SysClockException si el empleado no pertenece al ciclo.
    """
    if empleado_id == ciclo.empleado_a_id:
        return "A"
    elif empleado_id == ciclo.empleado_b_id:
        return "B"
    elif empleado_id == ciclo.empleado_c_id:
        return "C"
    else:
        raise SysClockException(
            f"El empleado {empleado_id} no pertenece al ciclo de rotación activo.",
            status_code=400,
        )


# ── Consultar turno para una fecha ─────────────────────────────────

async def obtener_turno_empleado(
    db: AsyncSession,
    empleado_id: int,
    fecha: date,
) -> dict:
    """
    Obtiene el turno de un empleado para una fecha específica.
    Usa el ciclo activo de la base de datos.
    """
    ciclo = await obtener_ciclo_activo(db)
    letra = get_letra_empleado(empleado_id, ciclo)
    resultado = get_turno_empleado(fecha, letra, ciclo.fecha_inicio_ciclo)

    return {
        "empleado_id": empleado_id,
        "letra": letra,
        "turno": resultado["turno"],
        "bloque": resultado["indice_bloque"] + 1,  # 1-indexed para el usuario
    }


# ── Turnos de la semana (todos los empleados) ─────────────────────

async def obtener_turnos_semana(
    db: AsyncSession,
    fecha: date,
) -> dict:
    """
    Obtiene el turno de cada empleado para la semana que contiene la fecha.
    Retorna el lunes, sábado, bloque, y lista de empleados con su turno.
    """
    ciclo = await obtener_ciclo_activo(db)

    lunes = fecha - timedelta(days=fecha.weekday())
    sabado = lunes + timedelta(days=5)

    empleados_info = []
    for letra, emp_id, emp_rel in [
        ("A", ciclo.empleado_a_id, ciclo.empleado_a),
        ("B", ciclo.empleado_b_id, ciclo.empleado_b),
        ("C", ciclo.empleado_c_id, ciclo.empleado_c),
    ]:
        resultado = get_turno_empleado(fecha, letra, ciclo.fecha_inicio_ciclo)
        nombre = emp_rel.nombre if emp_rel else f"Empleado {emp_id}"
        empleados_info.append({
            "empleado_id": emp_id,
            "empleado_nombre": nombre,
            "letra": letra,
            "turno": resultado["turno"],
            "bloque": resultado["indice_bloque"] + 1,
        })

    bloque = empleados_info[0]["bloque"] if empleados_info else 0

    return {
        "semana_inicio": lunes,
        "semana_fin": sabado,
        "bloque": bloque,
        "empleados": empleados_info,
    }


# ── CRUD del ciclo ─────────────────────────────────────────────────

async def obtener_ciclo_activo(db: AsyncSession) -> CicloRotacion:
    """Obtiene el único ciclo de rotación activo."""
    query = select(CicloRotacion).where(CicloRotacion.activo == True)
    result = await db.execute(query)
    ciclo = result.scalars().first()

    if not ciclo:
        raise NotFoundException("Ciclo de rotación activo", "ninguno")

    return ciclo


async def crear_ciclo(
    db: AsyncSession,
    data: CicloRotacionCreate,
    usuario_id: int,
) -> CicloRotacion:
    """
    Crea un nuevo ciclo de rotación.
    Desactiva cualquier ciclo anterior antes de crear el nuevo.
    Valida que los 3 empleados existan, estén activos y sean distintos.
    """
    # Validar que los 3 IDs sean distintos
    ids = {data.empleado_a_id, data.empleado_b_id, data.empleado_c_id}
    if len(ids) != 3:
        raise SysClockException(
            "Los 3 empleados del ciclo deben ser distintos.",
            status_code=400,
        )

    # Validar que la fecha de inicio sea un lunes
    if data.fecha_inicio_ciclo.weekday() != 0:
        raise SysClockException(
            "La fecha de inicio del ciclo debe ser un lunes.",
            status_code=400,
        )

    # Validar que los 3 empleados existan y estén activos
    for emp_id in ids:
        query = select(Empleado).where(
            and_(Empleado.id == emp_id, Empleado.activo == True)
        )
        result = await db.execute(query)
        if not result.scalars().first():
            raise NotFoundException("Empleado", emp_id)

    # Desactivar ciclos anteriores
    await db.execute(
        update(CicloRotacion)
        .where(CicloRotacion.activo == True)
        .values(activo=False)
    )

    # Crear nuevo ciclo
    nuevo = CicloRotacion(
        fecha_inicio_ciclo=data.fecha_inicio_ciclo,
        empleado_a_id=data.empleado_a_id,
        empleado_b_id=data.empleado_b_id,
        empleado_c_id=data.empleado_c_id,
        activo=True,
        creado_por=usuario_id,
    )
    db.add(nuevo)
    await db.flush()

    logger.info(
        f"Nuevo ciclo de rotación creado: id={nuevo.id}, "
        f"inicio={data.fecha_inicio_ciclo}, "
        f"A={data.empleado_a_id}, B={data.empleado_b_id}, C={data.empleado_c_id}"
    )

    # Re-consultar para cargar las relaciones selectin (empleado_a/b/c)
    stmt = select(CicloRotacion).where(CicloRotacion.id == nuevo.id)
    result = await db.execute(stmt)
    return result.scalars().first()
