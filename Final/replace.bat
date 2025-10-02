@echo off
setlocal enabledelayedexpansion

:: Confirm
echo This will replace all occurrences of "WBSEDCL" with "WBSEDCL" in all files recursively.
pause

:: Loop through all files recursively
for /r %%f in (*) do (
    if exist "%%f" (
        echo Processing %%f...
        powershell -Command "(Get-Content -Raw -Path '%%f') -replace '\bWind\b','Winding' | Set-Content -NoNewline '%%f'"
    )
)

for /r %%f in (*) do (
    if exist "%%f" (
        echo Processing %%f...
        powershell -Command "(Get-Content -Raw -Path '%%f') -replace '\bAssemble\b','Assembley' | Set-Content -NoNewline '%%f'"
    )
)

echo.
echo ✅ Replacement complete!
pause
