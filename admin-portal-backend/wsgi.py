# This file is used by the PythonAnywhere server to find and run your web application.

import sys
import os

# Add your project's directory to the Python path.
# This ensures that Python can find your 'app.py' and 'models.py' files.
path = '/home/finalboss0504/admin-portal-backend'
if path not in sys.path:
    sys.path.insert(0, path)

# Set environment variable for database password
os.environ['DB_PASSWORD'] = 'puravbhatt0504'

# Activate your virtual environment
activate_this = '/home/finalboss0504/.virtualenvs/admin-portal/bin/activate_this.py'
exec(open(activate_this).read(), dict(__file__=activate_this))

# Import the 'app' object from your 'app.py' file and rename it to 'application'.
# The PythonAnywhere server looks for an object named 'application' to run.
from app import app as application  # noqa: F401 - This is used by PythonAnywhere WSGI

