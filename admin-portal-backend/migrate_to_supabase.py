#!/usr/bin/env python3
"""
Data Migration Script: PythonAnywhere MySQL to Supabase PostgreSQL
This script helps migrate your existing data from PythonAnywhere to Supabase
"""

import os
import sys
import json
from datetime import datetime, date, time
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def create_mysql_connection():
    """Create connection to old MySQL database"""
    try:
        import mysql.connector
        from mysql.connector import Error
        
        # Old PythonAnywhere MySQL connection
        connection = mysql.connector.connect(
            host='finalboss0504.mysql.pythonanywhere-services.com',
            database='finalboss0504$default',
            user='finalboss0504',
            password='puravbhatt0504'
        )
        
        if connection.is_connected():
            print("✅ Connected to old MySQL database")
            return connection
        else:
            print("❌ Failed to connect to MySQL")
            return None
            
    except Error as e:
        print(f"❌ MySQL connection error: {e}")
        return None

def create_supabase_connection():
    """Create connection to new Supabase database"""
    try:
        import psycopg2
        from psycopg2 import sql
        
        # Supabase PostgreSQL connection (hardcoded)
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

def migrate_employees(mysql_conn, supabase_conn):
    """Migrate employees data"""
    try:
        mysql_cursor = mysql_conn.cursor()
        supabase_cursor = supabase_conn.cursor()
        
        # Get employees from MySQL
        mysql_cursor.execute("SELECT id, name FROM employees ORDER BY id")
        employees = mysql_cursor.fetchall()
        
        print(f"📊 Found {len(employees)} employees to migrate")
        
        # Insert into Supabase
        for emp_id, name in employees:
            try:
                supabase_cursor.execute(
                    "INSERT INTO employees (id, name) VALUES (%s, %s) ON CONFLICT (id) DO NOTHING",
                    (emp_id, name)
                )
                print(f"✅ Migrated employee: {name} (ID: {emp_id})")
            except Exception as e:
                print(f"⚠️  Error migrating employee {name}: {e}")
        
        supabase_conn.commit()
        print("✅ Employees migration completed")
        
    except Exception as e:
        print(f"❌ Error migrating employees: {e}")

def migrate_attendance(mysql_conn, supabase_conn):
    """Migrate attendance data"""
    try:
        mysql_cursor = mysql_conn.cursor()
        supabase_cursor = supabase_conn.cursor()
        
        # Get attendance from MySQL
        mysql_cursor.execute("""
            SELECT employee_name, date, shift1_in, shift1_out, shift2_in, shift2_out, status 
            FROM attendance 
            ORDER BY date, employee_name
        """)
        attendance_records = mysql_cursor.fetchall()
        
        print(f"📊 Found {len(attendance_records)} attendance records to migrate")
        
        # Insert into Supabase
        for record in attendance_records:
            try:
                supabase_cursor.execute("""
                    INSERT INTO attendance (employee_name, date, shift1_in, shift1_out, shift2_in, shift2_out, status)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (employee_name, date) DO NOTHING
                """, record)
                print(f"✅ Migrated attendance: {record[0]} on {record[1]}")
            except Exception as e:
                print(f"⚠️  Error migrating attendance {record[0]}: {e}")
        
        supabase_conn.commit()
        print("✅ Attendance migration completed")
        
    except Exception as e:
        print(f"❌ Error migrating attendance: {e}")

def migrate_travel_expenses(mysql_conn, supabase_conn):
    """Migrate travel expenses data"""
    try:
        mysql_cursor = mysql_conn.cursor()
        supabase_cursor = supabase_conn.cursor()
        
        # Get travel expenses from MySQL
        mysql_cursor.execute("""
            SELECT employee_name, date, start_reading, end_reading, amount, description
            FROM travel_expenses 
            ORDER BY date, employee_name
        """)
        travel_records = mysql_cursor.fetchall()
        
        print(f"📊 Found {len(travel_records)} travel expense records to migrate")
        
        # Insert into Supabase
        for record in travel_records:
            try:
                supabase_cursor.execute("""
                    INSERT INTO travel_expenses (employee_name, date, start_reading, end_reading, amount, description)
                    VALUES (%s, %s, %s, %s, %s, %s)
                """, record)
                print(f"✅ Migrated travel expense: {record[0]} on {record[1]}")
            except Exception as e:
                print(f"⚠️  Error migrating travel expense {record[0]}: {e}")
        
        supabase_conn.commit()
        print("✅ Travel expenses migration completed")
        
    except Exception as e:
        print(f"❌ Error migrating travel expenses: {e}")

