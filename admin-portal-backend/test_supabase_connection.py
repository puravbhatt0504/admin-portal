#!/usr/bin/env python3
"""
Test script to verify Supabase connection and dependencies
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_imports():
    """Test if all required modules can be imported"""
    try:
        print("Testing imports...")
        
        import flask
        print("✅ Flask imported")
        
        import psycopg2
        print("✅ psycopg2 imported")
        
        from sqlalchemy import create_engine
        print("✅ SQLAlchemy imported")
        
        from models import Base, Employee, Attendance, TravelExpense, GeneralExpense, Advance
        print("✅ Models imported")
        
        return True
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False

def test_database_connection():
    """Test database connection"""
    try:
        print("\nTesting database connection...")
        
        # Get environment variables
        db_user = os.environ.get('SUPABASE_DB_USER', 'postgres')
        db_password = os.environ.get('SUPABASE_DB_PASSWORD', 'puravbhatt0504')
        db_host = os.environ.get('SUPABASE_DB_HOST', 'db.sevlfbqydeludjfzatfe.supabase.co')
        db_name = os.environ.get('SUPABASE_DB_NAME', 'postgres')
        db_port = os.environ.get('SUPABASE_DB_PORT', '5432')
        
        # Test connection
        import psycopg2
        connection = psycopg2.connect(
            host=db_host,
            database=db_name,
            user=db_user,
            password=db_password,
            port=db_port,
            sslmode='require'
        )
        
        if connection:
            print("✅ Database connection successful")
            connection.close()
            return True
        else:
            print("❌ Database connection failed")
            return False
            
    except Exception as e:
        print(f"❌ Database connection error: {e}")
        return False

def main():
    print("🧪 Testing Supabase Backend Setup")
    print("=" * 40)
    
    # Test imports
    imports_ok = test_imports()
    
    # Test database connection
    db_ok = test_database_connection()
    
    print("\n" + "=" * 40)
    if imports_ok and db_ok:
        print("🎉 All tests passed! Ready for deployment.")
        return True
    else:
        print("❌ Some tests failed. Check the errors above.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
