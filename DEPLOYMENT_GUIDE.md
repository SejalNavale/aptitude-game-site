# Easy Deployment Guide

## 🚀 Quick Deployment Options

### Option 1: Vercel + Railway (Recommended)

#### Frontend (Angular) → Vercel
1. **Push your code to GitHub** (if not already done)
2. **Go to [vercel.com](https://vercel.com)**
3. **Sign in with GitHub**
4. **Click "New Project"**
5. **Import your repository**
6. **Configure build settings:**
   - Framework Preset: `Angular`
   - Build Command: `npm run build:prod`
   - Output Directory: `dist/aptitude-game-site`
7. **Deploy!** (Takes ~2-3 minutes)

#### Backend (Node.js) → Railway
1. **Go to [railway.app](https://railway.app)**
2. **Sign in with GitHub**
3. **Click "New Project" → "Deploy from GitHub repo"**
4. **Select your repository**
5. **Configure settings:**
   - Root Directory: `socket-server`
   - Build Command: `npm install`
   - Start Command: `npm start`
6. **Add Environment Variables:**
   - `NODE_ENV=production`
   - `PORT=3000`
7. **Deploy!** (Takes ~5-7 minutes)

### Option 2: Netlify + Railway

#### Frontend → Netlify
1. **Go to [netlify.com](https://netlify.com)**
2. **Connect GitHub repository**
3. **Build settings:**
   - Build command: `npm run build:prod`
   - Publish directory: `dist/aptitude-game-site`
4. **Deploy!**

### Option 3: All-in-One Solutions

#### Railway (Full Stack)
- Deploy both frontend and backend on Railway
- Use Railway's static site hosting for Angular
- Use Railway's service hosting for Node.js

#### DigitalOcean App Platform
- Supports both frontend and backend
- More expensive but very reliable
- Good for production apps

## 🔧 Environment Variables

### Frontend (Vercel/Netlify)
- `NODE_ENV=production`

### Backend (Railway)
- `NODE_ENV=production`
- `PORT=3000`
- `MONGODB_URI=your_mongodb_connection_string`

## 📝 Post-Deployment

1. **Update your Angular environment files** with the new backend URL
2. **Test the Socket.IO connection**
3. **Verify database connectivity**
4. **Test all features**

## 🆓 Free Tier Limits

- **Vercel**: 100GB bandwidth/month, unlimited deployments
- **Railway**: $5 credit/month (usually enough for small apps)
- **Netlify**: 100GB bandwidth/month, 300 build minutes

## 🚀 Quick Start Commands

```bash
# Build for production
npm run build:prod

# Test locally
npm start

# Deploy to Vercel (if using Vercel CLI)
vercel --prod
```
