@echo off
title VERITAS-V Launcher
cd /d "%~dp0"
if exist "VERITAS-V\src\server\app.py" cd VERITAS-V

echo =========================================================
echo              VERITAS-V ONE-CLICK LAUNCHER
echo =========================================================
echo.

where python >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in your PATH.
    echo Please install Python 3.10+ and restart.
    pause
    exit /b 1
)

where npm >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js/npm is not installed or not in your PATH.
    echo Please install Node.js and restart.
    pause
    exit /b 1
)

if not exist ".env" (
    if exist ".env.example" (
        echo [INFO] Creating .env file from .env.example...
        copy ".env.example" ".env" >nul
    )
)

if not exist "node_modules" (
    echo [INFO] First-time setup: installing frontend packages...
    call npm install
)

echo [1/3] Starting FastAPI Backend on port 8000...
start "VERITAS-V Backend (8000)" cmd /k "python -m uvicorn src.server.app:app --host 127.0.0.1 --port 8000"

echo [2/3] Starting Vite Frontend on port 5173...
start "VERITAS-V Frontend (5173)" cmd /k "npm run dev"

echo [3/3] Waiting for servers to initialize...
timeout /t 4 /nobreak >nul

echo [DONE] Opening VERITAS-V in your browser...
start http://localhost:5173

echo.
echo =========================================================
echo  VERITAS-V is live!
echo  - Web Application: http://localhost:5173
echo  - Backend API:     http://127.0.0.1:8000
echo.
echo  To shut down, close the terminal windows or run stop.bat
echo =========================================================
timeout /t 5 >nul
