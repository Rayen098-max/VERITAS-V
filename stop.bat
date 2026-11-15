@echo off
title Stopping VERITAS-V
echo =========================================================
echo              STOPPING VERITAS-V SERVERS
echo =========================================================

echo Closing port 8000 (Backend)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8000" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo Closing port 5173 (Frontend)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5173" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo [OK] All VERITAS-V servers have been stopped.
timeout /t 3 >nul
