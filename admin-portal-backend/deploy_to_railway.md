# 🚀 Deploy to Railway - Step by Step

## Quick Deployment Guide

### Step 1: Go to Railway
1. Visit [railway.app](https://railway.app)
2. Click "Login" and sign up with GitHub
3. Click "New Project"

### Step 2: Connect GitHub
1. Select "Deploy from GitHub repo"
2. Choose your `admin-portal` repository
3. Select "Deploy Now"

### Step 3: Configure Project
1. Railway will auto-detect it's a Python project
2. Set the **Root Directory** to: `admin-portal-backend`
3. Railway will automatically install dependencies from `requirements_supabase.txt`

### Step 4: Add Environment Variables
In the Railway dashboard, go to **Variables** tab and add:

```
SUPABASE_DB_HOST=db.sevlfbqydeludjfzatfe.supabase.co
SUPABASE_DB_NAME=postgres
SUPABASE_DB_USER=postgres
SUPABASE_DB_PASSWORD=puravbhatt0504
SUPABASE_DB_PORT=5432
```

### Step 5: Deploy!
1. Click "Deploy"
2. Wait for deployment to complete
3. Railway will give you a URL like: `https://your-app-name.railway.app`

### Step 6: Test Your Backend
Visit: `https://your-app-name.railway.app/api/health`

You should see: `{"status": "healthy", "database": "connected"}`

## 🎉 That's it!

Your Supabase backend is now live and ready to use!

## Next: Update Frontend
Once you have your Railway URL, update the frontend:
1. Open `admin-portal-frontend/static/script.js`
2. Change line 3: `let API_BASE_URL = 'https://your-app-name.railway.app';`
3. Save and redeploy frontend to Vercel

## 🆘 Need Help?
If you get stuck, let me know what error you see!
