"""
Router de autenticación.
Endpoints: login, refresh, logout.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.usuario import (
    LoginRequest,
    TokenResponse,
    RefreshRequest,
    MessageResponse,
)
from app.services.auth_service import (
    authenticate_user,
    create_access_token,
    create_refresh_token,
    verify_token,
    get_user_by_id,
)
from app.middleware.auth import get_current_user
from app.models.usuario import Usuario

router = APIRouter(prefix="/auth", tags=["Autenticación"])


@router.post("/login", response_model=TokenResponse)
async def login(
    datos: LoginRequest,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    """
    Autentica un usuario y retorna access + refresh token.

    - **email**: Email registrado
    - **password**: Contraseña (mínimo 6 caracteres)
    """
    user = await authenticate_user(db, datos.email, datos.password)

    access_token = create_access_token(user)
    refresh_token = create_refresh_token(user)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh(
    datos: RefreshRequest,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    """
    Renueva el access token usando un refresh token válido.
    Retorna un nuevo par de tokens.
    """
    payload = verify_token(datos.refresh_token, expected_type="refresh")

    user_id = int(payload.get("sub", 0))
    user = await get_user_by_id(db, user_id)

    access_token = create_access_token(user)
    refresh_token = create_refresh_token(user)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
    )


@router.post("/logout", response_model=MessageResponse)
async def logout(
    current_user: Usuario = Depends(get_current_user),
) -> MessageResponse:
    """
    Cierra la sesión del usuario.

    Nota: Como JWT es stateless, el logout se maneja en el cliente
    eliminando los tokens almacenados. Este endpoint confirma la acción.
    """
    return MessageResponse(message="Sesión cerrada exitosamente.")
