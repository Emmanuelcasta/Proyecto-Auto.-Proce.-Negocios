"""
Schemas Pydantic para liquidación de nómina.
"""

from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class NominaLiquidarRequest(BaseModel):
    empleado_id: int = Field(..., gt=0)
    fecha_inicio: date
    fecha_fin: date


class DetalleNominaResponse(BaseModel):
    concepto: str
    categoria: str
    horas: Decimal | None = None
    porcentaje: Decimal | None = None
    valor: Decimal


class NominaResponse(BaseModel):
    id: int
    empleado_id: int
    fecha_inicio: date
    fecha_fin: date
    dias_habiles_quincena: int
    dias_habiles_mes: int
    umbral_horas: Decimal
    total_horas_trabajadas: Decimal
    estado: str
    total_devengado: Decimal
    total_deducciones: Decimal
    neto_pagar: Decimal
    aprobado_por: int | None = None
    aprobado_en: datetime | None = None
    creado_en: datetime
    detalles: list[DetalleNominaResponse] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


class NominaListResponse(BaseModel):
    total: int
    nominas: list[NominaResponse]
