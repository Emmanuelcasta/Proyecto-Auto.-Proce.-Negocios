"""
Servicio CRUD de empleados.
Todas las operaciones son async.
"""

import json
from decimal import Decimal

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.empleado import Empleado
from app.schemas.empleado import EmpleadoCreate, EmpleadoUpdate
from app.utils.exceptions import NotFoundException, DuplicateException


async def listar_empleados(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 100,
    solo_activos: bool = True,
) -> tuple[list[Empleado], int]:
    """Lista empleados con paginación."""
    query = select(Empleado)
    count_query = select(func.count(Empleado.id))

    if solo_activos:
        query = query.where(Empleado.activo == True)  # noqa: E712
        count_query = count_query.where(Empleado.activo == True)  # noqa: E712

    # Total
    total_result = await db.execute(count_query)
    total = total_result.scalar_one()

    # Datos paginados
    query = query.offset(skip).limit(limit).order_by(Empleado.id)
    result = await db.execute(query)
    empleados = list(result.scalars().all())

    return empleados, total


async def obtener_empleado(db: AsyncSession, empleado_id: int) -> Empleado:
    """Obtiene un empleado por ID."""
    result = await db.execute(
        select(Empleado).where(Empleado.id == empleado_id, Empleado.activo == True)  # noqa: E712
    )
    empleado = result.scalar_one_or_none()
    if not empleado:
        raise NotFoundException("Empleado", empleado_id)
    return empleado


async def crear_empleado(db: AsyncSession, datos: EmpleadoCreate) -> Empleado:
    """Crea un nuevo empleado."""
    # Verificar documento único
    existente = await db.execute(
        select(Empleado).where(Empleado.documento == datos.documento)
    )
    if existente.scalar_one_or_none():
        raise DuplicateException("documento")

    empleado = Empleado(
        nombre=datos.nombre,
        documento=datos.documento,
        salario=datos.salario,
    )
    db.add(empleado)
    await db.flush()
    await db.refresh(empleado)
    return empleado


async def actualizar_empleado(
    db: AsyncSession,
    empleado_id: int,
    datos: EmpleadoUpdate,
) -> Empleado:
    """Actualiza un empleado existente."""
    empleado = await obtener_empleado(db, empleado_id)

    # Verificar documento único si se cambió
    if datos.documento and datos.documento != empleado.documento:
        existente = await db.execute(
            select(Empleado).where(
                Empleado.documento == datos.documento,
                Empleado.id != empleado_id,
            )
        )
        if existente.scalar_one_or_none():
            raise DuplicateException("documento")

    # Aplicar cambios (solo campos proporcionados)
    update_data = datos.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(empleado, field, value)

    await db.flush()
    await db.refresh(empleado)
    return empleado


async def eliminar_empleado(db: AsyncSession, empleado_id: int) -> Empleado:
    """Soft delete: marca el empleado como inactivo."""
    empleado = await obtener_empleado(db, empleado_id)
    empleado.activo = False
    await db.flush()
    await db.refresh(empleado)
    return empleado
