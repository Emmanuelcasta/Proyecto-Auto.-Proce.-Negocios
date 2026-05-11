"""
Modelo de nómina por periodo quincenal.
"""

from datetime import date, datetime, timezone
from decimal import Decimal

from sqlalchemy import Date, DateTime, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Nomina(Base):
    """Tabla de cabecera de liquidación de nómina."""

    __tablename__ = "nomina"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    empleado_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("empleados.id"), nullable=False, index=True
    )
    fecha_inicio: Mapped[date] = mapped_column(Date, nullable=False)
    fecha_fin: Mapped[date] = mapped_column(Date, nullable=False)

    dias_habiles_quincena: Mapped[int] = mapped_column(Integer, nullable=False)
    dias_habiles_mes: Mapped[int] = mapped_column(Integer, nullable=False)
    umbral_horas: Mapped[Decimal] = mapped_column(Numeric(8, 2), nullable=False)
    total_horas_trabajadas: Mapped[Decimal] = mapped_column(Numeric(8, 2), nullable=False)

    estado: Mapped[str] = mapped_column(String(20), nullable=False, default="BORRADOR")

    total_devengado: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    total_deducciones: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    neto_pagar: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)

    aprobado_por: Mapped[int | None] = mapped_column(Integer, ForeignKey("usuarios.id"), nullable=True)
    aprobado_en: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    creado_en: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    empleado = relationship("Empleado", lazy="selectin")
    detalles = relationship("DetalleNomina", back_populates="nomina", cascade="all, delete-orphan", lazy="selectin")

    def __repr__(self) -> str:
        return f"<Nomina(id={self.id}, empleado_id={self.empleado_id}, periodo={self.fecha_inicio}..{self.fecha_fin})>"