def migrate_general_expenses(mysql_conn, supabase_conn):
    """Migrate general expenses data"""
    try:
        mysql_cursor = mysql_conn.cursor()
        supabase_cursor = supabase_conn.cursor()
        
        # Get general expenses from MySQL
        mysql_cursor.execute("""
            SELECT employee_name, date, amount, description
            FROM general_expenses 
            ORDER BY date, employee_name
        """)
        general_records = mysql_cursor.fetchall()
        
        print(f"📊 Found {len(general_records)} general expense records to migrate")
        
        # Insert into Supabase
        for record in general_records:
            try:
                supabase_cursor.execute("""
                    INSERT INTO general_expenses (employee_name, date, amount, description)
                    VALUES (%s, %s, %s, %s)
                """, record)
                print(f"✅ Migrated general expense: {record[0]} on {record[1]}")
            except Exception as e:
                print(f"⚠️  Error migrating general expense {record[0]}: {e}")
        
        supabase_conn.commit()
        print("✅ General expenses migration completed")
        
    except Exception as e:
        print(f"❌ Error migrating general expenses: {e}")

def migrate_advances(mysql_conn, supabase_conn):
    """Migrate advances data"""
    try:
        mysql_cursor = mysql_conn.cursor()
        supabase_cursor = supabase_conn.cursor()
        
        # Get advances from MySQL
        mysql_cursor.execute("""
            SELECT employee_name, date, amount, description
            FROM advances 
            ORDER BY date, employee_name
        """)
        advance_records = mysql_cursor.fetchall()
        
        print(f"📊 Found {len(advance_records)} advance records to migrate")
        
        # Insert into Supabase
        for record in advance_records:
            try:
                supabase_cursor.execute("""
                    INSERT INTO advances (employee_name, date, amount, description)
                    VALUES (%s, %s, %s, %s)
                """, record)
                print(f"✅ Migrated advance: {record[0]} on {record[1]}")
            except Exception as e:
                print(f"⚠️  Error migrating advance {record[0]}: {e}")
        
        supabase_conn.commit()
        print("✅ Advances migration completed")
        
    except Exception as e:
        print(f"❌ Error migrating advances: {e}")

def main():
    """Main migration function"""
    print("🚀 Starting data migration from PythonAnywhere MySQL to Supabase PostgreSQL")
    print("=" * 70)
    
    # Create connections
    mysql_conn = create_mysql_connection()
    if not mysql_conn:
        print("❌ Cannot proceed without MySQL connection")
        return
    
    supabase_conn = create_supabase_connection()
    if not supabase_conn:
        print("❌ Cannot proceed without Supabase connection")
        return
    
    try:
        # Migrate data in order (respecting foreign key constraints)
        print("\n📋 Step 1: Migrating employees...")
        migrate_employees(mysql_conn, supabase_conn)
        
        print("\n📋 Step 2: Migrating attendance...")
        migrate_attendance(mysql_conn, supabase_conn)
        
        print("\n📋 Step 3: Migrating travel expenses...")
        migrate_travel_expenses(mysql_conn, supabase_conn)
        
        print("\n📋 Step 4: Migrating general expenses...")
        migrate_general_expenses(mysql_conn, supabase_conn)
        
        print("\n📋 Step 5: Migrating advances...")
        migrate_advances(mysql_conn, supabase_conn)
        
        print("\n🎉 Migration completed successfully!")
        print("=" * 70)
        print("✅ All your data has been migrated to Supabase!")
        print("🔗 You can now use the new Supabase backend")
        
    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
    finally:
        # Close connections
        if mysql_conn:
            mysql_conn.close()
        if supabase_conn:
            supabase_conn.close()

if __name__ == "__main__":
    main()
