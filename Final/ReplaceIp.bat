@echo off
setlocal enabledelayedexpansion

:: Prompt user for new IP address
set /p newIP=Enter the new IP address: 

:: Trim spaces from input
for /f "tokens=* delims= " %%a in ("%newIP%") do set "newIP=%%a"

echo Replacing any IP with "%newIP%" in all .jsx files...
echo.

:: Loop through all .jsx files recursively in entire project
for /r %%f in (*.jsx) do (
    powershell -command ^
        "(Get-Content -Raw -Path '%%f') -replace '192\.168\.[0-9]{1,3}\.[0-9]{1,3}', '%newIP%' | Set-Content -NoNewline '%%f'"
    echo Updated: %%f
)

echo.
echo Replacing any IP with "%newIP%" in all .js files inside backend folder...
echo.

:: Loop through all .js files recursively only inside backend
for /r backend %%f in (*.js) do (
    powershell -command ^
        "(Get-Content -Raw -Path '%%f') -replace '192\.168\.[0-9]{1,3}\.[0-9]{1,3}', '%newIP%' | Set-Content -NoNewline '%%f'"
    echo Updated: %%f
)

echo.
echo ✅ Replacement complete!
pause
