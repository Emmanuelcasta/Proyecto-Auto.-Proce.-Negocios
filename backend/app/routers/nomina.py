"""
Router de nómina.

Endpoints base:
- POST /nomina/liquidar
- GET  /nomina/{id}
"""

from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from io import BytesIO

from app.database import get_db
from app.middleware.auth import require_rol
from app.models.usuario import RolUsuario, Usuario
from app.schemas.nomina import NominaLiquidarRequest, NominaResponse, NominaListResponse
from app.services.liquidacion import (
    liquidar_quincena_base,
    obtener_nomina_por_id,
    aprobar_nomina,
    marcar_nomina_pagada,
    historial_nomina,
)
from app.services.documento import generar_comprobante_docx

router = APIRouter(prefix="/nomina", tags=["Nómina"])


@router.post("/liquidar", response_model=NominaResponse, status_code=201)
async def liquidar_quincena(
    data: NominaLiquidarRequest,
    _current_user: Usuario = Depends(require_rol(RolUsuario.ADMIN, RolUsuario.CONTADOR)),
    db: AsyncSession = Depends(get_db),
) -> NominaResponse:
    """Genera una liquidación quincenal en estado BORRADOR."""
    nomina = await liquidar_quincena_base(
        db=db,
        empleado_id=data.empleado_id,
        fecha_inicio=data.fecha_inicio,
        fecha_fin=data.fecha_fin,
    )
    return NominaResponse.model_validate(nomina)


@router.get("/historial", response_model=NominaListResponse)
async def historial(
    empleado_id: int | None = Query(None, gt=0),
    _current_user: Usuario = Depends(require_rol(RolUsuario.ADMIN, RolUsuario.CONTADOR)),
    db: AsyncSession = Depends(get_db),
) -> NominaListResponse:
    """Lista el historial de nóminas, opcionalmente por empleado."""
    nominas = await historial_nomina(db, empleado_id=empleado_id)
    return NominaListResponse(
        total=len(nominas),
        nominas=[NominaResponse.model_validate(n) for n in nominas],
    )


@router.get("/{nomina_id}", response_model=NominaResponse)
async def obtener_nomina(
    nomina_id: int,
    _current_user: Usuario = Depends(require_rol(RolUsuario.ADMIN, RolUsuario.CONTADOR)),
    db: AsyncSession = Depends(get_db),
) -> NominaResponse:
    """Obtiene una nómina por id."""
    nomina = await obtener_nomina_por_id(db, nomina_id)
    return NominaResponse.model_validate(nomina)


@router.put("/{nomina_id}/aprobar", response_model=NominaResponse)
async def aprobar(
    nomina_id: int,
    current_user: Usuario = Depends(require_rol(RolUsuario.ADMIN)),
    db: AsyncSession = Depends(get_db),
) -> NominaResponse:
    """Aprueba una nómina en BORRADOR (solo ADMIN)."""
    nomina = await aprobar_nomina(db, nomina_id, current_user.id)
    return NominaResponse.model_validate(nomina)


@router.put("/{nomina_id}/marcar-pagado", response_model=NominaResponse)
async def marcar_pagado(
    nomina_id: int,
    _current_user: Usuario = Depends(require_rol(RolUsuario.ADMIN, RolUsuario.CONTADOR)),
    db: AsyncSession = Depends(get_db),
) -> NominaResponse:
    """Marca una nómina APROBADA como PAGADO."""
    nomina = await marcar_nomina_pagada(db, nomina_id)
    return NominaResponse.model_validate(nomina)


@router.get("/{nomina_id}/comprobante")
async def descargar_comprobante(
    nomina_id: int,
    _current_user: Usuario = Depends(require_rol(RolUsuario.ADMIN, RolUsuario.CONTADOR)),
    db: AsyncSession = Depends(get_db),
):
    """Genera y descarga el comprobante DOCX de una nómina."""
    nomina = await obtener_nomina_por_id(db, nomina_id)
    contenido = generar_comprobante_docx(nomina)
    filename = f"comprobante_nomina_{nomina.id}.docx"
    return StreamingResponse(
        BytesIO(contenido),
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
