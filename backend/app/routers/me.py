"""
Router para endpoints del empleado (Mi Nómina, Mi Asistencia).
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth import get_current_user
from app.models.usuario import Usuario
from app.schemas.nomina import NominaResponse, NominaListResponse
from app.schemas.marcacion import MarcacionListResponse, MarcacionResponse
from app.services.liquidacion import historial_nomina, obtener_nomina_por_id
from app.services.marcaciones import listar_marcaciones

router = APIRouter(tags=["Mi Nómina"])

@router.get("/mi-nomina", response_model=NominaListResponse)
async def mi_historial_nomina(
    current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Obtiene el historial de nóminas del empleado autenticado."""
    # En el modelo Usuario, empleado_id es la relación
    if not current_user.empleado_id:
        return NominaListResponse(total=0, nominas=[])
    
    nominas = await historial_nomina(db, empleado_id=current_user.empleado_id)
    return NominaListResponse(
        total=len(nominas),
        nominas=[NominaResponse.model_validate(n) for n in nominas]
    )

@router.get("/mi-nomina/{nomina_id}", response_model=NominaResponse)
async def mi_detalle_nomina(
    nomina_id: int,
    current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Obtiene el detalle de una nómina propia."""
    nomina = await obtener_nomina_por_id(db, nomina_id)
    # Validar que pertenezca al empleado
    if nomina.empleado_id != current_user.empleado_id:
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="No tiene permiso para ver esta nómina")
    
    return NominaResponse.model_validate(nomina)

@router.get("/mi-marcaciones", response_model=MarcacionListResponse)
async def mi_asistencia(
    current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Obtiene el historial de asistencia del empleado autenticado."""
    if not current_user.empleado_id:
        return MarcacionListResponse(total=0, marcaciones=[])
    
    marcaciones = await listar_marcaciones(db, empleado_id=current_user.empleado_id)
    return MarcacionListResponse(
        total=len(marcaciones),
        marcaciones=[MarcacionResponse.model_validate(m) for m in marcaciones]
    )
