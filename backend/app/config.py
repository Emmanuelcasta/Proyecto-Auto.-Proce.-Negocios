"""
Configuración global del sistema SysClock Nómina.
Lee variables de entorno con validación via Pydantic Settings.
"""

from functools import lru_cache
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    """Configuración central de la aplicación."""

    # ── Base de datos ──────────────────────────────────────────────
    DATABASE_URL: str = Field(
        default="postgresql+asyncpg://user:password@localhost:5432/sysclock_nomina",
        description="URL de conexión async a PostgreSQL",
    )

    # ── JWT ────────────────────────────────────────────────────────
    JWT_SECRET_KEY: str = Field(
        default="dev-secret-key-cambiar-en-produccion",
        description="Clave secreta para firmar tokens JWT",
    )
    JWT_ALGORITHM: str = Field(default="HS256")
    ACCESS_TOKEN_EXPIRE_HOURS: int = Field(default=8)
    REFRESH_TOKEN_EXPIRE_DAYS: int = Field(default=7)

    # ── Make.com ───────────────────────────────────────────────────
    MAKE_API_KEY: str = Field(default="", description="API Key para Make.com webhooks")

    # ── CORS ───────────────────────────────────────────────────────
    CORS_ORIGINS: str = Field(
        default="http://localhost:3000,http://localhost:5173",
        description="Orígenes CORS separados por coma",
    )

    # ── Entorno ────────────────────────────────────────────────────
    ENVIRONMENT: str = Field(default="development")

    @property
    def cors_origins_list(self) -> list[str]:
        """Convierte la cadena CORS_ORIGINS en una lista."""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT == "production"

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": True,
    }


@lru_cache()
def get_settings() -> Settings:
    """Singleton cacheado de la configuración."""
    return Settings()
