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
    echo Please install Python 3.10+ from https://www.python.org/downloads/
    echo (Make sure to check "Add Python to PATH" during installation)
    pause
    exit /b 1
)

where ffmpeg >nul 2>&1
if errorlevel 1 (
    echo [NOTICE] FFmpeg not found on system PATH.
    echo PySceneDetect and audio extraction work best with FFmpeg.
    echo You can install it on Windows in 10 seconds by running:
    echo   winget install Gyan.FFmpeg
    echo.
)

if not exist ".env" (
    if exist ".env.example" (
        echo [INFO] Initializing .env configuration from .env.example...
        copy ".env.example" ".env" >nul
    )
)

python -c "import fastapi, uvicorn, scenedetect" >nul 2>&1
if errorlevel 1 (
    echo [INFO] First-time setup: Installing Python packages from requirements.txt...
    python -m pip install -r requirements.txt
)

where npm >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js/npm is not installed or not in your PATH.
    echo Please install Node.js (LTS) from https://nodejs.org/
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo [INFO] First-time setup: Installing frontend dependencies (npm install)...
    call npm install
)

echo.
echo [1/3] Starting FastAPI Backend Server on port 8000...
start "VERITAS-V Backend (8000)" cmd /k "python -m uvicorn src.server.app:app --host 127.0.0.1 --port 8000"

echo [2/3] Starting Vite Frontend Client on port 5173...
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
echo  To shut down, simply double-click stop.bat
echo =========================================================
timeout /t 5 >nul
