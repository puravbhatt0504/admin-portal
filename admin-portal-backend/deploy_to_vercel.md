# 🚀 Deploy to Vercel - 100% FREE

## Why Vercel?
- ✅ **100% FREE** - No credit card required
- ✅ **Serverless functions** - Pay per use (generous free tier)
- ✅ **Instant deployments** from GitHub
- ✅ **Great performance** - Global CDN
- ✅ **Perfect for APIs**

## Step-by-Step Deployment

### Step 1: Go to Vercel
1. Visit [vercel.com](https://vercel.com)
2. Click "Sign Up" and connect with GitHub
3. Click "New Project"

### Step 2: Import Repository
1. Select your `admin-portal` repository
2. Set **Root Directory** to: `admin-portal-backend`
3. Vercel will auto-detect it's a Python project

### Step 3: Configure Environment Variables
In the Environment Variables section, add:

```
SUPABASE_DB_HOST=db.sevlfbqydeludjfzatfe.supabase.co
SUPABASE_DB_NAME=postgres
SUPABASE_DB_USER=postgres
SUPABASE_DB_PASSWORD=puravbhatt0504
SUPABASE_DB_PORT=5432
```

### Step 4: Deploy!
1. Click "Deploy"
2. Wait for deployment (1-2 minutes)
3. Get your URL: `https://admin-portal-backend.vercel.app`

### Step 5: Test Your Backend
Visit: `https://your-app-name.vercel.app/api/health`

You should see: `{"status": "healthy", "database": "connected"}`

## 🎉 That's it!

Your Supabase backend is now live and FREE!

## Next: Update Frontend
Once you have your Vercel URL, update the frontend:
1. Open `admin-portal-frontend/static/script.js`
2. Change line 3: `let API_BASE_URL = 'https://your-app-name.vercel.app';`
3. Save and redeploy frontend to Vercel

## 🆘 Need Help?
If you get stuck, let me know what error you see!
