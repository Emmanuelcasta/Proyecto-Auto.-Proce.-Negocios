"""
Servicio base de liquidación de nómina quincenal.
"""

from datetime import date, datetime, timezone
from decimal import Decimal, ROUND_HALF_UP

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.configuracion import Configuracion
from app.models.detalle_nomina import DetalleNomina
from app.models.empleado import Empleado
from app.models.marcacion import Marcacion
from app.models.nomina import Nomina
from app.services.aportes_empleador import calcular_aportes_empleador
from app.services.calendario import contar_dias_habiles, es_festivo_o_dominical, obtener_festivos_db
from app.services.deducciones import calcular_auxilio, calcular_deducciones
from app.services.horas import (
    calcular_horas_nocturnas,
    calcular_umbral_quincena,
    separar_ordinarias_y_extras,
    valor_hora_ordinaria,
)
from app.services.recargos import calcular_valor
from app.services.turnos import obtener_turno_empleado
from app.utils.exceptions import NotFoundException, SysClockException


SMMLV_2026 = Decimal("1423500.00")
AUXILIO_2026 = Decimal("200000.00")


def salario_proporcional(salario_mensual: Decimal, dias_quincena: int, dias_mes: int) -> Decimal:
    """Calcula salario básico proporcional del periodo."""
    if dias_mes <= 0:
        raise ValueError("dias_mes debe ser mayor a cero")
    return (
        salario_mensual * Decimal(str(dias_quincena)) / Decimal(str(dias_mes))
    ).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def _distribuir_horas(
    horas_diurnas: Decimal,
    horas_nocturnas: Decimal,
    umbral: Decimal,
) -> dict:
    """
    Separa horas ordinarias y extras aplicando umbral global.
    Priorizamos ordinaria nocturna antes que extra nocturna.
    """
    total_horas = (horas_diurnas + horas_nocturnas).quantize(Decimal("0.01"))
    horas_ordinarias, horas_extras = separar_ordinarias_y_extras(total_horas, umbral)

    # De las horas ordinarias que podemos pagar, ¿cuántas son nocturnas?
    ordinaria_nocturna = min(horas_nocturnas, horas_ordinarias).quantize(Decimal("0.01"))
    ordinaria_diurna = (horas_ordinarias - ordinaria_nocturna).quantize(Decimal("0.01"))

    # El resto de las nocturnas son extras
    extra_nocturna = (horas_nocturnas - ordinaria_nocturna).quantize(Decimal("0.01"))
    # El resto de las diurnas son extras
    extra_diurna = (horas_diurnas - ordinaria_diurna).quantize(Decimal("0.01"))

    return {
        "total_horas": total_horas,
        "ordinaria_diurna": ordinaria_diurna,
        "ordinaria_nocturna": ordinaria_nocturna,
        "extra_diurna": extra_diurna,
        "extra_nocturna": extra_nocturna,
    }


async def _obtener_parametros_nomina(db: AsyncSession) -> tuple[Decimal, Decimal]:
    """Lee SMMLV y auxilio desde configuración, con fallback 2026."""
    result = await db.execute(select(Configuracion).limit(1))
    config = result.scalar_one_or_none()
    if not config:
        return SMMLV_2026, AUXILIO_2026
    return config.smmlv, config.auxilio_transporte


