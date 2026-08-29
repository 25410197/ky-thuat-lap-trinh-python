"""them_bai_viet

Revision ID: b7d3e9c1a2f4
Revises: d48878ee739d
Create Date: 2026-08-29 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'b7d3e9c1a2f4'
down_revision = 'd48878ee739d'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'bai_viet',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('tieu_de', sa.String(length=200), nullable=False),
        sa.Column('slug', sa.String(length=220), nullable=False),
        sa.Column('tom_tat', sa.String(length=200), nullable=False),
        sa.Column('noi_dung_html', sa.Text(), nullable=False),
        sa.Column('anh_bia_id', sa.Integer(), nullable=True),
        sa.Column(
            'trang_thai',
            sa.Enum('NHAP', 'DA_DANG', 'AN', name='trang_thai_bai_viet', native_enum=False, length=20),
            nullable=False,
            server_default='NHAP',
        ),
        sa.Column('nguoi_tao_id', sa.Integer(), nullable=False),
        sa.Column('luot_xem', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('ngay_dang', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['anh_bia_id'], ['anh_thu_vien.id']),
        sa.ForeignKeyConstraint(['nguoi_tao_id'], ['nguoi_dung.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_bai_viet_slug'), 'bai_viet', ['slug'], unique=True)


def downgrade() -> None:
    op.drop_index(op.f('ix_bai_viet_slug'), table_name='bai_viet')
    op.drop_table('bai_viet')
