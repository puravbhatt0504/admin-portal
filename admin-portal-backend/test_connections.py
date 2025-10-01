#!/usr/bin/env python3
"""
Test different connection methods for Supabase from PythonAnywhere
"""

import psycopg2
import socket

def test_network_connectivity():
    """Test if we can reach Supabase servers"""
    print("🔍 Testing network connectivity...")
    
    hosts_to_test = [
        ('db.sevlfbqydeludjfzatfe.supabase.co', 5432),
        ('aws-1-ap-south-1.pooler.supabase.com', 6543),
        ('aws-1-ap-south-1.pooler.supabase.com', 5432),
    ]
    
    for host, port in hosts_to_test:
        try:
            print(f"Testing {host}:{port}...")
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(10)
            result = sock.connect_ex((host, port))
            sock.close()
            
            if result == 0:
                print(f"✅ {host}:{port} is reachable")
            else:
                print(f"❌ {host}:{port} is not reachable")
        except Exception as e:
            print(f"❌ {host}:{port} error: {e}")

def test_connection_methods():
    """Test different connection methods"""
    print("\n🔍 Testing connection methods...")
    
    # Method 1: Direct connection with different SSL modes
    ssl_modes = ['require', 'prefer', 'disable']
    for ssl_mode in ssl_modes:
        try:
            print(f"Testing direct connection with sslmode={ssl_mode}...")
            conn = psycopg2.connect(
                host='db.sevlfbqydeludjfzatfe.supabase.co',
                database='postgres',
                user='postgres',
                password='puravbhatt0504',
                port='5432',
                sslmode=ssl_mode,
                connect_timeout=10
            )
            print(f"✅ Direct connection with sslmode={ssl_mode} successful!")
            conn.close()
            return True
        except Exception as e:
            print(f"❌ Direct connection with sslmode={ssl_mode} failed: {e}")
    
    # Method 2: Pooler connection
    try:
        print("Testing pooler connection...")
        conn = psycopg2.connect(
            host='aws-1-ap-south-1.pooler.supabase.com',
            database='postgres',
            user='postgres.sevlfbqydeludjfzatfe',
            password='puravbhatt0504',
            port='6543',
            sslmode='require',
            connect_timeout=10
        )
        print("✅ Pooler connection successful!")
        conn.close()
        return True
    except Exception as e:
        print(f"❌ Pooler connection failed: {e}")
    
    # Method 3: Alternative pooler port
    try:
        print("Testing pooler connection on port 5432...")
        conn = psycopg2.connect(
            host='aws-1-ap-south-1.pooler.supabase.com',
            database='postgres',
            user='postgres.sevlfbqydeludjfzatfe',
            password='puravbhatt0504',
            port='5432',
            sslmode='require',
            connect_timeout=10
        )
        print("✅ Pooler connection on port 5432 successful!")
        conn.close()
        return True
    except Exception as e:
        print(f"❌ Pooler connection on port 5432 failed: {e}")
    
    return False

def main():
    print("🚀 Testing Supabase connectivity from PythonAnywhere")
    print("=" * 60)
    
    # Test network connectivity
    test_network_connectivity()
    
    # Test connection methods
    if test_connection_methods():
        print("\n✅ At least one connection method works!")
    else:
        print("\n❌ All connection methods failed")
        print("\nPossible solutions:")
        print("1. Check if PythonAnywhere allows outbound connections to Supabase")
        print("2. Try using a different PythonAnywhere account type")
        print("3. Contact PythonAnywhere support about network restrictions")
        print("4. Consider using a different hosting service for migration")

if __name__ == "__main__":
    main()
