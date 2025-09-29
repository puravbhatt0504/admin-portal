import pandas as pd
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base, Employee, Attendance, TravelExpense, GeneralExpense, Advance
import warnings

warnings.filterwarnings("ignore", category=UserWarning, module="openpyxl")

# --- ⬇️ IMPORTANT: PASTE YOUR DATABASE PASSWORD HERE ⬇️ ---
db_user = "finalboss0504"
db_password = "puravbhatt0504" # The password from the "Databases" tab
db_host = "finalboss0504.mysql.pythonanywhere-services.com"
db_name = "finalboss0504$default"

# This path is correct if you upload the file directly to your main folder on PythonAnywhere.
EXCEL_FILE_PATH = "/home/finalboss0504/Company_Data.xlsx"
# --- ⬆️ NO MORE EDITS NEEDED BELOW THIS LINE ⬆️ ---

DATABASE_URL = f"mysql+mysqlconnector://{db_user}:{db_password}@{db_host}/{db_name}"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

# --- Data Cleaning Function ---
def standardize_name(name):
    """Standardizes known name inconsistencies."""
    # This map now ONLY merges "Narendar lal" into "Narender Lal".
    # "MR.UMESH" is left as-is, to be treated as a separate person from "Umesh".
    name_map = {
        "Narendar lal": "Narender Lal"
    }
    # Ensure name is a string before processing
    return name_map.get(str(name), str(name))

def bulk_insert_with_progress(df, model, mapping_func):
    """Helper function to process and bulk insert data with progress dots."""
    objects = []
    total_rows = len(df)
    print(f"  Preparing {total_rows} records...", end='', flush=True)
    for i, row in df.iterrows():
        objects.append(mapping_func(row))
        if (i + 1) % 50 == 0:
            print('.', end='', flush=True)
    
    print("\n  Inserting records into the database...", end='', flush=True)
    db.bulk_add_objects(objects)
    db.commit()
    print(" Done.")
    print(f"-> Migrated {total_rows} records.")

try:
    print("Connecting to PythonAnywhere database...")
    
    print("Dropping existing tables to start fresh...")
    Base.metadata.drop_all(bind=engine)
    
    print("Creating new tables based on models.py...")
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully.")
    
    xls = pd.ExcelFile(EXCEL_FILE_PATH)
    
    # Migrate Employees
    print("\nMigrating Employees...")
    df_employees = pd.read_excel(xls, 'Employees')
    # FIX: Apply standardization and then remove the resulting duplicates
    df_employees['Employee'] = df_employees['Employee'].apply(standardize_name)
    df_employees.drop_duplicates(subset=['Employee'], inplace=True)
    bulk_insert_with_progress(df_employees, Employee, lambda row: Employee(name=row['Employee']))

    # Migrate Attendance
    print("\nMigrating Attendance...")
    df_attendance = pd.read_excel(xls, 'Attendance')
    df_attendance['Employee'] = df_attendance['Employee'].apply(standardize_name)
    df_attendance['Date'] = pd.to_datetime(df_attendance['Date']).dt.date
    for col in ['Shift1 In', 'Shift1 Out', 'Shift2 In', 'Shift2 Out']:
         df_attendance[col] = pd.to_datetime(df_attendance[col], errors='coerce').dt.time
    bulk_insert_with_progress(df_attendance, Attendance, lambda row: Attendance(
        employee_name=row['Employee'], date=row['Date'], 
        shift1_in=row['Shift1 In'], shift1_out=row['Shift1 Out'], 
        shift2_in=row['Shift2 In'], shift2_out=row['Shift2 Out']
    ))

    # Migrate Travel Expenses
    print("\nMigrating Travel Expenses...")
    df_travel = pd.read_excel(xls, 'Travel_Expenses')
    df_travel['Employee'] = df_travel['Employee'].apply(standardize_name)
    df_travel['Date'] = pd.to_datetime(df_travel['Date']).dt.date
    bulk_insert_with_progress(df_travel, TravelExpense, lambda row: TravelExpense(
        employee_name=row['Employee'], date=row['Date'], 
        start_reading=row.get('Start Reading'), end_reading=row.get('End Reading'), 
        distance=row.get('Distance'), rate=row.get('Rate'), amount=row.get('Amount')
    ))

    # Migrate General Expenses
    print("\nMigrating General Expenses...")
    df_general = pd.read_excel(xls, 'General_Expenses')
    df_general['Employee'] = df_general['Employee'].apply(standardize_name)
    df_general['Date'] = pd.to_datetime(df_general['Date']).dt.date
    bulk_insert_with_progress(df_general, GeneralExpense, lambda row: GeneralExpense(
        employee_name=row['Employee'], date=row['Date'], 
        description=row.get('Description'), amount=row.get('Amount')
    ))

    # Migrate Advances
    print("\nMigrating Advances...")
    df_advances = pd.read_excel(xls, 'Advances')
    if not df_advances.empty:
        df_advances['Employee'] = df_advances['Employee'].apply(standardize_name)
        df_advances['Date'] = pd.to_datetime(df_advances['Date']).dt.date
        bulk_insert_with_progress(df_advances, Advance, lambda row: Advance(
            employee_name=row['Employee'], date=row['Date'], 
            amount=row['Amount'], notes=row.get('Notes')
        ))
    else:
        print("-> No advance records to migrate.")

    print("\n[SUCCESS] Data migration completed successfully!")

except Exception as e:
    print(f"\n[ERROR] An error occurred: {e}")
    db.rollback()
finally:
    db.close()
    print("\nDatabase connection closed.")

