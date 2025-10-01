#!/usr/bin/env python3
"""
WSGI entry point for Render deployment
"""

import os
from app_supabase import app, db

# Initialize database tables
with app.app_context():
    try:
        db.create_all()
        print("✅ Supabase database tables created successfully!")
    except Exception as e:
        print(f"❌ Error creating tables: {e}")

if __name__ == "__main__":
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)
