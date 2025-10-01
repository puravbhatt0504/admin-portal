#!/usr/bin/env python3
"""
Test Supabase connection with different methods
"""

import psycopg2

def test_connection_pooler():
    """Test connection using pooler"""
    print("🔍 Testing connection with pooler...")
    try:
        conn = psycopg2.connect(
            host='aws-1-ap-south-1.pooler.supabase.com',
            database='postgres',
            user='postgres.sevlfbqydeludjfzatfe',
            password='puravbhatt0504',
            port='6543',
            sslmode='require'
        )
        print("✅ Pooler connection successful!")
        conn.close()
        return True
    except Exception as e:
        print(f"❌ Pooler connection failed: {e}")
        return False

def test_connection_direct():
    """Test connection using direct host"""
    print("🔍 Testing connection with direct host...")
    try:
        conn = psycopg2.connect(
            host='db.sevlfbqydeludjfzatfe.supabase.co',
            database='postgres',
            user='postgres',
            password='puravbhatt0504',
            port='5432',
            sslmode='require'
        )
        print("✅ Direct connection successful!")
        conn.close()
        return True
    except Exception as e:
        print(f"❌ Direct connection failed: {e}")
        return False

def test_connection_alternative():
    """Test connection with alternative settings"""
    print("🔍 Testing connection with alternative settings...")
    try:
        conn = psycopg2.connect(
            host='aws-1-ap-south-1.pooler.supabase.com',
            database='postgres',
            user='postgres.sevlfbqydeludjfzatfe',
            password='puravbhatt0504',
            port='5432',  # Try port 5432 instead of 6543
            sslmode='require'
        )
        print("✅ Alternative connection successful!")
        conn.close()
        return True
    except Exception as e:
        print(f"❌ Alternative connection failed: {e}")
        return False

def main():
    print("🚀 Testing Supabase connection methods...")
    print("=" * 50)
    
    # Test different connection methods
    if test_connection_pooler():
        print("\n✅ Use pooler connection in migration script")
    elif test_connection_direct():
        print("\n✅ Use direct connection in migration script")
    elif test_connection_alternative():
        print("\n✅ Use alternative connection in migration script")
    else:
        print("\n❌ All connection methods failed")
        print("Please check:")
        print("1. Supabase database is running")
        print("2. Password is correct")
        print("3. Database credentials in Supabase dashboard")

if __name__ == "__main__":
    main()
