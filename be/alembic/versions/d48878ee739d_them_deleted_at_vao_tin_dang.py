"""them_deleted_at_vao_tin_dang

Revision ID: d48878ee739d
Revises: 8808eed282b9
Create Date: 2026-08-29 15:01:56.094836

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'd48878ee739d'
down_revision = '8808eed282b9'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('tin_dang', sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    op.drop_column('tin_dang', 'deleted_at')
