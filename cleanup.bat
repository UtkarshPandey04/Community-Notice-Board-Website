@echo off
echo Cleaning up unnecessary files from ShadCN UI project...
echo.

REM Remove server directory (if not locked)
if exist "server" (
    echo Removing server directory...
    rmdir /s /q server 2>nul
    if exist "server" (
        echo Warning: Could not remove server directory. It may be in use.
        echo Please close any applications using it and run this script again.
    ) else (
        echo Server directory removed successfully.
    )
) else (
    echo Server directory not found.
)

REM Remove other unnecessary files
if exist "pnpm-lock.yaml" (
    echo Removing pnpm-lock.yaml...
    del pnpm-lock.yaml
    echo pnpm-lock.yaml removed.
)

if exist "template_config.json" (
    echo Removing template_config.json...
    del template_config.json
    echo template_config.json removed.
)

if exist ".mgx" (
    echo Removing .mgx directory...
    rmdir /s /q .mgx
    echo .mgx directory removed.
)

if exist "dist" (
    echo Removing dist directory...
    rmdir /s /q dist
    echo dist directory removed.
)

echo.
echo Cleanup completed!
echo.
echo Remaining project structure:
dir /b /ad
echo.
pause
