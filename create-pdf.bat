@echo off
echo Creating PDFs from Markdown files...
echo.

REM Check if pandoc is installed
where pandoc >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Pandoc is not installed!
    echo.
    echo Please install Pandoc from: https://pandoc.org/installing.html
    echo Or use Chocolatey: choco install pandoc
    echo.
    pause
    exit /b 1
)

echo Converting COMPLETE_FEATURE_GUIDE.md...
pandoc COMPLETE_FEATURE_GUIDE.md -o COMPLETE_FEATURE_GUIDE.pdf --pdf-engine=xelatex -V geometry:margin=1in

echo Converting AADHAAR_SETUP.md...
pandoc AADHAAR_SETUP.md -o AADHAAR_SETUP.pdf --pdf-engine=xelatex -V geometry:margin=1in

echo Converting BASE64_STORAGE.md...
pandoc BASE64_STORAGE.md -o BASE64_STORAGE.pdf --pdf-engine=xelatex -V geometry:margin=1in

echo Converting AUTO_CLEANUP_GUIDE.md...
pandoc AUTO_CLEANUP_GUIDE.md -o AUTO_CLEANUP_GUIDE.pdf --pdf-engine=xelatex -V geometry:margin=1in

echo.
echo ✅ All PDFs created successfully!
echo.
echo Files created:
echo - COMPLETE_FEATURE_GUIDE.pdf
echo - AADHAAR_SETUP.pdf
echo - BASE64_STORAGE.pdf
echo - AUTO_CLEANUP_GUIDE.pdf
echo.
pause
