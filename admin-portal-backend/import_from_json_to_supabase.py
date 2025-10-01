#!/usr/bin/env python3
"""
Import data from JSON files to Supabase PostgreSQL
This script imports data exported from PythonAnywhere
"""

import json
import psycopg2
from psycopg2 import sql
from datetime import datetime, date, time

def create_supabase_connection():
    """Create connection to Supabase database"""
    try:
        connection = psycopg2.connect(
            host='db.sevlfbqydeludjfzatfe.supabase.co',
            database='postgres',
            user='postgres',
            password='puravbhatt0504',
            port='5432',
            sslmode='require'
        )
        
        if connection:
            print("✅ Connected to Supabase database")
            return connection
        else:
            print("❌ Failed to connect to Supabase")
            return None
            
    except Exception as e:
        print(f"❌ Supabase connection error: {e}")
        return None

def parse_datetime(value):
    """Parse datetime string back to datetime object"""
    if not value:
        return None
    try:
        if 'T' in value:
            return datetime.fromisoformat(value.replace('Z', '+00:00'))
        elif len(value) == 10:  # Date only
            return datetime.strptime(value, '%Y-%m-%d').date()
        elif len(value) == 8:  # Time only
            return datetime.strptime(value, '%H:%M:%S').time()
    except:
        return None
    return None

def import_employees(cursor, data):
    """Import employees data"""
    print(f"📋 Importing {len(data)} employees...")
    
    for record in data:
        try:
            cursor.execute("""
                INSERT INTO employees (id, name) 
                VALUES (%s, %s) 
                ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name
            """, (record['id'], record['name']))
            print(f"✅ Imported employee: {record['name']} (ID: {record['id']})")
        except Exception as e:
            print(f"❌ Error importing employee {record['name']}: {e}")

def import_attendance(cursor, data):
    """Import attendance data"""
    print(f"📋 Importing {len(data)} attendance records...")
    
    for record in data:
        try:
            # Parse datetime fields
            date_val = parse_datetime(record['date'])
            shift1_in = parse_datetime(record['shift1_in'])
            shift1_out = parse_datetime(record['shift1_out'])
            shift2_in = parse_datetime(record['shift2_in'])
            shift2_out = parse_datetime(record['shift2_out'])
            
            cursor.execute("""
                INSERT INTO attendance (id, employee_name, date, shift1_in, shift1_out, shift2_in, shift2_out) 
                VALUES (%s, %s, %s, %s, %s, %s, %s) 
                ON CONFLICT (id) DO UPDATE SET
                    employee_name = EXCLUDED.employee_name,
                    date = EXCLUDED.date,
                    shift1_in = EXCLUDED.shift1_in,
                    shift1_out = EXCLUDED.shift1_out,
                    shift2_in = EXCLUDED.shift2_in,
                    shift2_out = EXCLUDED.shift2_out
            """, (record['id'], record['employee_name'], 
                  date_val, shift1_in, shift1_out, shift2_in, shift2_out))
            print(f"✅ Imported attendance: {record['employee_name']} - {record['date']}")
        except Exception as e:
            print(f"❌ Error importing attendance {record['employee_name']}: {e}")

def import_travel_expenses(cursor, data):
    """Import travel expenses data"""
    print(f"📋 Importing {len(data)} travel expense records...")
    
    for record in data:
        try:
            date_val = parse_datetime(record['date'])
            cursor.execute("""
                INSERT INTO travel_expenses (id, employee_name, date, start_reading, end_reading, distance, rate, amount) 
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s) 
                ON CONFLICT (id) DO UPDATE SET
                    employee_name = EXCLUDED.employee_name,
                    date = EXCLUDED.date,
                    start_reading = EXCLUDED.start_reading,
                    end_reading = EXCLUDED.end_reading,
                    distance = EXCLUDED.distance,
                    rate = EXCLUDED.rate,
                    amount = EXCLUDED.amount
            """, (record['id'], record['employee_name'], 
                  date_val, record['start_reading'], record['end_reading'], 
                  record['distance'], record['rate'], record['amount']))
            print(f"✅ Imported travel expense: {record['employee_name']} - {record['date']}")
        except Exception as e:
            print(f"❌ Error importing travel expense {record['employee_name']}: {e}")

def import_general_expenses(cursor, data):
    """Import general expenses data"""
    print(f"📋 Importing {len(data)} general expense records...")
    
    for record in data:
        try:
            date_val = parse_datetime(record['date'])
            cursor.execute("""
                INSERT INTO general_expenses (id, employee_name, date, description, amount) 
                VALUES (%s, %s, %s, %s, %s) 
                ON CONFLICT (id) DO UPDATE SET
                    employee_name = EXCLUDED.employee_name,
                    date = EXCLUDED.date,
                    description = EXCLUDED.description,
                    amount = EXCLUDED.amount
            """, (record['id'], record['employee_name'], 
                  date_val, record['description'], record['amount']))
            print(f"✅ Imported general expense: {record['employee_name']} - {record['date']}")
        except Exception as e:
            print(f"❌ Error importing general expense {record['employee_name']}: {e}")

def import_advances(cursor, data):
    """Import advances data"""
    print(f"📋 Importing {len(data)} advance records...")
    
    for record in data:
        try:
            date_val = parse_datetime(record['date'])
            cursor.execute("""
                INSERT INTO advances (id, employee_name, date, amount, notes) 
                VALUES (%s, %s, %s, %s, %s) 
                ON CONFLICT (id) DO UPDATE SET
                    employee_name = EXCLUDED.employee_name,
                    date = EXCLUDED.date,
                    amount = EXCLUDED.amount,
                    notes = EXCLUDED.notes
            """, (record['id'], record['employee_name'], 
                  date_val, record['amount'], record['notes']))
            print(f"✅ Imported advance: {record['employee_name']} - {record['date']}")
        except Exception as e:
            print(f"❌ Error importing advance {record['employee_name']}: {e}")

def main():
    print("🚀 Importing data from JSON files to Supabase PostgreSQL")
    print("=" * 60)
    
    # Connect to Supabase
    connection = create_supabase_connection()
    if not connection:
        print("❌ Cannot proceed without Supabase connection")
        return
    
    cursor = connection.cursor()
    
    try:
        # Import employees
        print("\n📋 Step 1: Importing employees...")
        with open('employees_export.json', 'r') as f:
            employees = json.load(f)
        import_employees(cursor, employees)
        
        # Import attendance
        print("\n📋 Step 2: Importing attendance...")
        with open('attendance_export.json', 'r') as f:
            attendance = json.load(f)
        import_attendance(cursor, attendance)
        
        # Import travel expenses
        print("\n📋 Step 3: Importing travel expenses...")
        with open('travel_expenses_export.json', 'r') as f:
            travel_expenses = json.load(f)
        import_travel_expenses(cursor, travel_expenses)
        
        # Import general expenses
        print("\n📋 Step 4: Importing general expenses...")
        with open('general_expenses_export.json', 'r') as f:
            general_expenses = json.load(f)
        import_general_expenses(cursor, general_expenses)
        
        # Import advances
        print("\n📋 Step 5: Importing advances...")
        with open('advances_export.json', 'r') as f:
            advances = json.load(f)
        import_advances(cursor, advances)
        
        # Commit all changes
        connection.commit()
        print("\n🎉 Data import completed successfully!")
        print("✅ All data has been migrated to Supabase!")
        
    except Exception as e:
        print(f"❌ Import error: {e}")
        connection.rollback()
    finally:
        if connection:
            cursor.close()
            connection.close()
            print("✅ Database connection closed")

if __name__ == "__main__":
    main()
