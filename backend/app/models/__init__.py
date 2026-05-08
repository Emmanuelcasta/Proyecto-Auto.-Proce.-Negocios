"""
Re-exporta todos los modelos para que Alembic los detecte con autogenerate.
"""

from app.models.usuario import Usuario  # noqa: F401
from app.models.empleado import Empleado  # noqa: F401
from app.models.configuracion import Configuracion  # noqa: F401
from app.models.marcacion import Marcacion  # noqa: F401
from app.models.turno import CicloRotacion  # noqa: F401
from app.models.nomina import Nomina  # noqa: F401
from app.models.detalle_nomina import DetalleNomina  # noqa: F401

__all__ = [
    "Usuario",
    "Empleado",
    "Configuracion",
    "Marcacion",
    "CicloRotacion",
    "Nomina",
    "DetalleNomina",
]
