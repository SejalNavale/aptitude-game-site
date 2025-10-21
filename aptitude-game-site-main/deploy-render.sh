#!/bin/bash

# Render Deployment Script for Aptitude Game Site

echo "🚀 Starting deployment process..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

echo "✅ Found package.json"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the Angular app
echo "🔨 Building Angular application..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed!"
    exit 1
fi

echo "🎉 Deployment preparation complete!"
echo ""
echo "Next steps:"
echo "1. Push your changes to GitHub"
echo "2. Go to https://render.com"
echo "3. Create a new Web Service for the backend"
echo "4. Create a new Static Site for the frontend"
echo "5. Follow the RENDER_DEPLOYMENT_GUIDE.md for detailed instructions"
