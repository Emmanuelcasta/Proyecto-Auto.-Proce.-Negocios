"""
Schemas Pydantic v2 para autenticación.
"""

from pydantic import BaseModel, EmailStr, Field


class LoginRequest(BaseModel):
    """Datos de login."""
    email: EmailStr
    password: str = Field(..., min_length=6)


class TokenResponse(BaseModel):
    """Respuesta con tokens JWT."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    """Solicitud de refresh token."""
    refresh_token: str


class TokenData(BaseModel):
    """Datos extraídos del token JWT."""
    user_id: int
    email: str
    rol: str


class MessageResponse(BaseModel):
    """Respuesta genérica con mensaje."""
    message: str
