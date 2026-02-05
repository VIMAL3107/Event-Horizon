@echo off
title Event Horizon Backend - DO NOT CLOSE
cd /d "%~dp0"

echo.
echo ==================================================
echo      STARTING EVENT HORIZON AI
echo ==================================================
echo.
echo 1. Initializing Server...
echo 2. Browser will open automatically in 5 seconds...
echo.
echo NOTE: Keep this window OPEN while using the app.
echo       Close this window to stop the server.
echo.

:: Launch a separate temporary process to open the browser after 5 seconds
start "" cmd /c "timeout /t 5 >nul & start http://localhost:8000"

:: Run the backend
python backend/main.py