async def liquidar_quincena_base(
    db: AsyncSession,
    empleado_id: int,
    fecha_inicio: date,
    fecha_fin: date,
) -> Nomina:
    """
    Liquida un periodo quincenal y guarda cabecera + detalle en DB.
    Esta versión es base (sin endpoint de aprobación/pago).
    """
    if fecha_fin < fecha_inicio:
        raise SysClockException("fecha_fin no puede ser menor a fecha_inicio", status_code=400)

    empleado_result = await db.execute(
        select(Empleado).where(Empleado.id == empleado_id, Empleado.activo == True)
    )
    empleado = empleado_result.scalar_one_or_none()
    if not empleado:
        raise NotFoundException("Empleado", empleado_id)

    festivos = await obtener_festivos_db(db)
    dias_habiles_quincena = contar_dias_habiles(fecha_inicio, fecha_fin, festivos)
    mes_inicio = date(fecha_inicio.year, fecha_inicio.month, 1)
    mes_fin = date(fecha_inicio.year, fecha_inicio.month + 1, 1) if fecha_inicio.month < 12 else date(
        fecha_inicio.year + 1, 1, 1
    )
    mes_fin = mes_fin.fromordinal(mes_fin.toordinal() - 1)
    dias_habiles_mes = contar_dias_habiles(mes_inicio, mes_fin, festivos)

    umbral = calcular_umbral_quincena(dias_habiles_quincena)

    marcaciones_result = await db.execute(
        select(Marcacion).where(
            Marcacion.empleado_id == empleado_id,
            Marcacion.fecha >= fecha_inicio,
            Marcacion.fecha <= fecha_fin,
            Marcacion.horas_efectivas.is_not(None),
        )
    )
    marcaciones = list(marcaciones_result.scalars().all())

    total_diurnas = Decimal("0.00")
    total_nocturnas = Decimal("0.00")
    total_festivo_diurno = Decimal("0.00")
    total_festivo_nocturno = Decimal("0.00")

    for m in marcaciones:
        horas_dia = (m.horas_efectivas or Decimal("0.00")).quantize(Decimal("0.01"))
        turno_info = await obtener_turno_empleado(db, empleado_id, m.fecha)
        horas_noct = calcular_horas_nocturnas(m, turno_info["turno"]).quantize(Decimal("0.01"))
        horas_diurnas = (horas_dia - horas_noct).quantize(Decimal("0.01"))
        if horas_diurnas < Decimal("0.00"):
            horas_diurnas = Decimal("0.00")

        if es_festivo_o_dominical(m.fecha, festivos):
            total_festivo_nocturno += horas_noct
            total_festivo_diurno += horas_diurnas
        else:
            total_nocturnas += horas_noct
            total_diurnas += horas_diurnas

    normal = _distribuir_horas(total_diurnas, total_nocturnas, umbral)
    festivo = _distribuir_horas(total_festivo_diurno, total_festivo_nocturno, Decimal("9999.99"))

    smmlv, auxilio_base = await _obtener_parametros_nomina(db)
    valor_hora = valor_hora_ordinaria(empleado.salario)
    salario_base = salario_proporcional(empleado.salario, dias_habiles_quincena, dias_habiles_mes)
    auxilio = calcular_auxilio(
        empleado.salario,
        dias_habiles_quincena,
        dias_habiles_mes,
        smmlv,
        auxilio_base,
    )

    devengados = [
        ("Salario básico proporcional", "DEVENGADO", None, None, salario_base),
        ("Auxilio transporte proporcional", "DEVENGADO", None, None, auxilio),
        ("Horas ordinarias diurnas", "DEVENGADO", normal["ordinaria_diurna"], Decimal("0.00"),
         calcular_valor(normal["ordinaria_diurna"], "ordinaria_diurna", valor_hora)),
        ("Horas ordinarias nocturnas", "DEVENGADO", normal["ordinaria_nocturna"], Decimal("0.35"),
         calcular_valor(normal["ordinaria_nocturna"], "ordinaria_nocturna", valor_hora)),
        ("Horas extra diurnas", "DEVENGADO", normal["extra_diurna"], Decimal("0.25"),
         calcular_valor(normal["extra_diurna"], "extra_diurna", valor_hora)),
        ("Horas extra nocturnas", "DEVENGADO", normal["extra_nocturna"], Decimal("0.75"),
         calcular_valor(normal["extra_nocturna"], "extra_nocturna", valor_hora)),
        ("Horas festivo diurnas", "DEVENGADO", festivo["ordinaria_diurna"], Decimal("0.80"),
         calcular_valor(festivo["ordinaria_diurna"], "festivo_diurno", valor_hora)),
        ("Horas extra festivo diurnas", "DEVENGADO", festivo["extra_diurna"], Decimal("1.05"),
         calcular_valor(festivo["extra_diurna"], "extra_festivo_diurno", valor_hora)),
        ("Horas extra festivo nocturnas", "DEVENGADO", festivo["extra_nocturna"], Decimal("1.55"),
         calcular_valor(festivo["extra_nocturna"], "extra_festivo_nocturno", valor_hora)),
    ]

    deducciones = calcular_deducciones(salario_base)
    deducciones_detalle = [
        ("Salud empleado", "DEDUCCION", None, Decimal("0.04"), deducciones["salud_empleado"]),
        ("Pensión empleado", "DEDUCCION", None, Decimal("0.04"), deducciones["pension_empleado"]),
    ]

    aportes = calcular_aportes_empleador(salario_base)
    aportes_detalle = [
        ("Salud empleador", "EMPLEADOR", None, Decimal("0.085"), aportes["salud_empleador"]),
        ("Pensión empleador", "EMPLEADOR", None, Decimal("0.12"), aportes["pension_empleador"]),
        ("ARL", "EMPLEADOR", None, None, aportes["arl"]),
        ("Caja compensación", "EMPLEADOR", None, Decimal("0.04"), aportes["caja_compensacion"]),
        ("SENA", "EMPLEADOR", None, Decimal("0.02"), aportes["sena"]),
        ("ICBF", "EMPLEADOR", None, Decimal("0.03"), aportes["icbf"]),
    ]

    total_devengado = sum((x[4] for x in devengados), Decimal("0.00")).quantize(Decimal("0.01"))
    total_deducciones = sum((x[4] for x in deducciones_detalle), Decimal("0.00")).quantize(Decimal("0.01"))
    neto = (total_devengado - total_deducciones).quantize(Decimal("0.01"))

    nomina = Nomina(
        empleado_id=empleado_id,
        fecha_inicio=fecha_inicio,
        fecha_fin=fecha_fin,
        dias_habiles_quincena=dias_habiles_quincena,
        dias_habiles_mes=dias_habiles_mes,
        umbral_horas=umbral,
        total_horas_trabajadas=(normal["total_horas"] + festivo["total_horas"]).quantize(Decimal("0.01")),
        estado="BORRADOR",
        total_devengado=total_devengado,
        total_deducciones=total_deducciones,
        neto_pagar=neto,
    )
    db.add(nomina)
    await db.flush()

    for concepto, categoria, horas, porcentaje, valor in devengados + deducciones_detalle + aportes_detalle:
        detalle = DetalleNomina(
            nomina_id=nomina.id,
            concepto=concepto,
            categoria=categoria,
            horas=horas,
            porcentaje=porcentaje,
            valor=valor,
        )
        db.add(detalle)

    await db.flush()
    await db.refresh(nomina)
    return nomina


