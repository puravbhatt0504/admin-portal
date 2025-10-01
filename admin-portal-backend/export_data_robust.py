#!/usr/bin/env python3
"""
Robust data export from PythonAnywhere MySQL to JSON files
This script automatically detects table structure and exports all data
"""

import mysql.connector
from mysql.connector import Error
import json
from datetime import datetime, date, time

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

def get_table_structure(cursor, table_name):
    """Get the actual structure of a table"""
    try:
        cursor.execute(f"DESCRIBE {table_name}")
        columns = cursor.fetchall()
        column_names = [col[0] for col in columns]
        print(f"📋 Table {table_name} structure: {column_names}")
        return column_names
    except Error as e:
        print(f"❌ Error getting structure for {table_name}: {e}")
        return []

def export_table_data_robust(cursor, table_name):
    """Export data from a table with automatic structure detection"""
    try:
        # Get table structure
        columns = get_table_structure(cursor, table_name)
        if not columns:
            print(f"❌ Could not get structure for {table_name}")
            return []
        
        # Export data
        query = f"SELECT * FROM {table_name}"
        cursor.execute(query)
        records = cursor.fetchall()
        
        # Convert to list of dictionaries
        data = []
        for record in records:
            row = {}
            for i, column in enumerate(columns):
                if i < len(record):  # Safety check
                    value = record[i]
                    # Handle datetime objects
                    if isinstance(value, (datetime, date, time)):
                        row[column] = value.isoformat()
                    else:
                        row[column] = value
                else:
                    print(f"⚠️ Warning: Record has more columns than expected for {table_name}")
                    break
            data.append(row)
        
        print(f"📊 Exported {len(data)} records from {table_name}")
        return data
        
    except Error as e:
        print(f"❌ Error exporting {table_name}: {e}")
        return []

def main():
    print("🚀 Robust data export from PythonAnywhere MySQL to JSON files")
    print("=" * 70)
    
    # Connect to MySQL
    connection = create_mysql_connection()
    if not connection:
        print("❌ Cannot proceed without MySQL connection")
        return
    
    cursor = connection.cursor()
    
    try:
        # List of tables to export
        tables = ['employees', 'attendance', 'travel_expenses', 'general_expenses', 'advances']
        
        for table_name in tables:
            print(f"\n📋 Exporting {table_name}...")
            data = export_table_data_robust(cursor, table_name)
            
            if data:
                filename = f"{table_name}_export.json"
                with open(filename, 'w') as f:
                    json.dump(data, f, indent=2)
                print(f"✅ Exported {len(data)} records to {filename}")
            else:
                print(f"⚠️ No data exported for {table_name}")
        
        print("\n🎉 Data export completed!")
        print("📁 JSON files created:")
        for table_name in tables:
            print(f"  - {table_name}_export.json")
        
        print("\n📋 Next steps:")
        print("1. Download these JSON files from PythonAnywhere")
        print("2. Run the local migration script with these files")
        
    except Exception as e:
        print(f"❌ Export error: {e}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()
            print("✅ Database connection closed")

if __name__ == "__main__":
    main()
