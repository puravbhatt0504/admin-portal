# Deployment Guide

## 🚀 Complete Deployment Instructions

### Step 1: Upload to GitHub

1. **Create a new repository on GitHub:**
   - Go to [github.com](https://github.com)
   - Click "New repository"
   - Name: `admin-portal` (or your preferred name)
   - Make it public or private
   - Don't initialize with README (we already have one)

2. **Upload your files:**
   - Click "uploading an existing file"
   - Drag and drop your entire project folder
   - Or use GitHub Desktop/Git CLI if you prefer

3. **Commit your files:**
   - Add commit message: "Initial commit - Complete admin portal"
   - Click "Commit changes"

### Step 2: Deploy Frontend to Vercel

1. **Go to [vercel.com](https://vercel.com)**
2. **Sign up/Login** (use GitHub account for easy integration)
3. **Click "New Project"**
4. **Import from GitHub:**
   - Select your `admin-portal` repository
   - Choose `admin-portal-frontend` as the root directory
   - Or leave empty if you want to deploy the whole project
5. **Configure deployment:**
   - Framework: Other
   - Build Command: (leave empty)
   - Output Directory: `admin-portal-frontend` (if deploying whole project)
6. **Click "Deploy"**

### Step 3: Deploy Backend to PythonAnywhere

1. **Go to [pythonanywhere.com](https://pythonanywhere.com)**
2. **Upload backend files:**
   - Upload `admin-portal-backend/` folder contents
   - Place in `/home/yourusername/admin-portal-backend/`
3. **Install dependencies:**
   ```bash
   pip3.10 install --user -r requirements.txt
   ```
4. **Configure web app:**
   - Source code: `/home/yourusername/admin-portal-backend`
   - WSGI file: `/home/yourusername/admin-portal-backend/wsgi.py`
5. **Set environment variables:**
   - `DB_PASSWORD` = your database password
6. **Reload web app**

### Step 4: Test Your Deployment

1. **Frontend URL:** `https://your-project.vercel.app`
2. **Backend URL:** `https://yourusername.pythonanywhere.com`
3. **Test features:**
   - Add an employee
   - Log attendance
   - Add expenses
   - Generate reports

## 🔧 Configuration Files

### Frontend (Vercel)
- `vercel.json` - Vercel configuration
- `package.json` - Project metadata
- Auto-detects API URL from backend

### Backend (PythonAnywhere)
- `wsgi.py` - WSGI configuration
- `app.py` - Flask application
- `config.json` - App settings
- `requirements.txt` - Dependencies

## 🌐 Live URLs

After deployment, your admin portal will be available at:

- **Frontend:** `https://your-project-name.vercel.app`
- **Backend API:** `https://yourusername.pythonanywhere.com`
- **API Endpoints:** `https://yourusername.pythonanywhere.com/api/`

## 🔄 Automatic Updates

- **Frontend:** Updates automatically when you push to GitHub
- **Backend:** Manual updates required (upload new files)

## 🛠️ Troubleshooting

### Frontend Issues
- Check browser console for errors
- Verify API URL is correct
- Ensure backend is running

### Backend Issues
- Check PythonAnywhere error logs
- Verify database connection
- Check environment variables

### Database Issues
- Verify MySQL credentials
- Check database permissions
- Ensure tables are created

## 📱 Mobile Access

Your admin portal is fully responsive and works on:
- 📱 Mobile phones
- 📱 Tablets
- 💻 Desktop computers
- 🌐 Any modern web browser

## 🔒 Security Notes

- Backend has CORS enabled for frontend
- Database credentials are environment variables
- Input validation on all forms
- Error handling throughout

## 📊 Monitoring

- Vercel provides deployment analytics
- PythonAnywhere shows server logs
- Monitor database usage
- Check API response times

Your complete admin portal is now live and accessible worldwide! 🌍
