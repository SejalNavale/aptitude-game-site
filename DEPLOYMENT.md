# Deployment Guide for Aptitude Game Site

This guide covers deploying the full-stack aptitude game application with Angular frontend and Node.js backend.

## Architecture Overview

- **Frontend**: Angular application (static files)
- **Backend**: Node.js/Express server with Socket.io
- **Database**: MongoDB Atlas (already configured)
- **Deployment**: Supports Heroku, Render, Vercel, and other platforms

## Prerequisites

- Node.js (v16 or higher)
- Git
- Account on your chosen deployment platform

## Deployment Options

### Option 1: Render (Recommended)

#### Frontend Deployment (Static Site)
1. Connect your GitHub repository to Render
2. Create a new "Static Site" service
3. Configure:
   - **Build Command**: `npm install && ng build --configuration production`
   - **Publish Directory**: `dist/aptitude-game-site/browser`
   - **Node Version**: 18.x

#### Backend Deployment (Web Service)
1. Create a new "Web Service" on Render
2. Configure:
   - **Build Command**: `cd socket-server && npm install`
   - **Start Command**: `cd socket-server && npm start`
   - **Node Version**: 18.x
   - **Environment Variables**: None required (MongoDB Atlas already configured)

### Option 2: Heroku

#### Deploy Backend
```bash
# Install Heroku CLI
# Login to Heroku
heroku login

# Create Heroku app
heroku create your-app-name-backend

# Set buildpacks
heroku buildpacks:set heroku/nodejs

# Deploy
git add .
git commit -m "Deploy backend"
git push heroku main
```

#### Deploy Frontend
1. Use Heroku's static site hosting or deploy to Vercel/Netlify
2. Update environment variables in `src/environments/environment.prod.ts`

### Option 3: Vercel (Frontend) + Railway (Backend)

#### Frontend on Vercel
1. Connect GitHub repository to Vercel
2. Configure build settings:
   - **Framework Preset**: Angular
   - **Build Command**: `ng build --configuration production`
   - **Output Directory**: `dist/aptitude-game-site/browser`

#### Backend on Railway
1. Connect GitHub repository to Railway
2. Set root directory to `socket-server`
3. Railway will auto-detect Node.js and run `npm start`

## Environment Configuration

### Frontend Environment
The production environment is already configured in `src/environments/environment.prod.ts`:
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-backend-url.com',
  socketUrl: 'https://your-backend-url.com'
};
```

### Backend Configuration
The backend is already configured with:
- MongoDB Atlas connection
- CORS settings for production domains
- Socket.io configuration

## Build and Deploy Commands

### Local Build (for testing)
```bash
# Install dependencies
npm install

# Build frontend
ng build --configuration production

# Test backend locally
cd socket-server
npm install
npm start
```

### Production Deployment
```bash
# Build frontend
npm run build

# The built files will be in dist/aptitude-game-site/
# Deploy these static files to your hosting service
```

## Database Setup

The application uses MongoDB Atlas with the following collections:
- `questions`: Quiz questions
- `scores`: Player scores
- `usersettings`: User preferences

The database is already seeded with sample questions.

## Post-Deployment Steps

1. **Update CORS settings** in `socket-server/server.js` if needed
2. **Update environment URLs** in `src/environments/environment.prod.ts`
3. **Test the application** end-to-end
4. **Monitor logs** for any issues

## Troubleshooting

### Common Issues

1. **CORS Errors**: Update the CORS origins in `socket-server/server.js`
2. **Socket Connection Failed**: Check if backend is running and accessible
3. **Build Failures**: Ensure Node.js version compatibility
4. **Database Connection**: Verify MongoDB Atlas connection string

### Logs and Monitoring

- Check deployment platform logs for errors
- Monitor MongoDB Atlas for connection issues
- Use browser developer tools for frontend debugging

## Security Considerations

- MongoDB Atlas connection uses authentication
- CORS is configured for specific domains
- No sensitive data in environment variables

## Scaling Considerations

- Backend can be scaled horizontally
- MongoDB Atlas handles database scaling
- Consider CDN for static assets
- Monitor Socket.io connection limits

## Support

For deployment issues:
1. Check platform-specific documentation
2. Review application logs
3. Test locally first
4. Verify all environment variables
