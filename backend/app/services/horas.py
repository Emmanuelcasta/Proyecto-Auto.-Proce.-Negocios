"""
Servicio de horas.

Incluye lógica para:
- valor hora ordinaria
- umbral de horas ordinarias por quincena
- separación de horas ordinarias vs extras
- cálculo de horas nocturnas para TURNO_2 (L-V, 7pm-10pm)
"""

from datetime import datetime, time
from decimal import Decimal, ROUND_HALF_UP

from app.utils.fechas import BOGOTA_TZ

# 7h20min x 30 días = 220 horas efectivas/mes
DIVISOR_HORA = Decimal("220")
JORNADA_EFECTIVA = Decimal("7.3333")

INICIO_NOCTURNO = time(19, 0)  # 7:00 pm
FIN_NOCTURNO = time(22, 0)  # 10:00 pm


def valor_hora_ordinaria(salario_mensual: Decimal) -> Decimal:
    """Calcula el valor de la hora ordinaria con divisor 220."""
    return (salario_mensual / DIVISOR_HORA).quantize(
        Decimal("0.0001"), rounding=ROUND_HALF_UP
    )


def calcular_umbral_quincena(dias_habiles: int) -> Decimal:
    """
    Máximo de horas ordinarias permitidas en la quincena.
    Ejemplo: 12 días hábiles -> 87.9996 ~= 88.00
    """
    return (Decimal(str(dias_habiles)) * JORNADA_EFECTIVA).quantize(
        Decimal("0.01"), rounding=ROUND_HALF_UP
    )


def separar_ordinarias_y_extras(total_horas: Decimal, umbral: Decimal) -> tuple[Decimal, Decimal]:
    """Separa el total en horas ordinarias y horas extra."""
    if total_horas <= umbral:
        return total_horas.quantize(Decimal("0.01")), Decimal("0.00")
    return umbral.quantize(Decimal("0.01")), (total_horas - umbral).quantize(Decimal("0.01"))


def calcular_horas_nocturnas(marcacion, turno: str) -> Decimal:
    """
    Calcula horas nocturnas para una marcación.

    Reglas:
    - Solo aplica a TURNO_2
    - Solo lunes a viernes
    - Solo tramo 19:00-22:00
    """
    if turno != "TURNO_2":
        return Decimal("0.00")

    # 5 = sábado, 6 = domingo
    if marcacion.fecha.weekday() >= 5:
        return Decimal("0.00")

    if not marcacion.timestamp_entrada or not marcacion.timestamp_salida:
        return Decimal("0.00")

    entrada_bogota = marcacion.timestamp_entrada.astimezone(BOGOTA_TZ)
    salida_bogota = marcacion.timestamp_salida.astimezone(BOGOTA_TZ)

    inicio_banda = datetime.combine(marcacion.fecha, INICIO_NOCTURNO, tzinfo=BOGOTA_TZ)
    fin_banda = datetime.combine(marcacion.fecha, FIN_NOCTURNO, tzinfo=BOGOTA_TZ)

    inicio = max(entrada_bogota, inicio_banda)
    fin = min(salida_bogota, fin_banda)

    if fin <= inicio:
        return Decimal("0.00")

    horas = Decimal(str((fin - inicio).total_seconds() / 3600))
    return horas.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
