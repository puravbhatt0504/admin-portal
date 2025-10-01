#!/usr/bin/env python3
"""
Setup script for PythonAnywhere migration
Run this on PythonAnywhere to install dependencies and run migration
"""

import subprocess
import sys
import os

def install_dependencies():
    """Install required packages for migration"""
    print("📦 Installing dependencies...")
    
    packages = [
        'psycopg2-binary',
        'python-dotenv'
    ]
    
    for package in packages:
        try:
            subprocess.check_call([sys.executable, '-m', 'pip', 'install', package])
            print(f"✅ Installed {package}")
        except subprocess.CalledProcessError as e:
            print(f"❌ Failed to install {package}: {e}")

def create_env_file():
    """Create .env file with Supabase credentials"""
    print("📝 Creating .env file...")
    
    env_content = """# Supabase Database Configuration
SUPABASE_DB_HOST=aws-1-ap-south-1.pooler.supabase.com
SUPABASE_DB_NAME=postgres
SUPABASE_DB_USER=postgres.sevlfbqydeludjfzatfe
SUPABASE_DB_PASSWORD=your_actual_password_here
SUPABASE_DB_PORT=6543

# Old MySQL Password (for migration)
OLD_MYSQL_PASSWORD=your_old_pythonanywhere_password
"""
    
    with open('.env', 'w') as f:
        f.write(env_content)
    
    print("✅ .env file created")
    print("⚠️  Please update the passwords in .env file before running migration!")

def main():
    print("🚀 Setting up PythonAnywhere for Supabase migration")
    print("=" * 60)
    
    # Install dependencies
    install_dependencies()
    
    # Create .env file
    create_env_file()
    
    print("\n📋 Next steps:")
    print("1. Update passwords in .env file")
    print("2. Run: python migrate_on_pythonanywhere.py")
    print("\n🎉 Setup complete!")

if __name__ == "__main__":
    main()
