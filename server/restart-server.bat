@echo off
echo Restarting StealthLAN Server...
echo.

REM Find and kill process on port 5000
echo Checking for existing server on port 5000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do (
    echo Found process: %%a
    echo Killing process...
    taskkill /PID %%a /F >nul 2>&1
)

echo.
echo Starting server...
echo.
npm start
