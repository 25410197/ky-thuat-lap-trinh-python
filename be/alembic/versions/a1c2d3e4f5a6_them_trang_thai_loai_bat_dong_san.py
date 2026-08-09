"""them_trang_thai_loai_bat_dong_san

Revision ID: a1c2d3e4f5a6
Revises: c41af5dd7daa
Create Date: 2026-08-09 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'a1c2d3e4f5a6'
down_revision = 'c41af5dd7daa'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        'loai_bat_dong_san',
        sa.Column(
            'trang_thai',
            sa.Enum('HOAT_DONG', 'AN', name='trang_thai_loai_bat_dong_san', native_enum=False, length=20),
            nullable=False,
            server_default='HOAT_DONG',
        ),
    )


def downgrade() -> None:
    op.drop_column('loai_bat_dong_san', 'trang_thai')
