#!/usr/bin/env python3
"""
Setup Supabase database tables
This script creates all the necessary tables in Supabase
"""

import psycopg2
from psycopg2 import sql

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
            print("Connected to Supabase database")
            return connection
        else:
            print("Failed to connect to Supabase")
            return None
            
    except Exception as e:
        print(f"Supabase connection error: {e}")
        return None

def create_tables(cursor):
    """Create all necessary tables"""
    
    # Create employees table
    print("Creating employees table...")
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS employees (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL
        )
    """)
    
    # Create attendance table
    print("Creating attendance table...")
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS attendance (
            id SERIAL PRIMARY KEY,
            employee_name VARCHAR(255) NOT NULL,
            date DATE NOT NULL,
            shift1_in TIME,
            shift1_out TIME,
            shift2_in TIME,
            shift2_out TIME
        )
    """)
    
    # Create travel_expenses table
    print("Creating travel_expenses table...")
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS travel_expenses (
            id SERIAL PRIMARY KEY,
            employee_name VARCHAR(255) NOT NULL,
            date DATE NOT NULL,
            start_reading FLOAT,
            end_reading FLOAT,
            distance FLOAT,
            rate FLOAT,
            amount FLOAT NOT NULL
        )
    """)
    
    # Create general_expenses table
    print("Creating general_expenses table...")
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS general_expenses (
            id SERIAL PRIMARY KEY,
            employee_name VARCHAR(255) NOT NULL,
            date DATE NOT NULL,
            description TEXT,
            amount FLOAT NOT NULL
        )
    """)
    
    # Create advances table
    print("Creating advances table...")
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS advances (
            id SERIAL PRIMARY KEY,
            employee_name VARCHAR(255) NOT NULL,
            date DATE NOT NULL,
            amount FLOAT NOT NULL,
            notes TEXT
        )
    """)
    
    print("All tables created successfully!")

def main():
    print("Setting up Supabase database tables")
    print("=" * 50)
    
    # Connect to Supabase
    connection = create_supabase_connection()
    if not connection:
        print("Cannot proceed without Supabase connection")
        return
    
    cursor = connection.cursor()
    
    try:
        # Create all tables
        create_tables(cursor)
        
        # Commit changes
        connection.commit()
        print("\nDatabase setup completed successfully!")
        print("All tables are ready for data import!")
        
    except Exception as e:
        print(f"Setup error: {e}")
        connection.rollback()
    finally:
        if connection:
            cursor.close()
            connection.close()
            print("Database connection closed")

if __name__ == "__main__":
    main()
