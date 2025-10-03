@echo off
setlocal enabledelayedexpansion

:: Get the IPv4 address of Wi-Fi (ignoring Ethernet)
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

:: Replace in all .jsx files recursively
echo Replacing any IP with "!newIP!" in all .jsx files...
for /r %%f in (*.jsx) do (
    powershell -command ^
        "(Get-Content -Raw -Path '%%f') -replace '192\.168\.[0-9]{1,3}\.[0-9]{1,3}', '!newIP!' | Set-Content -NoNewline '%%f'"
    echo Updated: %%f
)

echo.
:: Replace in backend .js files only
echo Replacing any IP with "!newIP!" in all .js files inside backend folder...
for /r backend %%f in (*.js) do (
    powershell -command ^
        "(Get-Content -Raw -Path '%%f') -replace '192\.168\.[0-9]{1,3}\.[0-9]{1,3}', '!newIP!' | Set-Content -NoNewline '%%f'"
    echo Updated: %%f
)

echo.
echo ✅ Replacement complete!
pause
