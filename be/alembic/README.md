# Alembic

Thư mục quản lý migration (thay đổi schema cơ sở dữ liệu) — code-first: sửa model trong `app/models/` trước,
rồi sinh migration bằng `alembic revision --autogenerate -m "mo ta"` và áp dụng bằng `alembic upgrade head`.

Xem chi tiết ERD (bảng/field/relationship) tại `be/docs/erd.md` và hướng dẫn kết nối DBeaver tại
`be/docs/setup-dbeaver.md`.
