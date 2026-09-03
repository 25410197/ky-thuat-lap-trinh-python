@echo off
setlocal enabledelayedexpansion
set "ROOT=%~dp0"

if not exist "%ROOT%be\.venv\Scripts\activate.bat" (
    echo [LOI] Chua co virtual environment. Chay reset-infra.bat truoc de setup.
    goto :error
)

if not exist "%ROOT%fe\node_modules" (
    echo [LOI] Chua cai dependency FE. Chay "npm install" trong thu muc fe truoc.
    goto :error
)

echo ============================================
echo  Khoi dong FE (Next.js) trong cua so rieng...
echo ============================================
start "FE - Next.js" cmd /k "cd /d "%ROOT%fe" && npm run dev"

cd /d "%ROOT%be"
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
echo FE (Next.js):  http://localhost:3000
echo.

python -m uvicorn app.main:app --reload

goto :eof

:error
pause
exit /b 1
