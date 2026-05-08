"""
Utilidades de fechas — helpers para quincenas, rangos y zona horaria.

Todas las fechas se manejan en zona horaria America/Bogota (UTC-5).
Los timestamps se guardan en UTC en la DB y se convierten a Bogotá
solo en el frontend y en los documentos generados.
"""

from datetime import date, datetime, timedelta
from calendar import monthrange
from zoneinfo import ZoneInfo

# ── Zona horaria de Colombia ──────────────────────────────────────
BOGOTA_TZ = ZoneInfo("America/Bogota")


# ── Quincenas ─────────────────────────────────────────────────────

def get_rango_quincena(year: int, month: int, quincena: int) -> tuple[date, date]:
    """
    Retorna (fecha_inicio, fecha_fin) de una quincena.

    Args:
        year: Año (e.g., 2026).
        month: Mes (1-12).
        quincena: 1 (día 1 al 15) o 2 (día 16 al último día del mes).

    Returns:
        Tupla (fecha_inicio, fecha_fin) inclusive en ambos extremos.
    """
    if quincena == 1:
        return date(year, month, 1), date(year, month, 15)
    elif quincena == 2:
        ultimo_dia = monthrange(year, month)[1]
        return date(year, month, 16), date(year, month, ultimo_dia)
    else:
        raise ValueError(f"Quincena debe ser 1 o 2, recibido: {quincena}")


def identificar_quincena(fecha: date) -> tuple[int, int, int]:
    """
    Identifica a qué quincena pertenece una fecha.

    Returns:
        Tupla (year, month, quincena) donde quincena es 1 o 2.
    """
    quincena = 1 if fecha.day <= 15 else 2
    return fecha.year, fecha.month, quincena


# ── Rangos de mes ─────────────────────────────────────────────────

def get_rango_mes(year: int, month: int) -> tuple[date, date]:
    """
    Retorna (primer_dia, ultimo_dia) de un mes.
    """
    ultimo_dia = monthrange(year, month)[1]
    return date(year, month, 1), date(year, month, ultimo_dia)


# ── Conversión de zona horaria ────────────────────────────────────

def a_hora_bogota(dt: datetime) -> datetime:
    """Convierte un datetime (UTC o aware) a hora de Bogotá."""
    return dt.astimezone(BOGOTA_TZ)


def ahora_bogota() -> datetime:
    """Retorna la hora actual en Bogotá."""
    return datetime.now(BOGOTA_TZ)


def fecha_hoy_bogota() -> date:
    """Retorna la fecha de hoy en Bogotá."""
    return ahora_bogota().date()
