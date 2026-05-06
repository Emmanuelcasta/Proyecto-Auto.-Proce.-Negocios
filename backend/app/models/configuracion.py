"""
Modelo de Configuración global del sistema.
Contiene parámetros de nómina colombiana: SMMLV, auxilio de transporte, festivos.
"""

from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy import (
    DateTime,
    Integer,
    Numeric,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Configuracion(Base):
    """
    Tabla de configuración global del sistema.
    Debe tener exactamente 1 registro (singleton en DB).
    """

    __tablename__ = "configuracion"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    smmlv: Mapped[Decimal] = mapped_column(
        Numeric(precision=12, scale=2),
        nullable=False,
        default=Decimal("1423500.00"),
        comment="Salario Mínimo Mensual Legal Vigente 2026",
    )
    auxilio_transporte: Mapped[Decimal] = mapped_column(
        Numeric(precision=12, scale=2),
        nullable=False,
        default=Decimal("200000.00"),
        comment="Auxilio de transporte mensual 2026",
    )
    festivos: Mapped[str] = mapped_column(
        Text,
        nullable=False,
        default="[]",
        comment="Lista de fechas festivas en formato JSON: ['2026-01-01', '2026-01-12', ...]",
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    def __repr__(self) -> str:
        return f"<Configuracion(id={self.id}, smmlv={self.smmlv})>"
