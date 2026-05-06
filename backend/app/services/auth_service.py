"""
Servicio de autenticación: JWT tokens y verificación de usuarios.
"""

from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.models.usuario import Usuario
from app.utils.security import verify_password, hash_password
from app.utils.exceptions import UnauthorizedException

settings = get_settings()


async def authenticate_user(db: AsyncSession, email: str, password: str) -> Usuario:
    """
    Autentica un usuario por email y contraseña.
    Retorna el usuario si las credenciales son válidas.
    Lanza UnauthorizedException si no.
    """
    result = await db.execute(select(Usuario).where(Usuario.email == email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(password, user.password_hash):
        raise UnauthorizedException("Email o contraseña incorrectos.")

    if not user.activo:
        raise UnauthorizedException("La cuenta está desactivada.")

    return user


def create_access_token(user: Usuario) -> str:
    """Crea un access token JWT con duración de 8 horas."""
    expire = datetime.now(timezone.utc) + timedelta(hours=settings.ACCESS_TOKEN_EXPIRE_HOURS)
    payload = {
        "sub": str(user.id),
        "email": user.email,
        "rol": user.rol.value,
        "type": "access",
        "exp": expire,
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def create_refresh_token(user: Usuario) -> str:
    """Crea un refresh token JWT con duración de 7 días."""
    expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    payload = {
        "sub": str(user.id),
        "type": "refresh",
        "exp": expire,
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def verify_token(token: str, expected_type: str = "access") -> dict:
    """
    Decodifica y valida un token JWT.
    Retorna el payload si es válido.
    Lanza UnauthorizedException si no.
    """
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
        )
        if payload.get("type") != expected_type:
            raise UnauthorizedException("Tipo de token inválido.")
        return payload
    except JWTError:
        raise UnauthorizedException("Token inválido o expirado.")


async def get_user_by_id(db: AsyncSession, user_id: int) -> Usuario:
    """Busca un usuario por ID."""
    result = await db.execute(select(Usuario).where(Usuario.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise UnauthorizedException("Usuario no encontrado.")
    if not user.activo:
        raise UnauthorizedException("La cuenta está desactivada.")
    return user


async def create_admin_if_not_exists(db: AsyncSession) -> None:
    """
    Crea un usuario admin por defecto si no existe ninguno.
    Solo para el primer deploy — las credenciales deben cambiarse inmediatamente.
    """
    result = await db.execute(select(Usuario).where(Usuario.email == "admin@sysclock.com"))
    if result.scalar_one_or_none() is None:
        from app.models.usuario import RolUsuario
        admin = Usuario(
            email="admin@sysclock.com",
            password_hash=hash_password("Admin123!"),
            rol=RolUsuario.ADMIN,
            activo=True,
        )
        db.add(admin)
        await db.commit()
