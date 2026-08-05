@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0\be"

if not exist ".venv\Scripts\activate.bat" (
    echo [LOI] Chua co virtual environment. Chay reset-infra.bat truoc de setup.
    goto :error
)

call .venv\Scripts\activate.bat
if errorlevel 1 (
    echo [LOI] Khong kich hoat duoc virtual environment.
    goto :error
)

echo ============================================
echo  Chay FastAPI server (Ctrl+C de dung)
echo ============================================
echo Swagger UI:    http://localhost:8000/docs
echo Health check:  http://localhost:8000/api/health
echo Tin dang mau:  http://localhost:8000/api/rental-posts
echo MinIO console: http://localhost:9001
echo.

python -m uvicorn app.main:app --reload

goto :eof

:error
pause
exit /b 1
