"""them_is_blocked_is_deleted_vao_tin_dang

Revision ID: f2c9d1e7a3b5
Revises: e4ba8b47958f
Create Date: 2026-08-10 22:37:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'f2c9d1e7a3b5'
down_revision = 'a1c2d3e4f5a6'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('tin_dang', sa.Column('is_blocked', sa.Boolean(), nullable=False, server_default=sa.false()))
    op.add_column('tin_dang', sa.Column('is_deleted', sa.Boolean(), nullable=False, server_default=sa.false()))


def downgrade() -> None:
    op.drop_column('tin_dang', 'is_deleted')
    op.drop_column('tin_dang', 'is_blocked')
