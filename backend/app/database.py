"""
Configuración de base de datos async con SQLAlchemy 2.0.
Provee engine, session factory y dependency para FastAPI.
"""

import socket

# Monkeypatch socket.getaddrinfo para forzar IPv4 y evitar bugs de DNS IPv6 en Windows
orig_getaddrinfo = socket.getaddrinfo
def patched_getaddrinfo(host, port, family=0, type=0, proto=0, flags=0):
    if family == socket.AF_UNSPEC:
        family = socket.AF_INET
    return orig_getaddrinfo(host, port, family, type, proto, flags)
socket.getaddrinfo = patched_getaddrinfo

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase
from typing import AsyncGenerator

from app.config import get_settings

settings = get_settings()

# ── Engine async ───────────────────────────────────────────────────
db_url = settings.DATABASE_URL
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql+asyncpg://", 1)
elif db_url.startswith("postgresql://"):
    db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)

engine = create_async_engine(
    db_url,
    echo=not settings.is_production,  # Log SQL en desarrollo
    pool_pre_ping=True,               # Verificar conexión antes de usar
    pool_size=10,
    max_overflow=20,
    connect_args={"prepared_statement_cache_size": 0},
)

# ── Session Factory ────────────────────────────────────────────────
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


# ── Base declarativa ───────────────────────────────────────────────
class Base(DeclarativeBase):
    """Base para todos los modelos SQLAlchemy."""
    pass


# ── Dependency para FastAPI ────────────────────────────────────────
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Provee una sesión de base de datos async.
    Se usa como dependency en los routers.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
