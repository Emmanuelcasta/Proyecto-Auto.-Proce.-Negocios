"""
Router de turnos — endpoints del ciclo de rotación.

Endpoints:
- GET  /turnos/ciclo   → Configuración del ciclo activo
- POST /turnos/ciclo   → Crear nuevo ciclo (ADMIN)
- GET  /turnos/semana   → Turno de cada empleado en una semana
"""

import logging
from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth import get_current_user, require_rol
from app.models.usuario import Usuario, RolUsuario
from app.schemas.turno import (
    CicloRotacionCreate,
    CicloRotacionResponse,
    TurnoSemanaResponse,
)
from app.services.turnos import (
    obtener_ciclo_activo,
    crear_ciclo,
    obtener_turnos_semana,
)

logger = logging.getLogger("sysclock")

router = APIRouter(prefix="/turnos", tags=["Turnos"])


# ── GET /turnos/ciclo — Ciclo activo ──────────────────────────────

@router.get(
    "/ciclo",
    response_model=CicloRotacionResponse,
    summary="Obtener ciclo de rotación activo",
)
async def get_ciclo_activo(
    _current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Retorna la configuración del ciclo de rotación activo.
    Incluye los nombres de los empleados asignados a cada posición.
    """
    ciclo = await obtener_ciclo_activo(db)

    return CicloRotacionResponse(
        id=ciclo.id,
        fecha_inicio_ciclo=ciclo.fecha_inicio_ciclo,
        empleado_a_id=ciclo.empleado_a_id,
        empleado_b_id=ciclo.empleado_b_id,
        empleado_c_id=ciclo.empleado_c_id,
        activo=ciclo.activo,
        creado_por=ciclo.creado_por,
        creado_en=ciclo.creado_en,
        empleado_a_nombre=ciclo.empleado_a.nombre if ciclo.empleado_a else None,
        empleado_b_nombre=ciclo.empleado_b.nombre if ciclo.empleado_b else None,
        empleado_c_nombre=ciclo.empleado_c.nombre if ciclo.empleado_c else None,
    )


# ── POST /turnos/ciclo — Crear nuevo ciclo ────────────────────────

@router.post(
    "/ciclo",
    response_model=CicloRotacionResponse,
    summary="Crear nuevo ciclo de rotación (ADMIN)",
    status_code=201,
)
async def post_crear_ciclo(
    data: CicloRotacionCreate,
    current_user: Usuario = Depends(require_rol(RolUsuario.ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    """
    Crea un nuevo ciclo de rotación de turnos.
    Solo ADMIN puede crear ciclos.

    Validaciones:
    - La fecha de inicio debe ser un lunes
    - Los 3 empleados deben ser distintos y estar activos
    - Desactiva automáticamente el ciclo anterior
    """
    ciclo = await crear_ciclo(db, data, current_user.id)

    return CicloRotacionResponse(
        id=ciclo.id,
        fecha_inicio_ciclo=ciclo.fecha_inicio_ciclo,
        empleado_a_id=ciclo.empleado_a_id,
        empleado_b_id=ciclo.empleado_b_id,
        empleado_c_id=ciclo.empleado_c_id,
        activo=ciclo.activo,
        creado_por=ciclo.creado_por,
        creado_en=ciclo.creado_en,
        empleado_a_nombre=ciclo.empleado_a.nombre if ciclo.empleado_a else None,
        empleado_b_nombre=ciclo.empleado_b.nombre if ciclo.empleado_b else None,
        empleado_c_nombre=ciclo.empleado_c.nombre if ciclo.empleado_c else None,
    )


# ── GET /turnos/semana — Turnos de la semana ──────────────────────

@router.get(
    "/semana",
    response_model=TurnoSemanaResponse,
    summary="Consultar turnos de la semana",
)
async def get_turnos_semana(
    fecha: date = Query(
        ..., description="Cualquier fecha de la semana a consultar (YYYY-MM-DD)"
    ),
    _current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Retorna el turno de cada empleado para la semana que contiene la fecha dada.
    Calcula automáticamente el bloque del ciclo.
    """
    resultado = await obtener_turnos_semana(db, fecha)
    return TurnoSemanaResponse(**resultado)
