@echo off
setlocal enabledelayedexpansion
set "ROOT=%~dp0"

if not exist "%ROOT%be\.venv\Scripts\activate.bat" (
    echo [LOI] Chua co virtual environment. Chay reset-infra.bat truoc de setup.
    goto :error
)

echo ============================================
echo  Cai dat thu vien va khoi dong FE (Next.js)...
echo ============================================
start "FE - Next.js" cmd /k "cd /d "%ROOT%fe" && npm install && npm run dev"

cd /d "%ROOT%be"
call .venv\Scripts\activate.bat
if errorlevel 1 (
    echo [LOI] Khong kich hoat duoc virtual environment.
    goto :error
)

echo ============================================
echo  Cai dat thu vien phu thuoc (Backend)...
echo ============================================
pip install -r requirements.txt

echo ============================================
echo  Chay FastAPI server (Ctrl+C de dung)
echo ============================================
echo Swagger UI:    http://localhost:8000/docs
echo Health check:  http://localhost:8000/api/health
echo Tin dang mau:  http://localhost:8000/api/rental-posts
echo MinIO console: http://localhost:9001
echo FE (Next.js):  http://localhost:3000
echo.

python -m uvicorn app.main:app --reload

goto :eof

:error
pause
exit /b 1
