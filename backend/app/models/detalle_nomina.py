"""
Modelo de detalle de nómina por concepto.
"""

from decimal import Decimal

from sqlalchemy import ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class DetalleNomina(Base):
    """Tabla de detalle de conceptos de una liquidación."""

    __tablename__ = "detalle_nomina"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    nomina_id: Mapped[int] = mapped_column(Integer, ForeignKey("nomina.id"), nullable=False, index=True)

    concepto: Mapped[str] = mapped_column(String(80), nullable=False)
    categoria: Mapped[str] = mapped_column(String(30), nullable=False)
    horas: Mapped[Decimal | None] = mapped_column(Numeric(8, 2), nullable=True)
    porcentaje: Mapped[Decimal | None] = mapped_column(Numeric(6, 4), nullable=True)
    valor: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)

    nomina = relationship("Nomina", back_populates="detalles")

    def __repr__(self) -> str:
        return f"<DetalleNomina(id={self.id}, concepto={self.concepto}, valor={self.valor})>"
