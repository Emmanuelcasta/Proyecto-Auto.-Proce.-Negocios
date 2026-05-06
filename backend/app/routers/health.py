"""
Endpoint de salud para UptimeRobot y Railway health checks.
NO requiere autenticación.
"""

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(tags=["Health"])


class HealthResponse(BaseModel):
    status: str


@router.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    """
    Endpoint de salud del sistema.

    Retorna {"status": "ok"} si el servidor está funcionando.
    Usado por UptimeRobot para monitoreo y Railway para health checks.
    """
    return HealthResponse(status="ok")
