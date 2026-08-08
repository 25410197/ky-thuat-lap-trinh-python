#!/bin/sh
set -e

echo "Chạy migration alembic..."
alembic upgrade head

echo "Seed dữ liệu mẫu (reset)..."
python -m app.scripts.seed

echo "Khởi động server..."
exec python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
