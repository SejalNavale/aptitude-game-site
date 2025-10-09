#!/bin/bash

# Deployment script for Aptitude Game Site
# This script builds the frontend and prepares for deployment

echo "🚀 Starting deployment process..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if Angular CLI is installed
if ! command -v ng &> /dev/null; then
    echo "📦 Installing Angular CLI globally..."
    npm install -g @angular/cli
fi

echo "📦 Installing dependencies..."
npm install

echo "🔨 Building Angular application for production..."
ng build --configuration production

if [ $? -eq 0 ]; then
    echo "✅ Frontend build completed successfully!"
    echo "📁 Built files are in: dist/aptitude-game-site/"
    echo ""
    echo "🎯 Next steps:"
    echo "1. Deploy the contents of 'dist/aptitude-game-site/' to your static hosting service"
    echo "2. Deploy the 'socket-server/' directory to your backend hosting service"
    echo "3. Update the environment URLs in your deployment platform"
    echo ""
    echo "📖 See DEPLOYMENT.md for detailed instructions"
else
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi
