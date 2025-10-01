#!/usr/bin/env python3
"""
Corrected data export from PythonAnywhere MySQL to JSON files
Based on actual table structures found
"""

import mysql.connector
from mysql.connector import Error
import json
from datetime import datetime, date, time, timedelta

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

def convert_timedelta_to_time(td):
    """Convert timedelta to time string"""
    if td is None or td == timedelta(0):
        return None
    total_seconds = int(td.total_seconds())
    hours = total_seconds // 3600
    minutes = (total_seconds % 3600) // 60
    seconds = total_seconds % 60
    return f"{hours:02d}:{minutes:02d}:{seconds:02d}"

def export_employees(cursor):
    """Export employees data"""
    print("📋 Exporting employees...")
    try:
        cursor.execute("SELECT id, name FROM employees")
        records = cursor.fetchall()
        
        data = []
        for record in records:
            data.append({
                'id': record[0],
                'name': record[1]
            })
        
        print(f"📊 Exported {len(data)} employees")
        return data
    except Error as e:
        print(f"❌ Error exporting employees: {e}")
        return []

def export_attendance(cursor):
    """Export attendance data"""
    print("📋 Exporting attendance...")
    try:
        cursor.execute("SELECT id, employee_name, date, shift1_in, shift1_out, shift2_in, shift2_out FROM attendance")
        records = cursor.fetchall()
        
        data = []
        for record in records:
            data.append({
                'id': record[0],
                'employee_name': record[1],
                'date': record[2].isoformat() if record[2] else None,
                'shift1_in': convert_timedelta_to_time(record[3]),
                'shift1_out': convert_timedelta_to_time(record[4]),
                'shift2_in': convert_timedelta_to_time(record[5]),
                'shift2_out': convert_timedelta_to_time(record[6])
            })
        
        print(f"📊 Exported {len(data)} attendance records")
        return data
    except Error as e:
        print(f"❌ Error exporting attendance: {e}")
        return []

def export_travel_expenses(cursor):
    """Export travel expenses data"""
    print("📋 Exporting travel expenses...")
    try:
        cursor.execute("SELECT id, employee_name, date, start_reading, end_reading, distance, rate, amount FROM travel_expenses")
        records = cursor.fetchall()
        
        data = []
        for record in records:
            data.append({
                'id': record[0],
                'employee_name': record[1],
                'date': record[2].isoformat() if record[2] else None,
                'start_reading': record[3],
                'end_reading': record[4],
                'distance': record[5],
                'rate': record[6],
                'amount': record[7]
            })
        
        print(f"📊 Exported {len(data)} travel expense records")
        return data
    except Error as e:
        print(f"❌ Error exporting travel expenses: {e}")
        return []

def export_general_expenses(cursor):
    """Export general expenses data"""
    print("📋 Exporting general expenses...")
    try:
        cursor.execute("SELECT id, employee_name, date, description, amount FROM general_expenses")
        records = cursor.fetchall()
        
        data = []
        for record in records:
            data.append({
                'id': record[0],
                'employee_name': record[1],
                'date': record[2].isoformat() if record[2] else None,
                'description': record[3],
                'amount': record[4]
            })
        
        print(f"📊 Exported {len(data)} general expense records")
        return data
    except Error as e:
        print(f"❌ Error exporting general expenses: {e}")
        return []

def export_advances(cursor):
    """Export advances data"""
    print("📋 Exporting advances...")
    try:
        cursor.execute("SELECT id, employee_name, date, amount, notes FROM advances")
        records = cursor.fetchall()
        
        data = []
        for record in records:
            data.append({
                'id': record[0],
                'employee_name': record[1],
                'date': record[2].isoformat() if record[2] else None,
                'amount': record[3],
                'notes': record[4]
            })
        
        print(f"📊 Exported {len(data)} advance records")
        return data
    except Error as e:
        print(f"❌ Error exporting advances: {e}")
        return []

def main():
    print("🚀 Corrected data export from PythonAnywhere MySQL to JSON files")
    print("=" * 70)
    
    # Connect to MySQL
    connection = create_mysql_connection()
    if not connection:
        print("❌ Cannot proceed without MySQL connection")
        return
    
    cursor = connection.cursor()
    
    try:
        # Export all tables
        employees = export_employees(cursor)
        attendance = export_attendance(cursor)
        travel_expenses = export_travel_expenses(cursor)
        general_expenses = export_general_expenses(cursor)
        advances = export_advances(cursor)
        
        # Save to JSON files
        print("\n💾 Saving to JSON files...")
        
        with open('employees_export.json', 'w') as f:
            json.dump(employees, f, indent=2)
        print("✅ Saved employees_export.json")
        
        with open('attendance_export.json', 'w') as f:
            json.dump(attendance, f, indent=2)
        print("✅ Saved attendance_export.json")
        
        with open('travel_expenses_export.json', 'w') as f:
            json.dump(travel_expenses, f, indent=2)
        print("✅ Saved travel_expenses_export.json")
        
        with open('general_expenses_export.json', 'w') as f:
            json.dump(general_expenses, f, indent=2)
        print("✅ Saved general_expenses_export.json")
        
        with open('advances_export.json', 'w') as f:
            json.dump(advances, f, indent=2)
        print("✅ Saved advances_export.json")
        
        print("\n🎉 Data export completed successfully!")
        print("📁 JSON files created:")
        print("  - employees_export.json")
        print("  - attendance_export.json")
        print("  - travel_expenses_export.json")
        print("  - general_expenses_export.json")
        print("  - advances_export.json")
        
        print("\n📋 Next steps:")
        print("1. Download these JSON files from PythonAnywhere")
        print("2. Place them in your local admin-portal-backend folder")
        print("3. Run: python import_from_json_to_supabase.py")
        
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
