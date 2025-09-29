# PythonAnywhere Deployment Guide

## Files to Upload
Upload these files to your PythonAnywhere account in the directory `/home/finalboss0504/admin-portal-backend/`:

- `app.py` (main Flask application)
- `models.py` (database models)
- `wsgi.py` (WSGI configuration)
- `requirements.txt` (Python dependencies)
- `config.json` (application configuration)
- `seed.py` (optional: for database seeding)

## Step-by-Step Deployment Instructions

### 1. Create Directory on PythonAnywhere
```bash
# In PythonAnywhere console, run:
mkdir -p /home/finalboss0504/admin-portal-backend
cd /home/finalboss0504/admin-portal-backend
```

### 2. Upload Files
Upload all the files listed above to `/home/finalboss0504/admin-portal-backend/`

### 3. Install Dependencies
```bash
# In PythonAnywhere console:
cd /home/finalboss0504/admin-portal-backend
pip3.10 install --user -r requirements.txt
```

### 4. Set Environment Variable
In your PythonAnywhere web app configuration:
- Go to Web tab
- Find your web app
- Click on "Environment variables"
- Add: `DB_PASSWORD` = `puravbhatt0504`

### 5. Configure Web App
- Source code: `/home/finalboss0504/admin-portal-backend`
- WSGI configuration file: `/home/finalboss0504/admin-portal-backend/wsgi.py`

### 6. Test the Application
- Reload your web app
- Visit your domain to test the API endpoints
- Check that `/api/config` returns the travel rate configuration

## Database Configuration
Your database is already configured in `app.py`:
- Host: finalboss0504.mysql.pythonanywhere-services.com
- Username: finalboss0504
- Database: finalboss0504$default
- Password: Set via environment variable `DB_PASSWORD`

## Troubleshooting
- If you get import errors, check that all files are in the correct directory
- If database connection fails, verify the environment variable is set
- Check the error logs in PythonAnywhere for specific issues
