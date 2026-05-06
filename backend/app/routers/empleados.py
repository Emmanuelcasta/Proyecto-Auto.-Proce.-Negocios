"""
Router de empleados.
CRUD completo protegido por rol ADMIN.
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.usuario import Usuario, RolUsuario
from app.middleware.auth import require_rol
from app.schemas.empleado import (
    EmpleadoCreate,
    EmpleadoUpdate,
    EmpleadoResponse,
    EmpleadoListResponse,
)
from app.services import empleado_service

router = APIRouter(prefix="/empleados", tags=["Empleados"])


@router.get("", response_model=EmpleadoListResponse)
async def listar_empleados(
    skip: int = Query(0, ge=0, description="Registros a saltar"),
    limit: int = Query(100, ge=1, le=500, description="Cantidad máxima de registros"),
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(require_rol(RolUsuario.ADMIN)),
) -> EmpleadoListResponse:
    """Lista todos los empleados activos con paginación."""
    empleados, total = await empleado_service.listar_empleados(db, skip=skip, limit=limit)
    return EmpleadoListResponse(
        total=total,
        empleados=[EmpleadoResponse.model_validate(e) for e in empleados],
    )


@router.post("", response_model=EmpleadoResponse, status_code=201)
async def crear_empleado(
    datos: EmpleadoCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(require_rol(RolUsuario.ADMIN)),
) -> EmpleadoResponse:
    """
    Crea un nuevo empleado.

    - **nombre**: Nombre completo
    - **documento**: Número de documento (único)
    - **salario**: Salario mensual en COP (Decimal, no float)
    """
    empleado = await empleado_service.crear_empleado(db, datos)
    return EmpleadoResponse.model_validate(empleado)


@router.get("/{empleado_id}", response_model=EmpleadoResponse)
async def obtener_empleado(
    empleado_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(require_rol(RolUsuario.ADMIN)),
) -> EmpleadoResponse:
    """Obtiene un empleado por su ID."""
    empleado = await empleado_service.obtener_empleado(db, empleado_id)
    return EmpleadoResponse.model_validate(empleado)


@router.put("/{empleado_id}", response_model=EmpleadoResponse)
async def actualizar_empleado(
    empleado_id: int,
    datos: EmpleadoUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(require_rol(RolUsuario.ADMIN)),
) -> EmpleadoResponse:
    """Actualiza un empleado existente. Solo se modifican los campos proporcionados."""
    empleado = await empleado_service.actualizar_empleado(db, empleado_id, datos)
    return EmpleadoResponse.model_validate(empleado)


@router.delete("/{empleado_id}", response_model=EmpleadoResponse)
async def eliminar_empleado(
    empleado_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(require_rol(RolUsuario.ADMIN)),
) -> EmpleadoResponse:
    """
    Soft delete: marca al empleado como inactivo.
    El registro NO se elimina de la base de datos.
    """
    empleado = await empleado_service.eliminar_empleado(db, empleado_id)
    return EmpleadoResponse.model_validate(empleado)
