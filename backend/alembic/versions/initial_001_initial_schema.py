"""initial_schema

Revision ID: initial_001
Revises:
Create Date: 2026-04-01 00:00:00.000000

Stub: las tablas usuarios, empleados y configuracion ya fueron
creadas manualmente via supabase_init.sql. Esta revisión marca
ese punto de partida para que Alembic pueda rastrear lo que sigue.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = 'initial_001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
