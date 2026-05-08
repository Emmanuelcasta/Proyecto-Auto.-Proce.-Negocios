"""
Router de marcaciones — endpoints de asistencia.

Endpoints:
- POST /marcaciones/form      → Recibe marcaciones desde Make (auth: API key)
- GET  /marcaciones            → Lista marcaciones con filtros (auth: JWT)
- POST /marcaciones/correccion → Corrección manual (auth: JWT, rol: ADMIN)
- GET  /marcaciones/resumen    → Resumen de horas por empleado y periodo (auth: JWT)
"""

import logging
from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, Header, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.database import get_db
from app.middleware.auth import get_current_user, require_rol
from app.models.usuario import Usuario, RolUsuario
from app.schemas.marcacion import (
    MarcacionFormSchema,
    MarcacionCorreccionSchema,
    MarcacionResponse,
    MarcacionListResponse,
    MarcacionResumenResponse,
)
from app.services.marcaciones import (
    registrar_marcacion,
    corregir_marcacion,
    listar_marcaciones,
    obtener_resumen,
)
from app.utils.exceptions import UnauthorizedException

logger = logging.getLogger("sysclock")
settings = get_settings()

router = APIRouter(prefix="/marcaciones", tags=["Marcaciones"])


# ── Dependency: validar API key de Make ────────────────────────────

async def verify_make_api_key(
    x_make_api_key: str = Header(..., alias="X-Make-Api-Key"),
) -> str:
    """
    Valida el header X-Make-Api-Key enviado por Make.
    No usa JWT porque Make no maneja tokens de refresco.
    """
    if not settings.MAKE_API_KEY:
        raise UnauthorizedException(
            "API key de Make no configurada en el servidor."
        )
    if x_make_api_key != settings.MAKE_API_KEY:
        raise UnauthorizedException("API key de Make inválida.")
    return x_make_api_key


# ── POST /marcaciones/form — Recibe desde Make ────────────────────

@router.post("/form", summary="Registrar marcación desde Google Forms (via Make)")
async def registrar_desde_form(
    data: MarcacionFormSchema,
    _api_key: str = Depends(verify_make_api_key),
    db: AsyncSession = Depends(get_db),
):
    """
    Endpoint que recibe marcaciones de Make (Google Sheets → Make → Backend).

    Protegido con API key fija en header `X-Make-Api-Key`.
    Aplica lógica de toggle entrada/salida con todas las validaciones.
    """
    result = await registrar_marcacion(db, data)
    return result


# ── GET /marcaciones — Listar con filtros ──────────────────────────

@router.get(
    "",
    response_model=MarcacionListResponse,
    summary="Listar marcaciones con filtros",
)
async def listar(
    empleado_id: Optional[int] = Query(None, description="Filtrar por empleado"),
    fecha_inicio: Optional[date] = Query(None, description="Fecha inicio (YYYY-MM-DD)"),
    fecha_fin: Optional[date] = Query(None, description="Fecha fin (YYYY-MM-DD)"),
    _current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Lista marcaciones con filtros opcionales.
    Requiere autenticación JWT.
    """
    marcaciones = await listar_marcaciones(
        db,
        empleado_id=empleado_id,
        fecha_inicio=fecha_inicio,
        fecha_fin=fecha_fin,
    )
    return MarcacionListResponse(
        total=len(marcaciones),
        marcaciones=[MarcacionResponse.model_validate(m) for m in marcaciones],
    )


# ── POST /marcaciones/correccion — Corrección manual ──────────────

@router.post(
    "/correccion",
    response_model=MarcacionResponse,
    summary="Corregir marcación manualmente (solo ADMIN)",
)
async def corregir(
    data: MarcacionCorreccionSchema,
    current_user: Usuario = Depends(require_rol(RolUsuario.ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    """
    Corrección manual de una marcación existente.
    Solo ADMIN puede corregir. Requiere justificación obligatoria.
    Registra quién corrigió y cuándo (auditoría).
    """
    marcacion = await corregir_marcacion(db, data, current_user.id)
    return MarcacionResponse.model_validate(marcacion)


# ── GET /marcaciones/resumen — Resumen por periodo ────────────────

@router.get(
    "/resumen",
    response_model=MarcacionResumenResponse,
    summary="Resumen de horas por empleado y periodo",
)
async def resumen(
    empleado_id: int = Query(..., description="ID del empleado"),
    fecha_inicio: date = Query(..., description="Fecha inicio (YYYY-MM-DD)"),
    fecha_fin: date = Query(..., description="Fecha fin (YYYY-MM-DD)"),
    _current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Retorna resumen de horas trabajadas, días y marcaciones incompletas.
    Requiere autenticación JWT.
    """
    data = await obtener_resumen(db, empleado_id, fecha_inicio, fecha_fin)
    return MarcacionResumenResponse(**data)
