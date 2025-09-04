@echo off
echo Starting ShadCN UI Backend...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if MongoDB is running (optional check)
echo Checking MongoDB connection...
echo Note: Make sure MongoDB is running on mongodb://localhost:27017
echo.

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo Error: Failed to install dependencies
        pause
        exit /b 1
    )
    echo Dependencies installed successfully!
    echo.
)

REM Check if .env file exists
if not exist ".env" (
    echo Warning: .env file not found!
    echo Please copy env.example to .env and configure your settings
    echo.
    copy env.example .env
    echo Created .env file from template. Please edit it with your configuration.
    echo.
)

REM Start the development server
echo Starting development server...
echo Backend will be available at: http://localhost:5000
echo Frontend should be running at: http://localhost:5173
echo.
echo Press Ctrl+C to stop the server
echo.

npm run dev

pause
