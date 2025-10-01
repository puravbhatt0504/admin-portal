#!/usr/bin/env python3
"""
Check the structure of all tables in the database
"""

import mysql.connector
from mysql.connector import Error

def create_mysql_connection():
    """Create connection to PythonAnywhere MySQL database"""
    try:
        connection = mysql.connector.connect(
            host='finalboss0504.mysql.pythonanywhere-services.com',
            database='finalboss0504$default',
            user='finalboss0504',
            password='puravbhatt0504'
        )
        
        if connection.is_connected():
            print("✅ Connected to PythonAnywhere MySQL database")
            return connection
        else:
            print("❌ Failed to connect to MySQL")
            return None
            
    except Error as e:
        print(f"❌ MySQL connection error: {e}")
        return None

def check_table_structure(cursor, table_name):
    """Check the structure of a specific table"""
    try:
        print(f"\n📋 Table: {table_name}")
        print("-" * 50)
        
        # Get table structure
        cursor.execute(f"DESCRIBE {table_name}")
        columns = cursor.fetchall()
        
        print("Columns:")
        for col in columns:
            print(f"  - {col[0]} ({col[1]}) - {'NULL' if col[2] == 'YES' else 'NOT NULL'}")
        
        # Get sample data
        cursor.execute(f"SELECT * FROM {table_name} LIMIT 3")
        sample_records = cursor.fetchall()
        
        print(f"\nSample data ({len(sample_records)} records):")
        for i, record in enumerate(sample_records):
            print(f"  Record {i+1}: {record}")
        
        return True
        
    except Error as e:
        print(f"❌ Error checking {table_name}: {e}")
        return False

def main():
    print("🔍 Checking database table structures")
    print("=" * 50)
    
    # Connect to MySQL
    connection = create_mysql_connection()
    if not connection:
        print("❌ Cannot proceed without MySQL connection")
        return
    
    cursor = connection.cursor()
    
    try:
        # List of tables to check
        tables = ['employees', 'attendance', 'travel_expenses', 'general_expenses', 'advances']
        
        for table_name in tables:
            check_table_structure(cursor, table_name)
        
        print("\n✅ Table structure check completed!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()
            print("✅ Database connection closed")

if __name__ == "__main__":
    main()
