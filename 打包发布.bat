@echo off
setlocal
chcp 65001 >nul
set PYTHONUTF8=1
where python >nul 2>nul
if not errorlevel 1 (
    python -B "%~dp0package_release.py" %*
    set "TOWER_PACK_EXIT=0"
    if errorlevel 1 set "TOWER_PACK_EXIT=1"
    goto finish
)
where py >nul 2>nul
if not errorlevel 1 (
    py -3 -B "%~dp0package_release.py" %*
    set "TOWER_PACK_EXIT=0"
    if errorlevel 1 set "TOWER_PACK_EXIT=1"
    goto finish
)
echo Python 3 is required. Install Python with "Add Python to PATH" enabled.
set "TOWER_PACK_EXIT=1"
:finish
pause
exit /b %TOWER_PACK_EXIT%
