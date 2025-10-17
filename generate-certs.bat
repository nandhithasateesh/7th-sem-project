@echo off
echo ========================================
echo  SSL Certificate Generator
echo  For HTTPS Microphone Access
echo ========================================
echo.

REM Check if OpenSSL is available
where openssl >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: OpenSSL not found!
    echo.
    echo Please install OpenSSL:
    echo 1. Download from: https://slproweb.com/products/Win32OpenSSL.html
    echo 2. Or use Git Bash if you have Git installed
    echo.
    pause
    exit /b 1
)

REM Create certs directory
if not exist "certs" mkdir certs

echo Generating SSL certificates...
echo.

REM Generate self-signed certificate
openssl req -x509 -newkey rsa:2048 -keyout certs\key.pem -out certs\cert.pem -days 365 -nodes -subj "/CN=localhost/O=StealthLAN/C=US"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo  SUCCESS! Certificates generated
    echo ========================================
    echo.
    echo Files created:
    echo  - certs\key.pem
    echo  - certs\cert.pem
    echo.
    echo Next steps:
    echo 1. Run: set VITE_HTTPS=true
    echo 2. Run: npm run dev
    echo 3. Access: https://YOUR_IP:5173
    echo.
    echo Note: Browser will show security warning
    echo       Click "Advanced" and "Proceed" - it's safe!
    echo.
) else (
    echo.
    echo ERROR: Certificate generation failed!
    echo.
)

pause