async def obtener_nomina_por_id(db: AsyncSession, nomina_id: int) -> Nomina:
    """Obtiene una nómina por id."""
    result = await db.execute(select(Nomina).where(Nomina.id == nomina_id))
    nomina = result.scalar_one_or_none()
    if not nomina:
        raise NotFoundException("Nómina", nomina_id)
    return nomina


async def aprobar_nomina(db: AsyncSession, nomina_id: int, usuario_id: int) -> Nomina:
    """Aprueba una nómina en estado BORRADOR."""
    nomina = await obtener_nomina_por_id(db, nomina_id)
    if nomina.estado != "BORRADOR":
        raise SysClockException(
            f"La nómina {nomina_id} no está en BORRADOR (estado actual: {nomina.estado}).",
            status_code=409,
        )
    nomina.estado = "APROBADO"
    nomina.aprobado_por = usuario_id
    nomina.aprobado_en = datetime.now(timezone.utc)
    await db.flush()
    await db.refresh(nomina)
    return nomina


async def marcar_nomina_pagada(db: AsyncSession, nomina_id: int) -> Nomina:
    """Marca una nómina aprobada como pagada."""
    nomina = await obtener_nomina_por_id(db, nomina_id)
    if nomina.estado != "APROBADO":
        raise SysClockException(
            f"La nómina {nomina_id} debe estar APROBADO para marcarse como PAGADO (actual: {nomina.estado}).",
            status_code=409,
        )
    nomina.estado = "PAGADO"
    await db.flush()
    await db.refresh(nomina)
    return nomina


async def historial_nomina(db: AsyncSession, empleado_id: int | None = None) -> list[Nomina]:
    """Obtiene historial de nóminas, opcionalmente filtrado por empleado."""
    query = select(Nomina).order_by(Nomina.creado_en.desc())
    if empleado_id is not None:
        query = query.where(Nomina.empleado_id == empleado_id)
    result = await db.execute(query)
    return list(result.scalars().all())
