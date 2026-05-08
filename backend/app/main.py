"""
SysClock Nómina — Backend Principal
Sistema de gestión de nómina para Colombia 2026.

Punto de entrada de la aplicación FastAPI.
"""

import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import AsyncSessionLocal
from app.utils.exceptions import (
    SysClockException,
    sysclock_exception_handler,
    http_exception_handler,
    generic_exception_handler,
)

# ── Logging ────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("sysclock")

settings = get_settings()


# ── Lifespan (startup / shutdown) ──────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator:
    """Eventos de inicio y cierre de la aplicación."""
    logger.info("🚀 SysClock Nómina iniciando...")
    logger.info(f"📌 Entorno: {settings.ENVIRONMENT}")

    # Crear admin por defecto si no existe
    try:
        from app.services.auth_service import create_admin_if_not_exists
        async with AsyncSessionLocal() as session:
            await create_admin_if_not_exists(session)
            logger.info("✅ Usuario admin verificado/creado.")
    except Exception as e:
        logger.warning(f"⚠️ No se pudo crear admin por defecto: {e}")

    yield

    logger.info("🛑 SysClock Nómina apagándose...")


# ── App FastAPI ────────────────────────────────────────────────────
app = FastAPI(
    title="SysClock Nómina",
    description="Sistema de gestión de nómina para Colombia 2026",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)


# ── CORS ───────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Exception Handlers ────────────────────────────────────────────
app.add_exception_handler(SysClockException, sysclock_exception_handler)  # type: ignore
app.add_exception_handler(HTTPException, http_exception_handler)  # type: ignore
app.add_exception_handler(Exception, generic_exception_handler)  # type: ignore


# ── Routers ────────────────────────────────────────────────────────
from app.routers import auth, empleados, configuracion, health, marcaciones, turnos, nomina, reportes, me  # noqa: E402

app.include_router(auth.router, prefix="/api/v1")
app.include_router(empleados.router, prefix="/api/v1")
app.include_router(configuracion.router, prefix="/api/v1")
app.include_router(health.router, prefix="/api/v1")
app.include_router(marcaciones.router, prefix="/api/v1")
app.include_router(turnos.router, prefix="/api/v1")
app.include_router(nomina.router, prefix="/api/v1")
app.include_router(reportes.router, prefix="/api/v1")
app.include_router(me.router, prefix="/api/v1")


# ── Root endpoint ─────────────────────────────────────────────────
@app.get("/", tags=["Root"])
async def root():
    """Endpoint raíz con información del sistema."""
    return {
        "system": "SysClock Nómina",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/api/v1/health",
    }
