"""
Modelo de Marcación (registro de asistencia).
Cada registro representa un día de trabajo de un empleado:
entrada, salida y horas efectivas calculadas.
"""

from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy import (
    Date,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Marcacion(Base):
    """
    Tabla de marcaciones (asistencia diaria).
    Un registro por empleado por día.
    """

    __tablename__ = "marcaciones"
    __table_args__ = (
        UniqueConstraint("empleado_id", "fecha", name="idx_marcacion_empleado_fecha"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    empleado_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("empleados.id"), nullable=False, index=True
    )

    fecha: Mapped[datetime] = mapped_column(Date, nullable=False)

    timestamp_entrada: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    timestamp_salida: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    horas_efectivas: Mapped[Decimal | None] = mapped_column(
        Numeric(precision=5, scale=2), nullable=True
    )

    fuente: Mapped[str] = mapped_column(
        String(20), default="FORM", nullable=False,
        comment="Origen: FORM (Google Forms via Make) o MANUAL (corrección admin)"
    )

    corregido_por: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("usuarios.id"), nullable=True
    )

    nota_correccion: Mapped[str | None] = mapped_column(Text, nullable=True)

    creado_en: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # ── Relaciones ─────────────────────────────────────────────────
    empleado = relationship("Empleado", lazy="selectin")

    def __repr__(self) -> str:
        return (
            f"<Marcacion(id={self.id}, empleado_id={self.empleado_id}, "
            f"fecha={self.fecha}, horas={self.horas_efectivas})>"
        )
