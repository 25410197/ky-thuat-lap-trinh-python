@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"

echo ============================================
echo  CANH BAO: script nay se XOA sach du lieu
echo  trong Docker volume (PostgreSQL, MinIO)
echo  roi tao lai tu dau va seed du lieu mau.
echo ============================================
set /p CONFIRM=Tiep tuc? (y/n):
if /i not "%CONFIRM%"=="y" (
    echo Da huy.
    goto :eof
)

echo.
echo ============================================
echo  1. Dung infra va xoa volume
echo ============================================
docker compose -f infra\compose.dev.yaml down -v
if errorlevel 1 (
    echo [LOI] Khong dung duoc infra.
    goto :error
)

echo.
echo ============================================
echo  2. Khoi dong lai PostgreSQL + MinIO
echo ============================================
docker compose -f infra\compose.dev.yaml up -d
if errorlevel 1 (
    echo [LOI] Khong khoi dong duoc infra. Kiem tra Docker Desktop da chay chua.
    goto :error
)

echo Doi PostgreSQL san sang...
timeout /t 8 /nobreak >nul

cd be

if not exist ".venv\Scripts\activate.bat" (
    echo Chua co .venv, dang tao moi...
    python -m venv .venv
    if errorlevel 1 (
        echo [LOI] Khong tao duoc virtual environment.
        goto :error
    )
    call .venv\Scripts\activate.bat
    python -m pip install -r requirements.txt
    if errorlevel 1 (
        echo [LOI] Cai dependencies that bai.
        goto :error
    )
) else (
    call .venv\Scripts\activate.bat
)

echo.
echo ============================================
echo  3. Chay migration (alembic upgrade head)
echo ============================================
python -m alembic upgrade head
if errorlevel 1 (
    echo [LOI] Migration that bai. Neu loi ket noi DB, cho vai giay roi chay lai.
    goto :error
)

echo.
echo ============================================
echo  4. Seed du lieu mau
echo ============================================
python -m app.scripts.seed
if errorlevel 1 (
    echo [LOI] Seed du lieu that bai.
    goto :error
)

echo.
echo ============================================
echo  Xong. Infra da reset va seed lai tu dau.
echo  Chay start-be.bat de khoi dong FastAPI server.
echo ============================================
pause
goto :eof

:error
echo.
echo Da dung lai vi gap loi o buoc tren.
pause
exit /b 1
