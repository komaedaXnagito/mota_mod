@echo off
setlocal
chcp 65001 >nul
set PYTHONUTF8=1
where python >nul 2>nul
if not errorlevel 1 (
    python -B "%~dp0png_to_webp.py" %*
    if errorlevel 1 pause
    exit /b
)
where py >nul 2>nul
if not errorlevel 1 (
    py -3 -B "%~dp0png_to_webp.py" %*
    if errorlevel 1 pause
    exit /b
)
echo Python 3 is required. Install Python with "Add Python to PATH" enabled.
pause
