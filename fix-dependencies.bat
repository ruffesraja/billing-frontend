@echo off
echo Fixing BillMaster Frontend Dependencies...
echo.

REM Check if we're in the right directory
if not exist "package.json" (
    echo Error: package.json not found. Please run this script from the project root directory.
    pause
    exit /b 1
)

echo Installing react-router-dom...
npm install react-router-dom

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Error installing react-router-dom. Please check your npm installation.
    echo.
    echo Alternative solutions:
    echo 1. Try: yarn add react-router-dom
    echo 2. Or use the simple version without routing
    echo.
    pause
    exit /b 1
)

echo.
echo Dependencies installed successfully!
echo.
echo The application should now work properly.
echo To start the development server, run: npm run dev
echo.
pause
