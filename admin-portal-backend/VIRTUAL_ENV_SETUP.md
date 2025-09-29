# Working with Existing Virtual Environment

## If you already have a virtual environment set up:

### 1. Activate your existing virtual environment
```bash
# In PythonAnywhere console:
workon admin-portal
# OR
source /home/finalboss0504/.virtualenvs/admin-portal/bin/activate
```

### 2. Install/Update dependencies
```bash
# Make sure you're in your project directory:
cd /home/finalboss0504/admin-portal-backend

# Install any new dependencies:
pip install -r requirements.txt
```

### 3. WSGI configuration is already set up
Your WSGI file is already configured to use your virtual environment at:
`/home/finalboss0504/.virtualenvs/admin-portal`

### 4. Upload your files
Upload these updated files to `/home/finalboss0504/admin-portal-backend/`:
- `app.py`
- `models.py`
- `wsgi.py`
- `config.json` (new file)
- `requirements.txt`

### 5. Configure your web app
- Source code: `/home/finalboss0504/admin-portal-backend`
- WSGI file: `/home/finalboss0504/admin-portal-backend/wsgi.py`
- Virtual environment: Select your existing virtual environment

### 6. Set environment variable
- Add `DB_PASSWORD` = `puravbhatt0504` in your web app configuration

## No need to create a new virtual environment!
Your existing one should work perfectly with these updates.
