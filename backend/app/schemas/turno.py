"""
Schemas Pydantic v2 para turnos y ciclo de rotación.
"""

from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, Field, ConfigDict


# ── Request: crear ciclo ───────────────────────────────────────────

class CicloRotacionCreate(BaseModel):
    """Datos para crear un nuevo ciclo de rotación."""
    fecha_inicio_ciclo: date = Field(
        ..., description="Fecha de inicio del ciclo (debe ser un lunes)",
        examples=["2026-01-05"]
    )
    empleado_a_id: int = Field(..., gt=0, description="ID del empleado A")
    empleado_b_id: int = Field(..., gt=0, description="ID del empleado B")
    empleado_c_id: int = Field(..., gt=0, description="ID del empleado C")


# ── Response ───────────────────────────────────────────────────────

class CicloRotacionResponse(BaseModel):
    """Respuesta con datos del ciclo de rotación."""
    id: int
    fecha_inicio_ciclo: date
    empleado_a_id: int
    empleado_b_id: int
    empleado_c_id: int
    activo: bool
    creado_por: Optional[int] = None
    creado_en: datetime

    # Nombres de empleados (opcionales, se llenan en el router)
    empleado_a_nombre: Optional[str] = None
    empleado_b_nombre: Optional[str] = None
    empleado_c_nombre: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


# ── Response: turno de un empleado ─────────────────────────────────

class TurnoEmpleadoResponse(BaseModel):
    """Turno asignado a un empleado en una fecha específica."""
    empleado_id: int
    empleado_nombre: str
    letra: str = Field(..., description="Posición en el ciclo: A, B o C")
    turno: str = Field(..., description="TURNO_1 o TURNO_2")
    bloque: int = Field(..., description="Bloque del ciclo (1, 2 o 3)")


class TurnoSemanaResponse(BaseModel):
    """Turnos de todos los empleados para una semana."""
    semana_inicio: date = Field(..., description="Lunes de la semana consultada")
    semana_fin: date = Field(..., description="Sábado de la semana consultada")
    bloque: int = Field(..., description="Bloque del ciclo (1, 2 o 3)")
    empleados: list[TurnoEmpleadoResponse]
