"""
Schemas Pydantic v2 para empleados.
Usa Decimal en lugar de float para valores monetarios.
"""

from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field, ConfigDict


class EmpleadoCreate(BaseModel):
    """Datos para crear un empleado."""
    nombre: str = Field(..., min_length=2, max_length=255, examples=["Juan Pérez"])
    documento: str = Field(..., min_length=5, max_length=50, examples=["1234567890"])
    salario: Decimal = Field(..., gt=0, decimal_places=2, examples=["1423500.00"])


class EmpleadoUpdate(BaseModel):
    """Datos para actualizar un empleado (todos opcionales)."""
    nombre: Optional[str] = Field(None, min_length=2, max_length=255)
    documento: Optional[str] = Field(None, min_length=5, max_length=50)
    salario: Optional[Decimal] = Field(None, gt=0, decimal_places=2)


class EmpleadoResponse(BaseModel):
    """Respuesta con datos de un empleado."""
    id: int
    nombre: str
    documento: str
    salario: Decimal
    activo: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class EmpleadoListResponse(BaseModel):
    """Respuesta con lista paginada de empleados."""
    total: int
    empleados: list[EmpleadoResponse]
