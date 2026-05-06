"""
Router de configuración global del sistema.
Singleton: solo un registro en la tabla.
"""

import json

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.usuario import Usuario, RolUsuario
from app.models.configuracion import Configuracion
from app.middleware.auth import require_rol
from app.schemas.configuracion import ConfiguracionUpdate, ConfiguracionResponse
from app.utils.exceptions import NotFoundException

router = APIRouter(prefix="/configuracion", tags=["Configuración"])


async def _get_or_create_config(db: AsyncSession) -> Configuracion:
    """Obtiene la configuración, o crea una por defecto si no existe."""
    result = await db.execute(select(Configuracion).limit(1))
    config = result.scalar_one_or_none()
    if config is None:
        config = Configuracion()
        db.add(config)
        await db.flush()
        await db.refresh(config)
    return config


@router.get("", response_model=ConfiguracionResponse)
async def obtener_configuracion(
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(require_rol(RolUsuario.ADMIN)),
) -> ConfiguracionResponse:
    """Obtiene la configuración global del sistema."""
    config = await _get_or_create_config(db)
    return ConfiguracionResponse.model_validate(config)


@router.put("", response_model=ConfiguracionResponse)
async def actualizar_configuracion(
    datos: ConfiguracionUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(require_rol(RolUsuario.ADMIN)),
) -> ConfiguracionResponse:
    """
    Actualiza la configuración global del sistema.

    - **smmlv**: Salario Mínimo Mensual Legal Vigente
    - **auxilio_transporte**: Valor mensual del auxilio de transporte
    - **festivos**: Lista de fechas en formato YYYY-MM-DD
    """
    config = await _get_or_create_config(db)

    update_data = datos.model_dump(exclude_unset=True)

    # Convertir festivos (lista) a JSON string para almacenar en Text
    if "festivos" in update_data and update_data["festivos"] is not None:
        update_data["festivos"] = json.dumps(update_data["festivos"])

    for field, value in update_data.items():
        setattr(config, field, value)

    await db.flush()
    await db.refresh(config)
    return ConfiguracionResponse.model_validate(config)
