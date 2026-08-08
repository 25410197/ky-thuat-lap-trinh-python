"""them_anh_thu_vien

Revision ID: c41af5dd7daa
Revises: 1e3671e3f8b9
Create Date: 2026-08-08 19:41:22.023588

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'c41af5dd7daa'
down_revision = '1e3671e3f8b9'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table('anh_thu_vien',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('nguoi_dung_id', sa.Integer(), nullable=False),
    sa.Column('ten_doi_tuong', sa.String(length=255), nullable=False),
    sa.Column('duong_dan_anh', sa.String(length=500), nullable=False),
    sa.Column('ten_tep_goc', sa.String(length=255), nullable=False),
    sa.Column('dung_luong', sa.Integer(), nullable=False),
    sa.Column('ngay_tai_len', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['nguoi_dung_id'], ['nguoi_dung.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.add_column('hinh_anh_tin_dang', sa.Column('anh_thu_vien_id', sa.Integer(), nullable=True))

    # Data migration: mỗi ảnh cũ (lưu URL trực tiếp) -> 1 dòng anh_thu_vien thuộc chủ tin đăng,
    # rồi trỏ hinh_anh_tin_dang sang dòng vừa tạo. An toàn cho dữ liệu demo/seed lẫn dữ liệu thật.
    conn = op.get_bind()
    rows = conn.execute(sa.text(
        "SELECT h.id, h.duong_dan_anh, t.nguoi_dang_id "
        "FROM hinh_anh_tin_dang h JOIN tin_dang t ON t.id = h.tin_dang_id"
    )).fetchall()
    for hinh_anh_id, duong_dan_anh, chu_so_huu_id in rows:
        ten_doi_tuong = duong_dan_anh.rsplit('/', 1)[-1]
        anh_thu_vien_id = conn.execute(sa.text(
            "INSERT INTO anh_thu_vien (nguoi_dung_id, ten_doi_tuong, duong_dan_anh, ten_tep_goc, dung_luong, ngay_tai_len) "
            "VALUES (:chu_so_huu_id, :ten_doi_tuong, :duong_dan_anh, :ten_doi_tuong, 0, now()) "
            "RETURNING id"
        ), {
            "chu_so_huu_id": chu_so_huu_id,
            "ten_doi_tuong": ten_doi_tuong,
            "duong_dan_anh": duong_dan_anh,
        }).scalar()
        conn.execute(sa.text(
            "UPDATE hinh_anh_tin_dang SET anh_thu_vien_id = :anh_thu_vien_id WHERE id = :hinh_anh_id"
        ), {"anh_thu_vien_id": anh_thu_vien_id, "hinh_anh_id": hinh_anh_id})

    op.alter_column('hinh_anh_tin_dang', 'anh_thu_vien_id', nullable=False)
    op.create_foreign_key(None, 'hinh_anh_tin_dang', 'anh_thu_vien', ['anh_thu_vien_id'], ['id'])
    op.drop_column('hinh_anh_tin_dang', 'duong_dan_anh')


def downgrade() -> None:
    op.add_column('hinh_anh_tin_dang', sa.Column('duong_dan_anh', sa.VARCHAR(length=500), autoincrement=False, nullable=True))

    conn = op.get_bind()
    conn.execute(sa.text(
        "UPDATE hinh_anh_tin_dang h SET duong_dan_anh = a.duong_dan_anh "
        "FROM anh_thu_vien a WHERE a.id = h.anh_thu_vien_id"
    ))

    op.alter_column('hinh_anh_tin_dang', 'duong_dan_anh', nullable=False)
    op.drop_constraint(None, 'hinh_anh_tin_dang', type_='foreignkey')
    op.drop_column('hinh_anh_tin_dang', 'anh_thu_vien_id')
    op.drop_table('anh_thu_vien')
