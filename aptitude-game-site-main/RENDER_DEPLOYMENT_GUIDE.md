# Render Deployment Guide for Aptitude Game Site

This guide will help you deploy both the frontend and backend of the Aptitude Game Site on Render.

## Prerequisites

1. A Render account (sign up at https://render.com)
2. Your GitHub repository connected to Render
3. MongoDB Atlas account (for database)

## Backend Deployment (Socket Server)

### Step 1: Create Web Service

1. Go to your Render dashboard
2. Click "New +" → "Web Service"
3. Connect your GitHub repository: `https://github.com/SejalNavale/aptitude-game-site.git`
4. Configure the service:
   - **Name**: `aptitude-game-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd aptitude-game-site-main/socket-server && npm install`
   - **Start Command**: `cd aptitude-game-site-main/socket-server && npm start`
   - **Plan**: Free

### Step 2: Environment Variables

Add these environment variables in Render dashboard:

```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://ayushshirke123_db_user:IIT_project@quizappcluster.hnwrp1w.mongodb.net/IIT_project?retryWrites=true&w=majority&appName=QuizAppCluster
FRONTEND_URL=https://aptitude-game-frontend.onrender.com
```

### Step 3: Deploy

Click "Create Web Service" and wait for deployment to complete.

## Frontend Deployment (Angular App)

### Step 1: Create Static Site

1. Go to your Render dashboard
2. Click "New +" → "Static Site"
3. Connect your GitHub repository: `https://github.com/SejalNavale/aptitude-game-site.git`
4. Configure the service:
   - **Name**: `aptitude-game-frontend`
   - **Build Command**: `cd aptitude-game-site-main && npm install && npm run build`
   - **Publish Directory**: `aptitude-game-site-main/dist/aptitude-game-site`
   - **Plan**: Free

### Step 2: Environment Variables

Add these environment variables:

```
NODE_ENV=production
```

### Step 3: Deploy

Click "Create Static Site" and wait for deployment to complete.

## Database Setup

The application uses MongoDB Atlas. The connection string is already configured in the backend.

## Post-Deployment Configuration

1. **Update Frontend URL**: After both services are deployed, update the `FRONTEND_URL` environment variable in the backend service with the actual frontend URL.

2. **Test the Application**: 
   - Frontend URL: `https://aptitude-game-frontend.onrender.com`
   - Backend URL: `https://aptitude-game-backend.onrender.com`

## Troubleshooting

### Common Issues:

1. **CORS Errors**: Make sure the `FRONTEND_URL` environment variable is set correctly in the backend.

2. **Build Failures**: Check the build logs in Render dashboard for specific error messages.

3. **Database Connection**: Verify the MongoDB connection string is correct.

4. **Port Issues**: Render automatically assigns ports, so the PORT environment variable should be set to 10000.

## Environment Variables Reference

### Backend Service:
- `NODE_ENV=production`
- `PORT=10000`
- `MONGODB_URI=<your-mongodb-connection-string>`
- `FRONTEND_URL=<your-frontend-url>`

### Frontend Service:
- `NODE_ENV=production`

## URLs After Deployment

- **Frontend**: `https://aptitude-game-frontend.onrender.com`
- **Backend**: `https://aptitude-game-backend.onrender.com`
- **Backend Health Check**: `https://aptitude-game-backend.onrender.com/`

## Notes

- Free tier services may sleep after inactivity and take time to wake up
- Consider upgrading to paid plans for better performance and reliability
- Monitor the logs in Render dashboard for any issues
