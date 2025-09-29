# Vercel Deployment Guide

## Prerequisites
- Vercel account (free at vercel.com)
- Git repository (GitHub, GitLab, or Bitbucket)

## Method 1: Deploy via Vercel Dashboard (Recommended)

### Step 1: Prepare Your Repository
1. **Create a new repository** on GitHub/GitLab/Bitbucket
2. **Upload your frontend files** to the repository:
   - `index.html`
   - `static/` folder (with all CSS, JS, and assets)
   - `vercel.json`
   - `package.json`

### Step 2: Deploy on Vercel
1. **Go to [vercel.com](https://vercel.com)** and sign in
2. **Click "New Project"**
3. **Import your Git repository**
4. **Configure the project:**
   - Framework Preset: `Other`
   - Root Directory: `./` (or leave empty)
   - Build Command: Leave empty (static site)
   - Output Directory: Leave empty
5. **Click "Deploy"**

### Step 3: Configure Environment (Optional)
- Go to Project Settings → Environment Variables
- Add any environment variables if needed

## Method 2: Deploy via Vercel CLI

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Login to Vercel
```bash
vercel login
```

### Step 3: Deploy
```bash
# Navigate to your frontend directory
cd admin-portal-frontend

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Y
# - Which scope? (select your account)
# - Link to existing project? N
# - Project name: admin-portal-frontend
# - Directory: ./
```

## Method 3: Drag & Drop (Quick Test)

1. **Zip your frontend folder** (including all files)
2. **Go to vercel.com**
3. **Drag and drop** the zip file
4. **Vercel will automatically deploy** your site

## Post-Deployment

### Your site will be available at:
- `https://your-project-name.vercel.app`
- Custom domain can be added later

### Test Your Deployment:
1. **Open your Vercel URL**
2. **Check that the frontend loads**
3. **Test API connection** (should connect to your PythonAnywhere backend)
4. **Try adding an employee** to test full functionality

## Troubleshooting

### If API calls fail:
- Check browser console for CORS errors
- Verify your backend URL is correct
- Ensure your PythonAnywhere backend is running

### If static assets don't load:
- Check that all files are in the `static/` folder
- Verify file paths in your HTML

### If deployment fails:
- Check that `vercel.json` is valid JSON
- Ensure all required files are included
- Check Vercel build logs for errors

## Custom Domain (Optional)
1. **Go to Project Settings → Domains**
2. **Add your custom domain**
3. **Update DNS records** as instructed
4. **Wait for SSL certificate** to be issued

## Automatic Deployments
- **Every push to main branch** will trigger a new deployment
- **Preview deployments** for pull requests
- **Rollback** to previous versions if needed

Your admin portal will be live and accessible worldwide! 🌍
