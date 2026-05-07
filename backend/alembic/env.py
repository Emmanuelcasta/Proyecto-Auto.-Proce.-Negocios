"""
Alembic env.py — Configurado para migraciones async con SQLAlchemy 2.0.
Soporta autogenerate para detectar cambios en los modelos automáticamente.
"""

import asyncio
import os
import sys
from logging.config import fileConfig

from dotenv import load_dotenv
load_dotenv()  # Carga el .env antes de leer DATABASE_URL

from alembic import context
from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config, create_async_engine

# Agregar el directorio raíz del proyecto al path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

# Importar Base y todos los modelos (para autogenerate)
from app.database import Base
from app.models import Usuario, Empleado, Configuracion  # noqa: F401

# Alembic Config object
config = context.config

# Leer URL de entorno (no usar config.set_main_option para evitar
# que configparser interpole caracteres como % en la contraseña)
def get_migration_url() -> str:
    url = os.getenv("DATABASE_URL", "")
    if not url:
        return config.get_main_option("sqlalchemy.url", "")
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql+asyncpg://", 1)
    elif url.startswith("postgresql://"):
        url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
    return url

# Logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Metadata para autogenerate
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode (genera SQL sin conectar)."""
    url = get_migration_url()
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection) -> None:
    """Ejecuta las migraciones con una conexión activa."""
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
    )

    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    """Ejecuta migraciones en modo async."""
    connectable = create_async_engine(get_migration_url(), poolclass=pool.NullPool)

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode (async)."""
    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
