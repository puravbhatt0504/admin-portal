#!/usr/bin/env python3
"""
Export data from PythonAnywhere MySQL to JSON files
This script exports all data to JSON files that can be imported locally
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

def export_table_data(cursor, table_name, columns):
    """Export data from a specific table"""
    try:
        query = f"SELECT * FROM {table_name}"
        cursor.execute(query)
        records = cursor.fetchall()
        
        # Convert to list of dictionaries
        data = []
        for record in records:
            row = {}
            for i, column in enumerate(columns):
                value = record[i]
                # Handle datetime objects
                if isinstance(value, (datetime, date, time)):
                    row[column] = value.isoformat()
                else:
                    row[column] = value
            data.append(row)
        
        print(f"📊 Exported {len(data)} records from {table_name}")
        return data
        
    except Error as e:
        print(f"❌ Error exporting {table_name}: {e}")
        return []

def main():
    print("🚀 Exporting data from PythonAnywhere MySQL to JSON files")
    print("=" * 60)
    
    # Connect to MySQL
    connection = create_mysql_connection()
    if not connection:
        print("❌ Cannot proceed without MySQL connection")
        return
    
    cursor = connection.cursor()
    
    try:
        # Export employees
        print("\n📋 Step 1: Exporting employees...")
        employees = export_table_data(cursor, 'employees', ['id', 'name'])
        with open('employees_export.json', 'w') as f:
            json.dump(employees, f, indent=2)
        print(f"✅ Exported {len(employees)} employees to employees_export.json")
        
        # Export attendance
        print("\n📋 Step 2: Exporting attendance...")
        attendance = export_table_data(cursor, 'attendance', 
            ['id', 'employee_id', 'employee_name', 'date', 'shift1_in', 'shift1_out', 'shift2_in', 'shift2_out'])
        with open('attendance_export.json', 'w') as f:
            json.dump(attendance, f, indent=2)
        print(f"✅ Exported {len(attendance)} attendance records to attendance_export.json")
        
        # Export travel expenses
        print("\n📋 Step 3: Exporting travel expenses...")
        travel_expenses = export_table_data(cursor, 'travel_expenses',
            ['id', 'employee_id', 'employee_name', 'date', 'start_reading', 'end_reading', 'amount', 'purpose'])
        with open('travel_expenses_export.json', 'w') as f:
            json.dump(travel_expenses, f, indent=2)
        print(f"✅ Exported {len(travel_expenses)} travel expense records to travel_expenses_export.json")
        
        # Export general expenses
        print("\n📋 Step 4: Exporting general expenses...")
        general_expenses = export_table_data(cursor, 'general_expenses',
            ['id', 'employee_id', 'employee_name', 'date', 'amount', 'purpose', 'category'])
        with open('general_expenses_export.json', 'w') as f:
            json.dump(general_expenses, f, indent=2)
        print(f"✅ Exported {len(general_expenses)} general expense records to general_expenses_export.json")
        
        # Export advances
        print("\n📋 Step 5: Exporting advances...")
        advances = export_table_data(cursor, 'advances',
            ['id', 'employee_id', 'employee_name', 'date', 'amount', 'purpose', 'status'])
        with open('advances_export.json', 'w') as f:
            json.dump(advances, f, indent=2)
        print(f"✅ Exported {len(advances)} advance records to advances_export.json")
        
        print("\n🎉 Data export completed successfully!")
        print("📁 JSON files created:")
        print("  - employees_export.json")
        print("  - attendance_export.json")
        print("  - travel_expenses_export.json")
        print("  - general_expenses_export.json")
        print("  - advances_export.json")
        print("\n📋 Next steps:")
        print("1. Download these JSON files from PythonAnywhere")
        print("2. Run the local migration script with these files")
        
    except Exception as e:
        print(f"❌ Export error: {e}")
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()
            print("✅ Database connection closed")

if __name__ == "__main__":
    main()
