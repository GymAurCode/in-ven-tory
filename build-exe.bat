@echo off
echo ========================================
echo    Eyercall Inventory - Build Script
echo ========================================
echo.

echo 🚀 Starting production build...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm is available
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not available
    pause
    exit /b 1
)

echo ✅ Node.js and npm are available
echo.

REM Run the production build script
echo 📦 Running production build script...
node build-production.js

if %errorlevel% neq 0 (
    echo.
    echo ❌ Build failed! Please check the error messages above.
    pause
    exit /b 1
)

echo.
echo ========================================
echo ✅ Build completed successfully!
echo ========================================
echo.
echo 📁 Your executable is in the 'dist' folder
echo 💡 You can now share this executable with clients
echo.
pause 