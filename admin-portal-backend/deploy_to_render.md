# 🚀 Deploy to Render - 100% FREE

## Why Render?
- ✅ **Completely FREE** - No credit card required
- ✅ **750 hours/month** - More than enough for your app
- ✅ **Auto-deploys** from GitHub
- ✅ **Perfect for Flask apps**
- ✅ **Custom domains** supported
- ✅ **Always running** - No cold starts

## Step-by-Step Deployment

### Step 1: Go to Render
1. Visit [render.com](https://render.com)
2. Click "Get Started for Free"
3. Sign up with GitHub

### Step 2: Create New Web Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Select your `admin-portal` repository

### Step 3: Configure Service
- **Name**: `admin-portal-backend`
- **Root Directory**: `admin-portal-backend`
- **Runtime**: `Python 3`
- **Build Command**: `pip install -r requirements_supabase.txt`
- **Start Command**: `python wsgi_supabase.py`

### Step 4: Add Environment Variables
In the Environment Variables section, add:

```
SUPABASE_DB_HOST=db.sevlfbqydeludjfzatfe.supabase.co
SUPABASE_DB_NAME=postgres
SUPABASE_DB_USER=postgres
SUPABASE_DB_PASSWORD=puravbhatt0504
SUPABASE_DB_PORT=5432
```

### Step 5: Deploy!
1. Click "Create Web Service"
2. Wait for deployment (2-3 minutes)
3. Get your URL: `https://admin-portal-backend.onrender.com`

### Step 6: Test Your Backend
Visit: `https://your-app-name.onrender.com/api/health`

You should see: `{"status": "healthy", "database": "connected"}`

## 🎉 That's it!

Your Supabase backend is now live and FREE!

## Next: Update Frontend
Once you have your Render URL, update the frontend:
1. Open `admin-portal-frontend/static/script.js`
2. Change line 3: `let API_BASE_URL = 'https://your-app-name.onrender.com';`
3. Save and redeploy frontend to Vercel

## 🆘 Need Help?
If you get stuck, let me know what error you see!
