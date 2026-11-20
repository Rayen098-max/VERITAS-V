@echo off
title VERITAS-V Launcher

:: Resolve project root directory
cd /d "%~dp0"
if exist "VERITAS-V\src\server\app.py" (
    cd /d "%~dp0VERITAS-V"
)

echo =========================================================
echo              VERITAS-V ONE-CLICK LAUNCHER
echo =========================================================
echo.

:: 1. Verify Python installation
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in your PATH.
    echo Please install Python 3.10+ from https://www.python.org/downloads/
    echo Make sure to check the "Add Python to PATH" box during installation.
    echo.
    pause
    exit /b 1
)

:: 2. Check for FFmpeg
where ffmpeg >nul 2>&1
if errorlevel 1 (
    echo [NOTICE] FFmpeg not found on system PATH.
    echo PySceneDetect and audio extraction work best with FFmpeg.
    echo To install on Windows: winget install Gyan.FFmpeg
    echo.
)

:: 3. Ensure .env exists
if not exist ".env" (
    if exist ".env.example" (
        echo [INFO] Initializing .env configuration from .env.example...
        copy ".env.example" ".env" >nul
    )
)

:: 4. Verify Python dependencies
python -c "import fastapi, uvicorn, scenedetect" >nul 2>&1
if errorlevel 1 (
    echo [INFO] Installing required Python packages from requirements.txt...
    python -m pip install -r requirements.txt
)

:: 5. Verify Node.js/npm installation
where npm >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js and npm are not installed or not in your PATH.
    echo Please install Node.js LTS from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:: 6. Verify frontend node_modules
if not exist "node_modules" (
    echo [INFO] Installing frontend dependencies via npm install...
    call npm install
)

:: 7. Free up ports 8000 and 5173 if currently occupied
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":8000" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":5173" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)

:: 8. Launch servers
echo.
echo [1/3] Starting FastAPI Backend Server on port 8000...
start "VERITAS-V Backend (8000)" cmd /k "cd /d ""%CD%"" && python -m uvicorn src.server.app:app --host 127.0.0.1 --port 8000"

echo [2/3] Starting Vite Frontend Client on port 5173...
start "VERITAS-V Frontend (5173)" cmd /k "cd /d ""%CD%"" && npm run dev"

echo [3/3] Waiting for servers to initialize...
timeout /t 4 /nobreak >nul 2>&1 || ping 127.0.0.1 -n 5 >nul

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
timeout /t 5 >nul 2>&1 || ping 127.0.0.1 -n 6 >nul