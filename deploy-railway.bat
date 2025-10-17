@echo off
echo 🚀 Deploying to Railway...

REM Navigate to socket-server directory
cd socket-server

REM Install dependencies
echo 📦 Installing dependencies...
npm install

REM Start the server
echo 🔄 Starting server...
npm start
