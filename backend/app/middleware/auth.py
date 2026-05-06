"""
Middleware de autenticación JWT.
Provee dependencies para proteger rutas:
- get_current_user: extrae el usuario del token Bearer
- require_rol: valida que el usuario tenga uno de los roles permitidos
"""

from typing import Callable

from fastapi import Depends, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.usuario import Usuario, RolUsuario
from app.services.auth_service import verify_token, get_user_by_id
from app.utils.exceptions import UnauthorizedException, ForbiddenException

# Esquema de seguridad Bearer
security = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> Usuario:
    """
    Dependency que extrae y valida el usuario actual desde el token JWT.
    Se usa en rutas que requieren autenticación.
    """
    if credentials is None:
        raise UnauthorizedException("Token de autenticación requerido.")

    token = credentials.credentials
    payload = verify_token(token, expected_type="access")

    user_id = int(payload.get("sub", 0))
    user = await get_user_by_id(db, user_id)
    return user


def require_rol(*roles: RolUsuario) -> Callable:
    """
    Factory de dependency que valida el rol del usuario.

    Uso:
        @router.get("/admin-only", dependencies=[Depends(require_rol(RolUsuario.ADMIN))])
        async def admin_endpoint():
            ...

    O como parámetro:
        async def endpoint(user: Usuario = Depends(require_rol(RolUsuario.ADMIN, RolUsuario.CONTADOR))):
            ...
    """

    async def _check_rol(
        current_user: Usuario = Depends(get_current_user),
    ) -> Usuario:
        if current_user.rol not in roles:
            roles_str = ", ".join(r.value for r in roles)
            raise ForbiddenException(
                f"Se requiere uno de los siguientes roles: {roles_str}."
            )
        return current_user

    return _check_rol
