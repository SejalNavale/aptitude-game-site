#!/bin/bash

echo "🚀 Deploying to Railway..."

# Navigate to socket-server directory
cd socket-server

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Start the server
echo "🔄 Starting server..."
npm start
