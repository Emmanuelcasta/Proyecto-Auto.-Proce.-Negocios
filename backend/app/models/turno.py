"""
Modelo de Ciclo de Rotación de Turnos.
Define la asignación de empleados a turnos con rotación automática
en ciclos de 6 semanas (3 bloques × 2 semanas).
"""

from datetime import date, datetime, timezone

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    ForeignKey,
    Integer,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class CicloRotacion(Base):
    """
    Tabla de configuración del ciclo de rotación de turnos.
    Solo puede haber 1 registro activo a la vez.

    Los 3 empleados se asignan como A, B, C.
    El sistema calcula automáticamente el turno de cada uno
    en cualquier fecha usando el algoritmo de bloques.
    """

    __tablename__ = "ciclo_rotacion"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    fecha_inicio_ciclo: Mapped[date] = mapped_column(
        Date, nullable=False,
        comment="Fecha de inicio del ciclo (debe ser un lunes)"
    )

    empleado_a_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("empleados.id"), nullable=False
    )

    empleado_b_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("empleados.id"), nullable=False
    )

    empleado_c_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("empleados.id"), nullable=False
    )

    activo: Mapped[bool] = mapped_column(
        Boolean, default=True, nullable=False,
        comment="Solo 1 registro activo a la vez"
    )

    creado_por: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("usuarios.id"), nullable=True
    )

    creado_en: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # ── Relaciones ─────────────────────────────────────────────────
    empleado_a = relationship("Empleado", foreign_keys=[empleado_a_id], lazy="selectin")
    empleado_b = relationship("Empleado", foreign_keys=[empleado_b_id], lazy="selectin")
    empleado_c = relationship("Empleado", foreign_keys=[empleado_c_id], lazy="selectin")

    def __repr__(self) -> str:
        return (
            f"<CicloRotacion(id={self.id}, inicio={self.fecha_inicio_ciclo}, "
            f"activo={self.activo})>"
        )
