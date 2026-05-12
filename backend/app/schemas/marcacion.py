"""
Schemas Pydantic v2 para marcaciones.
Define los contratos de request/response del módulo de asistencia.
"""

from datetime import date, datetime
from decimal import Decimal
from typing import Literal, Optional
from zoneinfo import ZoneInfo

from pydantic import BaseModel, Field, ConfigDict, field_validator


# ── Request: desde Make (Google Forms) ─────────────────────────────

class MarcacionFormSchema(BaseModel):
    empleado_id: int = Field(..., gt=0, examples=[1])
    tipo: Literal["ENTRADA", "SALIDA"] = Field(
        ..., description="Tipo de marca: ENTRADA o SALIDA",
        examples=["ENTRADA"]
    )
    timestamp: datetime = Field(
        ..., description="Momento exacto del envío del formulario (con zona horaria)",
        examples=["2026-05-04T06:02:00-05:00"]
    )

    @field_validator("timestamp", mode="before")
    @classmethod
    def parse_timestamp(cls, v):
        if isinstance(v, datetime):
            if v.tzinfo is None:
                return v.replace(tzinfo=ZoneInfo("America/Bogota"))
            return v
        for fmt in [
            "%d/%m/%Y %H:%M:%S",
            "%m/%d/%Y %H:%M:%S",
            "%Y-%m-%dT%H:%M:%S%z",
            "%Y-%m-%dT%H:%M:%S",
        ]:
            try:
                dt = datetime.strptime(str(v), fmt)
                return dt.replace(tzinfo=ZoneInfo("America/Bogota"))
            except ValueError:
                continue
        raise ValueError(f"Formato de fecha no reconocido: {v}")


# ── Request: corrección manual (ADMIN) ─────────────────────────────

class MarcacionCorreccionSchema(BaseModel):
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
    empleado_nombre: Optional[str] = None


class MarcacionListResponse(BaseModel):
    total: int
    marcaciones: list[MarcacionResponse]


class MarcacionResumenResponse(BaseModel):
    empleado_id: int
    empleado_nombre: str
    fecha_inicio: date
    fecha_fin: date
    dias_trabajados: int
    total_horas: Decimal
    marcaciones_incompletas: int