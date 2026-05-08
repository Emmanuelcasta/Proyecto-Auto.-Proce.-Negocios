"""
Servicio de recargos.

Define:
- tabla oficial de recargos
- clasificación de tipo de hora
- cálculo de valor por tipo
"""

from decimal import Decimal, ROUND_HALF_UP

RECARGOS = {
    "ordinaria_diurna": Decimal("0.00"),
    "ordinaria_nocturna": Decimal("0.35"),
    "extra_diurna": Decimal("0.25"),
    "extra_nocturna": Decimal("0.75"),
    "festivo_diurno": Decimal("0.80"),
    "extra_festivo_diurno": Decimal("1.05"),
    "extra_festivo_nocturno": Decimal("1.55"),
}


def clasificar_horas(
    es_nocturno: bool,
    es_festivo_o_dominical: bool,
    es_extra: bool,
) -> str:
    """Clasifica la hora según reglas de negocio del proyecto."""
    if es_festivo_o_dominical:
        if es_extra:
            return "extra_festivo_nocturno" if es_nocturno else "extra_festivo_diurno"
        return "festivo_diurno"

    if es_extra:
        return "extra_nocturna" if es_nocturno else "extra_diurna"

    return "ordinaria_nocturna" if es_nocturno else "ordinaria_diurna"


def calcular_valor(horas: Decimal, tipo: str, valor_hora: Decimal) -> Decimal:
    """
    Calcula el valor final de un bloque de horas:
    horas * valor_hora * (1 + recargo)
    """
    if tipo not in RECARGOS:
        raise ValueError(f"Tipo de recargo no soportado: {tipo}")

    factor = Decimal("1") + RECARGOS[tipo]
    return (horas * valor_hora * factor).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
