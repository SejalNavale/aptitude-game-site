@echo off
REM Render Deployment Script for Aptitude Game Site (Windows)

echo 🚀 Starting deployment process...

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: package.json not found. Please run this script from the project root.
    pause
    exit /b 1
)

echo ✅ Found package.json

REM Install dependencies
echo 📦 Installing dependencies...
npm install

REM Build the Angular app
echo 🔨 Building Angular application...
npm run build

if %errorlevel% equ 0 (
    echo ✅ Build successful!
) else (
    echo ❌ Build failed!
    pause
    exit /b 1
)

echo 🎉 Deployment preparation complete!
echo.
echo Next steps:
echo 1. Push your changes to GitHub
echo 2. Go to https://render.com
echo 3. Create a new Web Service for the backend
echo 4. Create a new Static Site for the frontend
echo 5. Follow the RENDER_DEPLOYMENT_GUIDE.md for detailed instructions

pause
