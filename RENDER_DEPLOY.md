# Render Deployment Guide

## 🚀 Deploying to Render - Step by Step

### Prerequisites
- GitHub repository with your code
- Render account (free tier available)

### Step 1: Deploy Backend (Web Service)

1. **Go to Render Dashboard**
   - Visit [render.com](https://render.com)
   - Sign up/Login with GitHub

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select your repository

3. **Configure Backend Service**
   ```
   Name: aptitude-game-backend
   Environment: Node
   Region: Choose closest to your users
   Branch: main (or your default branch)
   Root Directory: socket-server
   Build Command: npm install
   Start Command: npm start
   ```

4. **Environment Variables** (if needed)
   - NODE_ENV: production
   - PORT: (Render will set this automatically)

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Note the URL (e.g., `https://aptitude-game-backend.onrender.com`)

### Step 2: Deploy Frontend (Static Site)

1. **Create New Static Site**
   - Click "New +" → "Static Site"
   - Connect your GitHub repository

2. **Configure Frontend Service**
   ```
   Name: aptitude-game-frontend
   Branch: main
   Root Directory: (leave empty)
   Build Command: npm install && ng build --configuration production
   Publish Directory: dist/aptitude-game-site/browser
   ```

3. **Deploy**
   - Click "Create Static Site"
   - Wait for deployment to complete
   - Note the URL (e.g., `https://aptitude-game-frontend.onrender.com`)

### Step 3: Update Environment URLs

1. **Get your backend URL** from the Render dashboard
2. **Update environment file**:
   ```typescript
   // src/environments/environment.prod.ts
   export const environment = {
     production: true,
     apiUrl: 'https://your-backend-url.onrender.com',
     socketUrl: 'https://your-backend-url.onrender.com'
   };
   ```

3. **Redeploy frontend** after updating URLs

### Step 4: Update CORS Settings

In your backend service, update the CORS origins in `socket-server/server.js`:

```javascript
app.use(cors({
  origin: [
    "http://localhost:4200",
    "https://your-frontend-url.onrender.com" // Add your frontend URL
  ],
  methods: ["GET", "POST", "PUT"],
  credentials: true
}));
```

### Step 5: Test Your Deployment

1. **Visit your frontend URL**
2. **Create a room** and test the quiz functionality
3. **Check browser console** for any errors
4. **Test real-time features** (chat, live updates)

### Troubleshooting

**Common Issues:**
- **CORS errors**: Update CORS origins in backend
- **Socket connection failed**: Check backend URL in environment
- **Build failures**: Ensure Node.js version compatibility

**Render-specific:**
- Free tier has sleep mode (cold starts)
- Check logs in Render dashboard
- Monitor resource usage

### Cost
- **Free tier**: Both services available
- **Limitations**: Sleep mode, limited build minutes
- **Upgrade**: For production use, consider paid plans

### URLs After Deployment
- **Frontend**: `https://aptitude-game-frontend.onrender.com`
- **Backend**: `https://aptitude-game-backend.onrender.com`

Your app will be live and accessible worldwide! 🌍
