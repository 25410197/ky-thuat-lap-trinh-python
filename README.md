# Kỹ thuật lập trình Python

Backend dùng FastAPI và Python 3.10. Có thể chạy toàn bộ stack bằng Docker Compose hoặc chỉ chạy hạ tầng bằng Docker rồi chạy backend trực tiếp trên máy.

## Chạy toàn bộ stack bằng Docker

Khởi động backend, PostgreSQL, MinIO và tạo bucket mặc định:

```bash
docker compose -f infra/compose.yaml up -d --build
```

Dừng toàn bộ stack:

```bash
docker compose -f infra/compose.yaml down
```

## Chạy backend trực tiếp trên máy

1. Khởi động PostgreSQL, MinIO và tạo bucket mặc định:

```bash
docker compose -f infra/compose.dev.yaml up -d
```

2. Cài thư viện và chạy backend bằng Python 3.10:

```bash
cd be

python -m venv .venv

#Powershell
.\.venv\Scripts\Activate.ps1

# Activate virtual environment (Windows)
.venv\Scripts\activate

# Install dependencies
python -m pip install -r requirements.txt

# Run FastAPI server
python -m uvicorn app.main:app --reload
```

Sau khi khởi động:

- Swagger UI: http://localhost:8000/docs
- Health check: http://localhost:8000/api/health
- MinIO Console: http://localhost:9001

Dừng hạ tầng bằng lệnh:

```bash
docker compose -f infra/compose.dev.yaml down
```

## Cấu trúc thư mục

- `be/`: mã nguồn FastAPI, cấu hình, migration và test.
  - `be/app/api/`: dependencies (phụ thuộc) và các route (tuyến API).
  - `be/app/core/`: cấu hình dùng chung của ứng dụng.
  - `be/app/db/`: phần kết nối và làm việc với cơ sở dữ liệu.
  - `be/app/models/`: các model (mô hình) dữ liệu.
  - `be/app/repositories/`: lớp truy cập dữ liệu.
  - `be/app/schemas/`: các schema (lược đồ) kiểm tra dữ liệu vào, ra.
  - `be/app/services/`: lớp xử lý nghiệp vụ.
  - `be/tests/`: kiểm thử backend.
  - `be/alembic/`: migration (chuyển đổi phiên bản) cơ sở dữ liệu.
- `fe/`: mã nguồn frontend.
- `infra/`: Dockerfile và cấu hình Docker Compose cho backend, PostgreSQL và MinIO.
- `docs/`: tài liệu của dự án.
