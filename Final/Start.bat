@echo off
setlocal enabledelayedexpansion
title CRM App Runner

:: =======================
:: Step 1: Detect Wi-Fi IPv4
:: =======================
echo Detecting Wi-Fi IPv4 address...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"Wireless LAN adapter Wi-Fi" /c:"IPv4 Address"') do (
    set "line=%%a"
    set "line=!line:~1!"
    if "!line!" neq "" (
        set "newIP=!line!"
    )
)

:: Trim spaces from the extracted IP
for /f "tokens=* delims= " %%a in ("!newIP!") do set "newIP=%%a"

echo Detected Wi-Fi IPv4 address: !newIP!
echo.

:: =======================
:: Step 2: Replace IP in code files
:: =======================
echo Replacing ANY IPv4 address with "!newIP!" in all .jsx and backend .js files...
echo.

:: ===== FRONTEND (.jsx) FILES =====
for /r %%f in (*.jsx) do (
    powershell -command ^
        "(Get-Content -Raw -Path '%%f') -replace '\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b', '!newIP!' | Set-Content -NoNewline '%%f'"
    echo Updated: %%f
)

echo.
echo ===== BACKEND (.js) FILES =====
for /r backend %%f in (*.js) do (
    powershell -command ^
        "(Get-Content -Raw -Path '%%f') -replace '\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b', '!newIP!' | Set-Content -NoNewline '%%f'"
    echo Updated: %%f
)

echo.
echo ✅ Replacement complete!
echo.

:: =======================
:: Step 3: Run Frontend & Backend
:: =======================
echo Starting Frontend and Backend...

REM Start frontend in a new command window
start "" cmd /k "npm run dev -- --host"

REM Start backend in current window
cd backend
npx nodemon server.js
