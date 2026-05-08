"""
Router de reportes — PILA, Resumen Mes y Horas Extra.
"""

from datetime import date
from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.usuario import Usuario, RolUsuario
from app.middleware.auth import require_rol
from app.services import reportes as reportes_service

router = APIRouter(prefix="/reportes", tags=["Reportes"])


@router.get("/pila", dependencies=[Depends(require_rol(RolUsuario.ADMIN, RolUsuario.CONTADOR))])
async def descargar_pila(
    periodo: str = Query(..., description="Periodo en formato YYYY-MM"),
    db: AsyncSession = Depends(get_db)
):
    """Genera y descarga el archivo Excel para la planilla PILA."""
    excel_buffer = await reportes_service.generar_excel_pila(db, periodo)
    
    headers = {
        'Content-Disposition': f'attachment; filename="PILA_{periodo}.xlsx"',
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    }
    return Response(content=excel_buffer.getvalue(), headers=headers)


@router.get("/resumen-mes", dependencies=[Depends(require_rol(RolUsuario.ADMIN, RolUsuario.CONTADOR))])
async def obtener_resumen_mes(
    year: int = Query(..., ge=2024),
    month: int = Query(..., ge=1, le=12),
    db: AsyncSession = Depends(get_db)
):
    """Obtiene resumen de costos de nómina para un mes específico."""
    return await reportes_service.obtener_resumen_mes(db, year, month)


@router.get("/horas-extra", dependencies=[Depends(require_rol(RolUsuario.ADMIN, RolUsuario.CONTADOR))])
async def obtener_horas_extra(
    fecha_inicio: date = Query(...),
    fecha_fin: date = Query(...),
    db: AsyncSession = Depends(get_db)
):
    """Obtiene detalle de horas extra en un rango de fechas."""
    return await reportes_service.obtener_reporte_horas_extra(db, fecha_inicio, fecha_fin)
