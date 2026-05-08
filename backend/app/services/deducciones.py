"""
Servicio de deducciones del empleado.
"""

from decimal import Decimal, ROUND_HALF_UP


def calcular_deducciones(salario_basico_proporcional: Decimal) -> dict:
    """
    Base de deducciones:
    - solo salario básico proporcional
    - no incluye extras, recargos ni auxilio
    - sin retención en la fuente
    """
    base = salario_basico_proporcional
    return {
        "salud_empleado": (base * Decimal("0.04")).quantize(
            Decimal("0.01"), rounding=ROUND_HALF_UP
        ),
        "pension_empleado": (base * Decimal("0.04")).quantize(
            Decimal("0.01"), rounding=ROUND_HALF_UP
        ),
    }


def calcular_auxilio(
    salario_mensual: Decimal,
    dias_quincena: int,
    dias_mes: int,
    smmlv: Decimal,
    auxilio_base: Decimal,
) -> Decimal:
    """
    Calcula auxilio de transporte proporcional si el salario cumple condición:
    salario_mensual <= 2 * smmlv
    """
    if salario_mensual <= smmlv * Decimal("2"):
        return (
            auxilio_base * Decimal(str(dias_quincena)) / Decimal(str(dias_mes))
        ).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    return Decimal("0.00")
