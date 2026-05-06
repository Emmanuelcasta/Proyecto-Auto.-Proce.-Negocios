"""
Configuración de base de datos async con SQLAlchemy 2.0.
Provee engine, session factory y dependency para FastAPI.
"""

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
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=not settings.is_production,  # Log SQL en desarrollo
    pool_pre_ping=True,               # Verificar conexión antes de usar
    pool_size=10,
    max_overflow=20,
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
