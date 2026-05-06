"""
Schemas Pydantic v2 para configuración global del sistema.
"""

import json
from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field, ConfigDict, field_validator


class ConfiguracionUpdate(BaseModel):
    """Datos para actualizar la configuración (todos opcionales)."""
    smmlv: Optional[Decimal] = Field(None, gt=0, decimal_places=2)
    auxilio_transporte: Optional[Decimal] = Field(None, gt=0, decimal_places=2)
    festivos: Optional[list[str]] = Field(
        None,
        examples=[["2026-01-01", "2026-01-12", "2026-03-23"]],
    )

    @field_validator("festivos", mode="before")
    @classmethod
    def validar_festivos(cls, v: list[str] | None) -> list[str] | None:
        """Valida que las fechas festivas tengan formato correcto."""
        if v is None:
            return v
        from datetime import date
        for fecha in v:
            try:
                date.fromisoformat(fecha)
            except (ValueError, TypeError):
                raise ValueError(f"Fecha festiva inválida: '{fecha}'. Formato esperado: YYYY-MM-DD")
        return v


class ConfiguracionResponse(BaseModel):
    """Respuesta con la configuración global."""
    id: int
    smmlv: Decimal
    auxilio_transporte: Decimal
    festivos: list[str]
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

    @field_validator("festivos", mode="before")
    @classmethod
    def parse_festivos(cls, v: str | list) -> list[str]:
        """Convierte el campo JSON text a lista de Python."""
        if isinstance(v, str):
            try:
                return json.loads(v)
            except json.JSONDecodeError:
                return []
        return v
