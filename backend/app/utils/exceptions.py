"""
Excepciones personalizadas y handler global.
Asegura que nunca se exponga un stacktrace al cliente.
"""

from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from starlette.status import HTTP_500_INTERNAL_SERVER_ERROR
import logging

logger = logging.getLogger("sysclock")


class SysClockException(Exception):
    """Excepción base del sistema SysClock."""

    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(message)


class NotFoundException(SysClockException):
    """Recurso no encontrado."""

    def __init__(self, resource: str = "Recurso", resource_id: int | str = ""):
        super().__init__(
            message=f"{resource} con id '{resource_id}' no encontrado.",
            status_code=404,
        )


class DuplicateException(SysClockException):
    """Registro duplicado."""

    def __init__(self, field: str = "registro"):
        super().__init__(
            message=f"Ya existe un registro con ese {field}.",
            status_code=409,
        )


class UnauthorizedException(SysClockException):
    """No autorizado."""

    def __init__(self, message: str = "Credenciales inválidas."):
        super().__init__(message=message, status_code=401)


class ForbiddenException(SysClockException):
    """Acceso prohibido."""

    def __init__(self, message: str = "No tiene permisos para esta acción."):
        super().__init__(message=message, status_code=403)


# ── Handlers globales ──────────────────────────────────────────────


async def sysclock_exception_handler(request: Request, exc: SysClockException) -> JSONResponse:
    """Handler para excepciones propias del sistema."""
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.message},
    )


async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    """Handler para HTTPException de FastAPI."""
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )


async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    Handler catch-all para excepciones no manejadas.
    Loguea el error pero NO expone el stacktrace al cliente.
    """
    logger.error(f"Error no manejado: {exc}", exc_info=True)
    return JSONResponse(
        status_code=HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Error interno del servidor. Contacte al administrador."},
    )
