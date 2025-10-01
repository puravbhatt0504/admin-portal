# Data Migration Scripts

This folder contains scripts to migrate data from PythonAnywhere MySQL to Supabase PostgreSQL.

## Files:

### 1. `export_data_corrected.py`
- **Purpose**: Export data from PythonAnywhere MySQL to JSON files
- **Run on**: PythonAnywhere
- **Creates**: 5 JSON files with all your data

### 2. `import_from_json_to_supabase.py`
- **Purpose**: Import JSON data to Supabase PostgreSQL
- **Run on**: Your local machine
- **Requires**: JSON files from export script

## How to Use:

### Step 1: Export from PythonAnywhere
1. Upload `export_data_corrected.py` to PythonAnywhere
2. Run: `python export_data_corrected.py`
3. Download the 5 JSON files created

### Step 2: Import to Supabase
1. Place the JSON files in this migration folder
2. Install dependencies: `pip install psycopg2-binary`
3. Run: `python import_from_json_to_supabase.py`

## JSON Files Created:
- `employees_export.json`
- `attendance_export.json`
- `travel_expenses_export.json`
- `general_expenses_export.json`
- `advances_export.json`

## Notes:
- All passwords are hardcoded in the scripts
- The scripts handle the actual table structures from your database
- Data is safely migrated with conflict resolution
