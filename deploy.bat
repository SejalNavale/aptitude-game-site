@echo off
REM Deployment script for Aptitude Game Site (Windows)
REM This script builds the frontend and prepares for deployment

echo 🚀 Starting deployment process...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    exit /b 1
)

REM Check if Angular CLI is installed
ng --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 📦 Installing Angular CLI globally...
    npm install -g @angular/cli
)

echo 📦 Installing dependencies...
npm install

echo 🔨 Building Angular application for production...
ng build --configuration production

if %errorlevel% equ 0 (
    echo ✅ Frontend build completed successfully!
    echo 📁 Built files are in: dist\aptitude-game-site\
    echo.
    echo 🎯 Next steps:
    echo 1. Deploy the contents of 'dist\aptitude-game-site\' to your static hosting service
    echo 2. Deploy the 'socket-server\' directory to your backend hosting service
    echo 3. Update the environment URLs in your deployment platform
    echo.
    echo 📖 See DEPLOYMENT.md for detailed instructions
) else (
    echo ❌ Build failed. Please check the errors above.
    exit /b 1
)
