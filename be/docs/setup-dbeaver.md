# Hướng dẫn kết nối DBeaver tới PostgreSQL

Áp dụng cho cả 2 cách chạy backend mô tả trong `README.md` ở gốc repo.

## 1. Đảm bảo PostgreSQL đang chạy

- **Chạy full-stack bằng Docker**: `docker compose -f infra/compose.yaml up -d --build`
- **Chỉ chạy hạ tầng, BE chạy trực tiếp trên máy**: `docker compose -f infra/compose.dev.yaml up -d`

Cả 2 cách đều expose Postgres ra `localhost:5432` (xem `ports: "5432:5432"` trong `infra/compose.yaml` /
`infra/compose.dev.yaml`).

## 2. Thông tin kết nối

Mặc định (khớp `infra/compose.yaml`, override được bằng biến môi trường `POSTGRES_*`):

| Trường | Giá trị |
|---|---|
| Host | `localhost` |
| Port | `5432` |
| Database | `app` |
| Username | `app` |
| Password | `app` |

## 3. Tạo kết nối mới trong DBeaver

1. Mở DBeaver → **Database → New Database Connection**.
2. Chọn **PostgreSQL** → Next.
3. Điền `Host = localhost`, `Port = 5432`, `Database = app`, `Username = app`, `Password = app`.
4. Tick **Save password**.
5. Bấm **Test Connection...** — nếu DBeaver hỏi tải driver PostgreSQL (JDBC), chọn **Download**.
6. Test thành công → **Finish**.

## 4. Kiểm tra schema

Sau khi chạy `alembic upgrade head` (xem `be/docs/erd.md`), mở connection vừa tạo trong DBeaver:
`app → Databases → app → Schemas → public → Tables` — phải thấy đủ 11 bảng: `nguoi_dung`, `tinh_thanh`,
`quan_huyen`, `phuong_xa`, `loai_bat_dong_san`, `tien_ich`, `tin_dang`, `hinh_anh_tin_dang`,
`tin_dang_tien_ich`, `tin_yeu_thich`, `bao_cao` (cộng bảng `alembic_version` do Alembic quản lý).

## 5. Sự cố thường gặp

- **Connection refused**: container Postgres chưa chạy hoặc chưa healthy — kiểm tra bằng
  `docker ps --filter name=postgres`.
- **Password authentication failed**: đổi `POSTGRES_PASSWORD` trong `.env`/`infra/.env` mà chưa xóa volume cũ
  — Postgres chỉ áp dụng `POSTGRES_PASSWORD` khi khởi tạo volume lần đầu. Xóa volume
  (`docker compose -f infra/compose.dev.yaml down -v`) rồi khởi động lại nếu cần đổi mật khẩu.
- **Database "app" does not exist**: kiểm tra `POSTGRES_DB` đang dùng có khớp giữa container và connection
  DBeaver không.
