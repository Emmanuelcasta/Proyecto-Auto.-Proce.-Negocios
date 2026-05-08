"""
Servicio de calendario — festivos y días hábiles.

Implementa:
- Lista de festivos Colombia 2026 (por defecto, se leen de la DB en producción)
- Verificación si una fecha es festivo o dominical
- Conteo de días hábiles (lunes a sábado, sin festivos)
- Obtener festivos desde la tabla configuracion de la DB

Definición: Día hábil = lunes a sábado que NO sea festivo.
El domingo NUNCA es hábil.
"""

import json
import logging
from datetime import date, timedelta

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.configuracion import Configuracion

logger = logging.getLogger("sysclock")

# ── Festivos Colombia 2026 (valores por defecto) ──────────────────
# Estos se usan como fallback si la tabla configuracion no tiene datos.
# En producción se leen desde la DB y son editables desde el panel admin.

FESTIVOS_2026 = [
    date(2026, 1, 1),    # Año Nuevo
    date(2026, 1, 12),   # Día de los Reyes Magos
    date(2026, 3, 23),   # Día de San José
    date(2026, 4, 2),    # Jueves Santo
    date(2026, 4, 3),    # Viernes Santo
    date(2026, 5, 1),    # Día del Trabajo
    date(2026, 5, 18),   # Ascensión del Señor
    date(2026, 6, 8),    # Corpus Christi
    date(2026, 6, 15),   # Sagrado Corazón de Jesús
    date(2026, 6, 29),   # San Pedro y San Pablo
    date(2026, 7, 20),   # Día de la Independencia
    date(2026, 8, 7),    # Batalla de Boyacá
    date(2026, 8, 17),   # Asunción de la Virgen
    date(2026, 10, 12),  # Día de la Raza
    date(2026, 11, 2),   # Todos los Santos
    date(2026, 11, 16),  # Independencia de Cartagena
    date(2026, 12, 8),   # Inmaculada Concepción
    date(2026, 12, 25),  # Navidad
]


# ── Funciones puras (sin DB) ──────────────────────────────────────

def es_festivo(fecha: date, festivos: list[date]) -> bool:
    """Verifica si una fecha es festivo."""
    return fecha in festivos


def es_dominical(fecha: date) -> bool:
    """Verifica si una fecha es domingo (weekday 6)."""
    return fecha.weekday() == 6


def es_festivo_o_dominical(fecha: date, festivos: list[date]) -> bool:
    """Verifica si una fecha es festivo o domingo."""
    return es_dominical(fecha) or es_festivo(fecha, festivos)


def es_dia_habil(fecha: date, festivos: list[date]) -> bool:
    """
    Un día hábil es lunes a sábado que NO sea festivo.
    Domingo nunca es hábil.
    """
    if fecha.weekday() == 6:  # Domingo
        return False
    if fecha in festivos:
        return False
    return True


def contar_dias_habiles(
    fecha_inicio: date,
    fecha_fin: date,
    festivos: list[date],
) -> int:
    """
    Cuenta los días hábiles en un rango [fecha_inicio, fecha_fin].
    Día hábil = lunes(0) a sábado(5), excluyendo festivos.
    """
    total = 0
    fecha = fecha_inicio
    while fecha <= fecha_fin:
        if fecha.weekday() < 6 and fecha not in festivos:  # 0=lun...5=sáb
            total += 1
        fecha += timedelta(days=1)
    return total


def listar_dias_habiles(
    fecha_inicio: date,
    fecha_fin: date,
    festivos: list[date],
) -> list[date]:
    """
    Retorna la lista de fechas hábiles en un rango.
    Útil para iterar sobre los días que deberían tener marcación.
    """
    dias = []
    fecha = fecha_inicio
    while fecha <= fecha_fin:
        if fecha.weekday() < 6 and fecha not in festivos:
            dias.append(fecha)
        fecha += timedelta(days=1)
    return dias


# ── Funciones con DB ──────────────────────────────────────────────

async def obtener_festivos_db(db: AsyncSession) -> list[date]:
    """
    Obtiene la lista de festivos desde la tabla configuracion.
    Si no hay datos, retorna los festivos por defecto de 2026.
    """
    query = select(Configuracion).where(Configuracion.id == 1)
    result = await db.execute(query)
    config = result.scalars().first()

    if not config or not config.festivos:
        logger.warning(
            "No se encontraron festivos en la DB. Usando valores por defecto 2026."
        )
        return FESTIVOS_2026.copy()

    try:
        # Los festivos se guardan como JSON string: ["2026-01-01", "2026-01-12", ...]
        festivos_str = json.loads(config.festivos)
        return [date.fromisoformat(f) for f in festivos_str]
    except (json.JSONDecodeError, ValueError) as e:
        logger.error(f"Error al parsear festivos de la DB: {e}. Usando defaults.")
        return FESTIVOS_2026.copy()
