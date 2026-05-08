"""
Servicio de aportes del empleador (informativos).
"""

from decimal import Decimal, ROUND_HALF_UP


def calcular_aportes_empleador(base: Decimal, clase_riesgo_arl: int = 1) -> dict:
    """
    Calcula aportes del empleador sobre la base recibida.
    """
    tasas_arl = {
        1: Decimal("0.0052"),
        2: Decimal("0.0104"),
        3: Decimal("0.0243"),
        4: Decimal("0.0435"),
        5: Decimal("0.0696"),
    }

    if clase_riesgo_arl not in tasas_arl:
        raise ValueError("clase_riesgo_arl debe estar entre 1 y 5")

    return {
        "salud_empleador": (base * Decimal("0.085")).quantize(
            Decimal("0.01"), rounding=ROUND_HALF_UP
        ),
        "pension_empleador": (base * Decimal("0.12")).quantize(
            Decimal("0.01"), rounding=ROUND_HALF_UP
        ),
        "arl": (base * tasas_arl[clase_riesgo_arl]).quantize(
            Decimal("0.01"), rounding=ROUND_HALF_UP
        ),
        "caja_compensacion": (base * Decimal("0.04")).quantize(
            Decimal("0.01"), rounding=ROUND_HALF_UP
        ),
        "sena": (base * Decimal("0.02")).quantize(
            Decimal("0.01"), rounding=ROUND_HALF_UP
        ),
        "icbf": (base * Decimal("0.03")).quantize(
            Decimal("0.01"), rounding=ROUND_HALF_UP
        ),
    }
