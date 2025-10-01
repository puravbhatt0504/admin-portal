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
        'psycopg2-binary'
    ]
    
    for package in packages:
        try:
            subprocess.check_call([sys.executable, '-m', 'pip', 'install', package])
            print(f"✅ Installed {package}")
        except subprocess.CalledProcessError as e:
            print(f"❌ Failed to install {package}: {e}")

def main():
    print("🚀 Setting up PythonAnywhere for Supabase migration")
    print("=" * 60)
    
    # Install dependencies
    install_dependencies()
    
    print("\n📋 Next steps:")
    print("1. Run: python migrate_on_pythonanywhere.py")
    print("2. All passwords are already configured in the script!")
    print("\n🎉 Setup complete!")

if __name__ == "__main__":
    main()
