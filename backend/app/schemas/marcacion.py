"""
Schemas Pydantic v2 para marcaciones.
Define los contratos de request/response del módulo de asistencia.
"""

from datetime import date, datetime
from decimal import Decimal
from typing import Literal, Optional

from pydantic import BaseModel, Field, ConfigDict


# ── Request: desde Make (Google Forms) ─────────────────────────────

class MarcacionFormSchema(BaseModel):
    """
    Payload que envía Make al backend.
    Make extrae estos datos de Google Sheets y los envía via POST.
    """
    empleado_id: int = Field(..., gt=0, examples=[1])
    tipo: Literal["ENTRADA", "SALIDA"] = Field(
        ..., description="Tipo de marca: ENTRADA o SALIDA",
        examples=["ENTRADA"]
    )
    timestamp: datetime = Field(
        ..., description="Momento exacto del envío del formulario (con zona horaria)",
        examples=["2026-05-04T06:02:00-05:00"]
    )


# ── Request: corrección manual (ADMIN) ─────────────────────────────

class MarcacionCorreccionSchema(BaseModel):
    """
    Corrección manual de una marcación existente.
    Requiere justificación obligatoria.
    """
    marcacion_id: int = Field(..., gt=0)
    timestamp_entrada: Optional[datetime] = Field(
        None, description="Nueva hora de entrada (opcional)"
    )
    timestamp_salida: Optional[datetime] = Field(
        None, description="Nueva hora de salida (opcional)"
    )
    nota_correccion: str = Field(
        ..., min_length=10, max_length=500,
        description="Justificación obligatoria de la corrección",
        examples=["Empleado olvidó marcar salida. Se verifica con cámaras."]
    )


# ── Response ───────────────────────────────────────────────────────

class MarcacionResponse(BaseModel):
    """Respuesta con datos completos de una marcación."""
    id: int
    empleado_id: int
    fecha: date
    timestamp_entrada: Optional[datetime] = None
    timestamp_salida: Optional[datetime] = None
    horas_efectivas: Optional[Decimal] = None
    fuente: str
    corregido_por: Optional[int] = None
    nota_correccion: Optional[str] = None
    creado_en: datetime

    model_config = ConfigDict(from_attributes=True)


class MarcacionConEmpleadoResponse(MarcacionResponse):
    """Marcación con nombre del empleado incluido."""
    empleado_nombre: Optional[str] = None


class MarcacionListResponse(BaseModel):
    """Respuesta con lista de marcaciones."""
    total: int
    marcaciones: list[MarcacionResponse]


class MarcacionResumenResponse(BaseModel):
    """Resumen de horas trabajadas por empleado en un periodo."""
    empleado_id: int
    empleado_nombre: str
    fecha_inicio: date
    fecha_fin: date
    dias_trabajados: int
    total_horas: Decimal
    marcaciones_incompletas: int
