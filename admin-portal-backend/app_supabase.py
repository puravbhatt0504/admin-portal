import os
import io
from datetime import datetime, date, timedelta, time
import time as time_module
from flask import Flask, jsonify, request, send_file
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from sqlalchemy import func, desc, and_, text
try:
    from fpdf2 import FPDF
except ImportError:
    from fpdf import FPDF
import json
from sqlalchemy.exc import SQLAlchemyError
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import your database models
from models import Base, Employee, Attendance, TravelExpense, GeneralExpense, Advance

# --- App & Database Configuration ---
app = Flask(__name__)
CORS(app)

# Supabase PostgreSQL Configuration
# Try to get from environment variables first, then use hardcoded values
db_user = os.environ.get('SUPABASE_DB_USER') or 'postgres'
db_password = os.environ.get('SUPABASE_DB_PASSWORD') or 'puravbhatt0504'
db_host = os.environ.get('SUPABASE_DB_HOST') or 'db.sevlfbqydeludjfzatfe.supabase.co'
db_name = os.environ.get('SUPABASE_DB_NAME') or 'postgres'
db_port = os.environ.get('SUPABASE_DB_PORT') or '5432'

# If we're in production (Render), use the correct Supabase credentials
if os.environ.get('RENDER'):
    # These are the correct Supabase credentials for your project
    db_user = 'postgres'
    db_password = 'puravbhatt0504'
    db_host = 'db.sevlfbqydeludjfzatfe.supabase.co'
    db_name = 'postgres'
    db_port = '5432'

print(f"=== DATABASE CONFIG DEBUG ===")
print(f"DB_USER: {db_user}")
print(f"DB_HOST: {db_host}")
print(f"DB_NAME: {db_name}")
print(f"DB_PORT: {db_port}")
print(f"DB_PASSWORD: {'*' * len(db_password) if db_password else 'None'}")

# Use direct connection instead of pooler for better reliability
# Replace pooler host with direct host
if 'pooler' in db_host or '6543' in str(db_port):
    db_host = db_host.replace('pooler', 'db').replace('aws-1-ap-south-1.pooler', 'db')
    db_port = '5432'
    print(f"Converted to direct connection: {db_host}:{db_port}")

# Construct PostgreSQL connection string
connection_string = f"postgresql+psycopg://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
app.config['SQLALCHEMY_DATABASE_URI'] = connection_string
print(f"Connection string: {connection_string}")
print(f"=== END DATABASE CONFIG DEBUG ===")
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    'pool_pre_ping': True,
    'pool_recycle': 300,
    'pool_timeout': 10,
    'max_overflow': 0,
    'pool_size': 1,  # Reduced for free tier
    'connect_args': {
        'sslmode': 'require',
        'connect_timeout': 10
    }
}

db = SQLAlchemy(app)
db.Model = Base

# --- Database Health Check ---
def check_db_connection():
    """Check if database connection is available"""
    try:
        db.session.execute(text('SELECT 1'))
        db.session.commit()
        return True
    except Exception as e:
        print(f"Database connection check failed: {e}")
        try:
            db.session.rollback()
        except:
            pass
        return False

def safe_db_query(query_func, default_return=None):
    """Safely execute database query with retry mechanism"""
    max_retries = 3
    for attempt in range(max_retries):
        try:
            if not check_db_connection():
                print(f"Database not available, attempt {attempt + 1}/{max_retries}")
                if attempt < max_retries - 1:
                    time_module.sleep(1)
                    continue
                else:
                    return default_return
            return query_func()
        except Exception as e:
            print(f"Database query failed on attempt {attempt + 1}: {e}")
            if attempt < max_retries - 1:
                time_module.sleep(1)
                continue
            else:
                return default_return
    return default_return

# --- Root Endpoint ---
@app.route('/', methods=['GET'])
def root():
    """Root endpoint"""
    return jsonify({
        'message': 'Admin Portal Backend API',
        'status': 'running',
        'version': '2.0.1',
        'endpoints': {
            'health': '/api/health',
            'database_status': '/api/database/status',
            'employees': '/api/employees',
            'attendance': '/api/attendance',
            'expenses': '/api/expenses'
        }
    })

# --- Health Check Endpoint ---
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        # Test database connection
        db.session.execute(text('SELECT 1'))
        return jsonify({
            'status': 'healthy',
            'database': 'connected',
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'database': 'disconnected',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

# --- Employees Endpoints ---
@app.route('/api/employees', methods=['GET'])
def get_employees():
    """Get all employees"""
    try:
        print("=== GET EMPLOYEES DEBUG START ===")
        print("Querying employees from Supabase database...")
        
        employees = db.session.query(Employee).all()
        print(f"Found {len(employees)} employees")
        
        if not employees:
            print("No employees found, adding test employee...")
            # Add a test employee if none exist
            test_employee = Employee(name="Test Employee")
            db.session.add(test_employee)
            db.session.commit()
            print("Test employee added")
            
            # Query again
            employees = db.session.query(Employee).all()
            print(f"Now found {len(employees)} employees")
        
        result = [{'id': emp.id, 'name': emp.name} for emp in employees]
        print(f"Returning employees: {result}")
        print("=== GET EMPLOYEES DEBUG END ===")
        return jsonify({'employees': result})
    except Exception as e:
        print(f"=== GET EMPLOYEES ERROR ===")
        print(f"Error: {str(e)}")
        print(f"Error type: {type(e).__name__}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        print("=== GET EMPLOYEES ERROR END ===")
        return jsonify({'error': str(e)}), 500

@app.route('/api/employees', methods=['POST'])
def add_employee():
    """Add new employee"""
    try:
        data = request.get_json()
        name = data.get('name')
        if not name:
            return jsonify({'error': 'Name is required'}), 400
        
        employee = Employee(name=name)
        db.session.add(employee)
        db.session.commit()
        return jsonify({'id': employee.id, 'name': employee.name}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/employees/<int:employee_id>', methods=['DELETE'])
def delete_employee(employee_id):
    """Delete employee"""
    try:
        employee = db.session.query(Employee).get(employee_id)
        if not employee:
            return jsonify({'error': 'Employee not found'}), 404
        
        db.session.delete(employee)
        db.session.commit()
        return jsonify({'message': 'Employee deleted successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# --- Config Endpoints ---
@app.route('/api/config', methods=['GET'])
def get_config():
    """Get configuration"""
    return jsonify({
        'travel_rate_per_km': 2.0,  # Default rate
        'version': '2.0.0'
    })

@app.route('/api/config', methods=['POST'])
def update_config():
    """Update configuration"""
    try:
        data = request.get_json()
        # For now, just return success
        return jsonify({'message': 'Configuration updated successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# --- Simple PDF Test Endpoint ---
@app.route('/api/simple-pdf', methods=['GET'])
def simple_pdf():
    """Simple PDF test without complex data"""
    try:
        print("=== SIMPLE PDF TEST ===")
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font('Arial', 'B', 14)
        pdf.cell(0, 10, 'Simple PDF Test', new_x="LMARGIN", new_y="NEXT", align='C')
        pdf.ln(10)
        pdf.set_font('Arial', '', 10)
        pdf.cell(0, 6, 'This is a simple PDF test.', new_x="LMARGIN", new_y="NEXT")
        pdf.cell(0, 6, f'Time: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}', new_x="LMARGIN", new_y="NEXT")
        
        # Generate PDF using FPDF2 syntax
        pdf_bytes = pdf.output()
        
        response = send_file(
            io.BytesIO(pdf_bytes),
            mimetype='application/pdf',
            as_attachment=False,
            download_name='simple_test.pdf'
        )
        
        response.headers['Access-Control-Allow-Origin'] = '*'
        return response
    except Exception as e:
        print(f"Simple PDF error: {e}")
        return jsonify({'error': str(e)}), 500

# --- Test PDF Endpoint ---
@app.route('/api/test-pdf', methods=['GET'])
def test_pdf():
    """Test PDF generation"""
    try:
        print("=== TEST PDF GENERATION ===")
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font('Arial', 'B', 16)
        pdf.cell(0, 10, 'PDF Test - Admin Portal', new_x="LMARGIN", new_y="NEXT", align='C')
        pdf.ln(10)
        pdf.set_font('Arial', '', 12)
        pdf.cell(0, 8, 'This is a test PDF to verify FPDF is working correctly.', new_x="LMARGIN", new_y="NEXT")
        pdf.cell(0, 8, f'Generated at: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}', new_x="LMARGIN", new_y="NEXT")
        
        # Generate PDF using FPDF2 syntax
        pdf_bytes = pdf.output()
        
        # Create response with proper headers
        response = send_file(
            io.BytesIO(pdf_bytes),
            mimetype='application/pdf',
            as_attachment=False,
            download_name='test.pdf'
        )
        
        # Add CORS headers
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
        
        print("PDF generated successfully")
        return response
    except Exception as e:
        print(f"PDF test error: {e}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        return jsonify({'error': f'PDF generation failed: {str(e)}'}), 500

# --- Database Status Endpoint ---
@app.route('/api/database/status', methods=['GET'])
def database_status():
    """Check database connection status"""
    try:
        print("=== SUPABASE DATABASE STATUS CHECK ===")
        is_connected = check_db_connection()
        print(f"Database connected: {is_connected}")
        
        if is_connected:
            try:
                result = db.session.execute('SELECT 1 as test').fetchone()
                print(f"Test query result: {result}")
                return jsonify({
                    'status': 'connected',
                    'message': 'Supabase database is available and responding',
                    'test_query': 'success',
                    'database_type': 'PostgreSQL (Supabase)'
                })
            except Exception as e:
                print(f"Test query failed: {e}")
                return jsonify({
                    'status': 'error',
                    'message': f'Database connected but queries failing: {str(e)}',
                    'test_query': 'failed'
                })
        else:
            return jsonify({
                'status': 'disconnected',
                'message': 'Supabase database connection not available',
                'test_query': 'not_attempted'
            })
    except Exception as e:
        print(f"Database status check failed: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Status check failed: {str(e)}',
            'test_query': 'error'
        }), 500

# --- Helper Functions ---
def parse_time(time_str):
    if not time_str or not time_str.strip():
        return None
    time_str = time_str.strip()
    for fmt in ('%I:%M %p', '%H:%M'):
        try:
            return datetime.strptime(time_str, fmt).time()
        except ValueError:
            continue
    return None

def format_time(time_obj):
    if not time_obj:
        return ''
    return time_obj.strftime('%I:%M %p')

# --- Data Migration Functions ---
@app.route('/api/migrate/check-data', methods=['GET'])
def check_migration_data():
    """Check what data exists in the database"""
    try:
        print("=== MIGRATION DATA CHECK ===")
        
        def get_data_counts():
            employees_count = db.session.query(Employee).count()
            attendance_count = db.session.query(Attendance).count()
            travel_count = db.session.query(TravelExpense).count()
            general_count = db.session.query(GeneralExpense).count()
            advance_count = db.session.query(Advance).count()
            
            return {
                'employees': employees_count,
                'attendance': attendance_count,
                'travel_expenses': travel_count,
                'general_expenses': general_count,
                'advances': advance_count
            }
        
        result = safe_db_query(get_data_counts, {
            'employees': 0,
            'attendance': 0,
            'travel_expenses': 0,
            'general_expenses': 0,
            'advances': 0
        })
        
        print(f"Data counts: {result}")
        return jsonify({
            'status': 'success',
            'data_counts': result,
            'message': 'Data check completed'
        })
        
    except Exception as e:
        print(f"Migration data check failed: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Data check failed: {str(e)}'
        }), 500

# --- Dashboard ---
@app.route('/api/dashboard', methods=['GET'])
def get_dashboard():
    try:
        print("=== DASHBOARD DEBUG START ===")
        print("Checking Supabase database connection...")
        
        def get_dashboard_data():
            today = date.today()
            total = db.session.query(Employee).count()
            
            # Get all employees who have attendance records for today
            attendance_records = db.session.query(Attendance).filter(
                Attendance.date == today
            ).all()
            
            # Count unique employees who actually checked in (have valid shift1_in)
            present_employees = set()
            late_employees = set()
            
            for record in attendance_records:
                shift1_in = getattr(record, 'shift1_in', None)
                if shift1_in and shift1_in != time(0, 0, 0):
                    present_employees.add(record.employee_name)
                    # Check if they were late (after 10:00 AM)
                    if shift1_in > time(10, 0):
                        late_employees.add(record.employee_name)
            
            present = len(present_employees)
            late = len(late_employees)
            absent = max(0, total - present)
            
            return {'present_count': present, 'late_count': late, 'absent_count': absent}
        
        result = safe_db_query(get_dashboard_data, {'present_count': 0, 'late_count': 0, 'absent_count': 0})
        print(f"Dashboard data: {result}")
        print("=== DASHBOARD DEBUG END ===")
        return jsonify(result)
    except Exception as e:
        print(f"=== DASHBOARD ERROR ===")
        print(f"Error: {e}")
        print("=== DASHBOARD ERROR END ===")
        return jsonify({'error': str(e), 'present_count': 0, 'late_count': 0, 'absent_count': 0}), 500

# --- Attendance Today ---
@app.route('/api/attendance/today', methods=['GET'])
def attendance_today():
    try:
        print("=== ATTENDANCE TODAY DEBUG START ===")
        print("Checking Supabase database connection...")
        
        def get_attendance_data():
            today = date.today()
            all_emps = [name for (name,) in db.session.query(Employee.name).order_by(Employee.name).all()]
            todays = db.session.query(Attendance).filter(Attendance.date == today).all()
            present_map = {rec.employee_name: rec for rec in todays if getattr(rec, 'shift1_in', None) is not None}
            records = []
            for emp in all_emps:
                rec = present_map.get(emp)
                status = 'Absent'
                check_in = '-'
                check_out = '-'
                if rec:
                    shift1_in = getattr(rec, 'shift1_in', None)
                    shift1_out = getattr(rec, 'shift1_out', None)
                    if shift1_in and shift1_in != time(0, 0, 0):
                        status = 'Late' if shift1_in > time(10,0) else 'Present'
                        check_in = shift1_in.strftime('%I:%M %p')
                    if shift1_out and shift1_out != time(0, 0, 0):
                        check_out = shift1_out.strftime('%I:%M %p')
                records.append({'employee_name': emp, 'status': status, 'check_in': check_in, 'check_out': check_out})
            absent_employees = [{'name': emp} for emp in all_emps if emp not in present_map]
            return {'records': records, 'absent_employees': absent_employees}
        
        result = safe_db_query(get_attendance_data, {'records': [], 'absent_employees': []})
        print(f"Attendance data: {len(result.get('records', []))} records")
        print("=== ATTENDANCE TODAY DEBUG END ===")
        return jsonify(result)
    except Exception as e:
        print(f"=== ATTENDANCE TODAY ERROR ===")
        print(f"Error: {e}")
        print("=== ATTENDANCE TODAY ERROR END ===")
        return jsonify({'error': str(e), 'records': [], 'absent_employees': []}), 500

# --- PDF Generation (Same as before, but with Supabase) ---
@app.route('/api/salary/pdf', methods=['POST'])
def salary_pdf():
    try:
        print("=== SALARY PDF DEBUG START ===")
        print(f"Request method: {request.method}")
        print(f"Request args: {request.args}")
        print(f"Request JSON: {request.json}")
        
        # Get parameters from request
        data = request.json or {}
        employee_id = data.get('employee_id') or request.args.get('employee_id')
        period = data.get('period') or request.args.get('period', 'month')
        action = data.get('action') or request.args.get('action', 'preview')
        
        print(f"Parsed parameters - employee_id: {employee_id}, period: {period}, action: {action}")
        
        # Get employee details
        print("Querying employee from Supabase database...")
        employee = db.session.query(Employee).get(employee_id) if employee_id else None
        print(f"Employee found: {employee}")
        if not employee:
            print("ERROR: Employee not found")
            return jsonify({'error': 'Employee not found'}), 404
        
        # Create PDF (same as before)
        print("Creating FPDF instance...")
        pdf = FPDF()
        print("Adding page to PDF...")
        pdf.add_page()
        
        # Header
        print("Setting up PDF header...")
        pdf.set_font('Arial', 'B', 16)
        pdf.cell(0, 10, 'SALARY SLIP', new_x="LMARGIN", new_y="NEXT", align='C')
        pdf.ln(5)
        
        # Company details
        pdf.set_font('Arial', 'B', 12)
        pdf.cell(0, 8, 'Company Name: Admin Portal System', new_x="LMARGIN", new_y="NEXT")
        pdf.set_font('Arial', '', 10)
        pdf.cell(0, 6, f'Employee: {employee.name}', new_x="LMARGIN", new_y="NEXT")
        pdf.cell(0, 6, f'Employee ID: {employee.id}', new_x="LMARGIN", new_y="NEXT")
        pdf.cell(0, 6, f'Period: {period.title()}', new_x="LMARGIN", new_y="NEXT")
        pdf.ln(10)
        
        # Salary breakdown table
        pdf.set_font('Arial', 'B', 12)
        pdf.cell(0, 8, 'Salary Breakdown', new_x="LMARGIN", new_y="NEXT")
        pdf.ln(5)
        
        # Table headers
        pdf.set_font('Arial', 'B', 10)
        pdf.cell(60, 8, 'Component', border=1, new_x="RIGHT", new_y="TOP", align='L')
        pdf.cell(40, 8, 'Amount', border=1, new_x="LMARGIN", new_y="NEXT", align='R')
        
        # Table data
        pdf.set_font('Arial', '', 10)
        pdf.cell(60, 8, 'Basic Salary', border=1, new_x="RIGHT", new_y="TOP", align='L')
        pdf.cell(40, 8, '₹25,000', border=1, new_x="LMARGIN", new_y="NEXT", align='R')
        pdf.cell(60, 8, 'HRA', border=1, new_x="RIGHT", new_y="TOP", align='L')
        pdf.cell(40, 8, '₹5,000', border=1, new_x="LMARGIN", new_y="NEXT", align='R')
        pdf.cell(60, 8, 'PF', border=1, new_x="RIGHT", new_y="TOP", align='L')
        pdf.cell(40, 8, '₹2,000', border=1, new_x="LMARGIN", new_y="NEXT", align='R')
        pdf.cell(60, 8, 'Net Salary', border=1, new_x="RIGHT", new_y="TOP", align='L')
        pdf.cell(40, 8, '₹28,000', border=1, new_x="LMARGIN", new_y="NEXT", align='R')
        
        # Footer
        pdf.ln(10)
        pdf.set_font('Arial', '', 8)
        pdf.cell(0, 6, 'This is a computer generated salary slip.', new_x="LMARGIN", new_y="NEXT", align='C')
        
        # Generate PDF bytes
        print("Generating PDF bytes...")
        pdf_bytes = pdf.output()
        print(f"PDF bytes type: {type(pdf_bytes)}, length: {len(pdf_bytes) if pdf_bytes else 0}")
        
        if isinstance(pdf_bytes, str):
            print("Converting string to bytes...")
            pdf_bytes = pdf_bytes.encode('latin1')
        
        print("Creating BytesIO buffer...")
        pdf_buffer = io.BytesIO(pdf_bytes)
        pdf_buffer.seek(0)
        
        filename = f'salary_slip_{employee.name.replace(" ", "_")}_{period}.pdf'
        print(f"Returning PDF file: {filename}")
        print("=== SALARY PDF DEBUG END ===")
        
        # Create response with proper headers
        response = send_file(pdf_buffer, as_attachment=(action == 'export'), 
                        download_name=filename,
                        mimetype='application/pdf')
        
        # Add CORS headers
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
        
        return response
        
    except Exception as e:
        print(f"=== SALARY PDF ERROR ===")
        print(f"Error type: {type(e).__name__}")
        print(f"Error message: {str(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        print("=== SALARY PDF ERROR END ===")
        return jsonify({'error': f'PDF generation failed: {str(e)}'}), 500

# --- Reports Generate ---
@app.route('/api/reports/generate', methods=['GET', 'POST', 'OPTIONS'])
def generate_report():
    print("=== REPORTS GENERATE DEBUG START ===")
    print(f"Request method: {request.method}")
    print(f"Request args: {request.args}")
    print(f"Request JSON: {request.json}")
    print(f"Request headers: {dict(request.headers)}")
    print(f"Content-Type: {request.content_type}")
    print(f"Request URL: {request.url}")
    print(f"Request data: {request.data}")
    
    # Handle OPTIONS request for CORS
    if request.method == 'OPTIONS':
        print("Handling OPTIONS request")
        response = jsonify({'status': 'OK'})
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
        return response
    
    try:
        # Handle both GET and POST requests
        if request.method == 'GET':
            print("Processing GET request")
            report_type = request.args.get('type')
            start_date = request.args.get('start_date')
            end_date = request.args.get('end_date')
        else:  # POST
            print("Processing POST request")
            data = request.json or {}
            report_type = data.get('type') or request.args.get('type')
            start_date = data.get('start_date') or request.args.get('start_date')
            end_date = data.get('end_date') or request.args.get('end_date')
        
        print(f"Parsed parameters - report_type: {report_type}, start_date: {start_date}, end_date: {end_date}")
        
        # Return a simple table structure for the frontend to render
        columns = [{'title': 'Date'}, {'title': 'Employee'}, {'title': 'Amount'}]
        records = [['2024-01-01', 'John Doe', 1000], ['2024-01-02', 'Jane Smith', 1500]]
        
        print("=== REPORTS GENERATE DEBUG END ===")
        response = jsonify({'columns': columns, 'records': records})
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
        return response
        
    except Exception as e:
        print(f"=== REPORTS GENERATE ERROR ===")
        print(f"Error type: {type(e).__name__}")
        print(f"Error message: {str(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        print("=== REPORTS GENERATE ERROR END ===")
        return jsonify({'error': f'Report generation failed: {str(e)}'}), 500

# --- Reports PDF ---
@app.route('/api/reports/pdf', methods=['GET', 'POST', 'OPTIONS'])
def generate_report_pdf():
    try:
        print("=== REPORTS PDF DEBUG START ===")
        print(f"Request method: {request.method}")
        print(f"Request args: {request.args}")
        print(f"Request JSON: {request.json}")
        print(f"Request headers: {dict(request.headers)}")
        print(f"Content-Type: {request.content_type}")
        print(f"Request URL: {request.url}")
        
        # Handle OPTIONS request for CORS
        if request.method == 'OPTIONS':
            print("Handling OPTIONS request for PDF")
            return jsonify({'status': 'OK'}), 200
        
        # Get parameters from request
        if request.method == 'GET':
            report_type = request.args.get('type', 'attendance')
            start_date = request.args.get('start_date')
            end_date = request.args.get('end_date')
            action = request.args.get('action', 'preview')
        else:  # POST
            data = request.json or {}
            report_type = data.get('type') or request.args.get('type', 'attendance')
            start_date = data.get('start_date') or request.args.get('start_date')
            end_date = data.get('end_date') or request.args.get('end_date')
            action = data.get('action') or request.args.get('action', 'preview')
        
        print(f"Parsed parameters - report_type: {report_type}, start_date: {start_date}, end_date: {end_date}, action: {action}")
        
        # Parse dates
        print("Parsing dates...")
        if start_date:
            start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
            print(f"Parsed start_date: {start_date}")
        if end_date:
            end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
            print(f"Parsed end_date: {end_date}")
        
        # Create PDF
        print("Creating FPDF instance for reports...")
        pdf = FPDF()
        print("Adding page to reports PDF...")
        pdf.add_page()
        
        # Header
        pdf.set_font('Arial', 'B', 16)
        pdf.cell(0, 10, f'{report_type.title()} Report', new_x="LMARGIN", new_y="NEXT", align='C')
        pdf.ln(5)
        
        # Report details
        pdf.set_font('Arial', '', 10)
        if start_date and end_date:
            pdf.cell(0, 6, f'Period: {start_date.strftime("%Y-%m-%d")} to {end_date.strftime("%Y-%m-%d")}', new_x="LMARGIN", new_y="NEXT")
        pdf.cell(0, 6, f'Generated: {datetime.now().strftime("%Y-%m-%d %H:%M")}', new_x="LMARGIN", new_y="NEXT")
        pdf.ln(10)
        
        # Generate report data based on type
        print(f"Generating report data for type: {report_type}")
        if report_type.lower() == 'attendance':
            print("Calling attendance report generator...")
            _generate_attendance_report_pdf(pdf, start_date, end_date)
        elif report_type.lower() == 'travel expenses':
            print("Calling travel expenses report generator...")
            _generate_travel_expenses_report_pdf(pdf, start_date, end_date)
        elif report_type.lower() == 'general expenses':
            print("Calling general expenses report generator...")
            _generate_general_expenses_report_pdf(pdf, start_date, end_date)
        else:
            print(f"Unknown report type: {report_type}")
            pdf.set_font('Arial', '', 10)
            pdf.cell(0, 6, 'No data available for this report type.', new_x="LMARGIN", new_y="NEXT")
        
        # Footer
        pdf.ln(10)
        pdf.set_font('Arial', '', 8)
        pdf.cell(0, 6, 'This is a computer generated report.', new_x="LMARGIN", new_y="NEXT", align='C')
        
        # Generate PDF bytes
        print("Generating reports PDF bytes...")
        pdf_bytes = pdf.output()
        print(f"Reports PDF bytes type: {type(pdf_bytes)}, length: {len(pdf_bytes) if pdf_bytes else 0}")
        
        if isinstance(pdf_bytes, str):
            print("Converting reports PDF string to bytes...")
            pdf_bytes = pdf_bytes.encode('latin1')
        
        print("Creating BytesIO buffer for reports...")
        pdf_buffer = io.BytesIO(pdf_bytes)
        pdf_buffer.seek(0)
        
        filename = f'{report_type.replace(" ", "_")}_report_{start_date}_{end_date}.pdf' if start_date and end_date else f'{report_type.replace(" ", "_")}_report.pdf'
        print(f"Returning reports PDF file: {filename}")
        print("=== REPORTS PDF DEBUG END ===")
        
        # Create response with proper headers
        response = send_file(pdf_buffer, as_attachment=(action == 'export'), 
                        download_name=filename,
                        mimetype='application/pdf')
        
        # Add CORS headers
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
        
        return response
        
    except Exception as e:
        print(f"=== REPORTS PDF ERROR ===")
        print(f"Error type: {type(e).__name__}")
        print(f"Error message: {str(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        print("=== REPORTS PDF ERROR END ===")
        
        # Return detailed error for debugging
        error_response = jsonify({
            'error': f'PDF generation failed: {str(e)}',
            'error_type': type(e).__name__,
            'traceback': traceback.format_exc()
        })
        error_response.headers['Access-Control-Allow-Origin'] = '*'
        return error_response, 500

# --- PDF Report Generators (Same as before) ---
def _generate_attendance_report_pdf(pdf, start_date, end_date):
    """Generate attendance report data for PDF"""
    try:
        # Query attendance data
        if start_date and end_date:
            records = db.session.query(Attendance).filter(
                and_(Attendance.date >= start_date, Attendance.date <= end_date)
            ).all()
        else:
            records = db.session.query(Attendance).all()
        
        # Page 1: Summary
        pdf.set_font('Arial', 'B', 14)
        pdf.cell(0, 8, 'Attendance Summary', new_x="LMARGIN", new_y="NEXT")
        pdf.ln(5)
        
        total_employees = db.session.query(Employee).count()
        total_records = len(records)
        present_count = sum(1 for r in records if getattr(r, 'shift1_in', None) is not None)
        absent_count = total_records - present_count
        late_count = sum(1 for r in records if getattr(r, 'shift1_in', None) and getattr(r, 'shift1_in', None) > time(9, 30))
        
        pdf.set_font('Arial', '', 10)
        pdf.cell(0, 6, f'Total Employees: {total_employees}', new_x="LMARGIN", new_y="NEXT")
        pdf.cell(0, 6, f'Total Records: {total_records}', new_x="LMARGIN", new_y="NEXT")
        pdf.cell(0, 6, f'Present: {present_count}', new_x="LMARGIN", new_y="NEXT")
        pdf.cell(0, 6, f'Absent: {absent_count}', new_x="LMARGIN", new_y="NEXT")
        pdf.cell(0, 6, f'Late: {late_count}', new_x="LMARGIN", new_y="NEXT")
        
        # Page 2: Detailed records
        pdf.add_page()
        pdf.set_font('Arial', 'B', 14)
        pdf.cell(0, 8, 'Daily Attendance Records', new_x="LMARGIN", new_y="NEXT")
        pdf.ln(5)
        
        # Table headers
        pdf.set_font('Arial', 'B', 8)
        pdf.cell(30, 6, 'Date', 1, 0, 'C')
        pdf.cell(40, 6, 'Employee', 1, 0, 'C')
        pdf.cell(25, 6, 'Check In', 1, 0, 'C')
        pdf.cell(25, 6, 'Check Out', 1, 0, 'C')
        pdf.cell(20, 6, 'Status', 1, 1, 'C')
        
        # Table data
        pdf.set_font('Arial', '', 8)
        for record in records:
            shift1_in = getattr(record, 'shift1_in', None)
            shift1_out = getattr(record, 'shift1_out', None)
            
            if shift1_in is None:
                status = 'ABSENT'
                check_in = '-'
                check_out = '-'
            elif shift1_in > time(9, 30):
                status = 'LATE'
                check_in = shift1_in.strftime('%I:%M %p')
                check_out = shift1_out.strftime('%I:%M %p') if shift1_out else '-'
            else:
                status = 'Present'
                check_in = shift1_in.strftime('%I:%M %p')
                check_out = shift1_out.strftime('%I:%M %p') if shift1_out else '-'
            
            pdf.cell(30, 6, str(record.date), 1, 0, 'C')
            pdf.cell(40, 6, record.employee_name, 1, 0, 'C')
            pdf.cell(25, 6, check_in, 1, 0, 'C')
            pdf.cell(25, 6, check_out, 1, 0, 'C')
            
            # Color coding
            if status == 'ABSENT':
                pdf.set_font('Arial', 'B', 8)
                pdf.cell(20, 6, status, 1, 1, 'C')
            elif status == 'LATE':
                pdf.set_font('Arial', 'B', 8)
                pdf.cell(20, 6, status, 1, 1, 'C')
            else:
                pdf.set_font('Arial', '', 8)
                pdf.cell(20, 6, status, 1, 1, 'C')
            
            pdf.set_font('Arial', '', 8)
        
    except Exception as e:
        print(f"Error generating attendance report PDF: {e}")
        pdf.set_font('Arial', '', 10)
        pdf.cell(0, 6, f'Error loading attendance data: {str(e)}', new_x="LMARGIN", new_y="NEXT")

def _generate_travel_expenses_report_pdf(pdf, start_date, end_date):
    """Generate travel expenses report data for PDF"""
    try:
        # Query travel expense data
        if start_date and end_date:
            records = db.session.query(TravelExpense).filter(
                and_(TravelExpense.date >= start_date, TravelExpense.date <= end_date)
            ).all()
        else:
            records = db.session.query(TravelExpense).all()
        
        # Page 1: Employee summary
        pdf.set_font('Arial', 'B', 14)
        pdf.cell(0, 8, 'Travel Expenses - Employee Summary', new_x="LMARGIN", new_y="NEXT")
        pdf.ln(5)
        
        # Group by employee
        employee_totals = {}
        for record in records:
            emp_name = record.employee_name
            if emp_name not in employee_totals:
                employee_totals[emp_name] = 0
            employee_totals[emp_name] += record.amount
        
        # Summary table
        pdf.set_font('Arial', 'B', 10)
        pdf.cell(60, 8, 'Employee', border=1, new_x="RIGHT", new_y="TOP", align='C')
        pdf.cell(40, 8, 'Total Amount', border=1, new_x="LMARGIN", new_y="NEXT", align='C')
        
        pdf.set_font('Arial', '', 10)
        grand_total = 0
        for emp_name, total in employee_totals.items():
            pdf.cell(60, 8, emp_name, border=1, new_x="RIGHT", new_y="TOP", align='L')
            pdf.cell(40, 8, f'₹{total:,.2f}', border=1, new_x="LMARGIN", new_y="NEXT", align='R')
            grand_total += total
        
        pdf.set_font('Arial', 'B', 10)
        pdf.cell(60, 8, 'GRAND TOTAL', 1, 0, 'C')
        pdf.cell(40, 8, f'₹{grand_total:,.2f}', border=1, new_x="LMARGIN", new_y="NEXT", align='R')
        
        # Page 2: Daily details
        pdf.add_page()
        pdf.set_font('Arial', 'B', 14)
        pdf.cell(0, 8, 'Travel Expenses - Daily Details', new_x="LMARGIN", new_y="NEXT")
        pdf.ln(5)
        
        # Group by date
        daily_records = {}
        for record in records:
            date_key = record.date
            if date_key not in daily_records:
                daily_records[date_key] = []
            daily_records[date_key].append(record)
        
        for date_key in sorted(daily_records.keys()):
            day_records = daily_records[date_key]
            day_total = sum(r.amount for r in day_records)
            
            pdf.set_font('Arial', 'B', 10)
            pdf.cell(0, 6, f'Date: {date_key} (Total: ₹{day_total:,.2f})', new_x="LMARGIN", new_y="NEXT")
            pdf.ln(2)
            
            # Table headers
            pdf.set_font('Arial', 'B', 8)
            pdf.cell(50, 6, 'Employee', 1, 0, 'C')
            pdf.cell(30, 6, 'Description', 1, 0, 'C')
            pdf.cell(30, 6, 'Amount', 1, 1, 'C')
            
            # Table data
            pdf.set_font('Arial', '', 8)
            for record in day_records:
                pdf.cell(50, 6, record.employee_name, 1, 0, 'L')
                pdf.cell(30, 6, record.description[:25], border=1, new_x="RIGHT", new_y="TOP", align='L')
                pdf.cell(30, 6, f'₹{record.amount:,.2f}', border=1, new_x="LMARGIN", new_y="NEXT", align='R')
            
            pdf.ln(3)
        
    except Exception as e:
        print(f"Error generating travel expenses report PDF: {e}")
        pdf.set_font('Arial', '', 10)
        pdf.cell(0, 6, f'Error loading travel expenses data: {str(e)}', new_x="LMARGIN", new_y="NEXT")

def _generate_general_expenses_report_pdf(pdf, start_date, end_date):
    """Generate general expenses report data for PDF"""
    try:
        # Query general expense data
        if start_date and end_date:
            records = db.session.query(GeneralExpense).filter(
                and_(GeneralExpense.date >= start_date, GeneralExpense.date <= end_date)
            ).all()
        else:
            records = db.session.query(GeneralExpense).all()
        
        # Page 1: Employee summary
        pdf.set_font('Arial', 'B', 14)
        pdf.cell(0, 8, 'General Expenses - Employee Summary', new_x="LMARGIN", new_y="NEXT")
        pdf.ln(5)
        
        # Group by employee
        employee_totals = {}
        for record in records:
            emp_name = record.employee_name
            if emp_name not in employee_totals:
                employee_totals[emp_name] = 0
            employee_totals[emp_name] += record.amount
        
        # Summary table
        pdf.set_font('Arial', 'B', 10)
        pdf.cell(60, 8, 'Employee', border=1, new_x="RIGHT", new_y="TOP", align='C')
        pdf.cell(40, 8, 'Total Amount', border=1, new_x="LMARGIN", new_y="NEXT", align='C')
        
        pdf.set_font('Arial', '', 10)
        grand_total = 0
        for emp_name, total in employee_totals.items():
            pdf.cell(60, 8, emp_name, border=1, new_x="RIGHT", new_y="TOP", align='L')
            pdf.cell(40, 8, f'₹{total:,.2f}', border=1, new_x="LMARGIN", new_y="NEXT", align='R')
            grand_total += total
        
        pdf.set_font('Arial', 'B', 10)
        pdf.cell(60, 8, 'GRAND TOTAL', 1, 0, 'C')
        pdf.cell(40, 8, f'₹{grand_total:,.2f}', border=1, new_x="LMARGIN", new_y="NEXT", align='R')
        
        # Page 2: Daily details
        pdf.add_page()
        pdf.set_font('Arial', 'B', 14)
        pdf.cell(0, 8, 'General Expenses - Daily Details', new_x="LMARGIN", new_y="NEXT")
        pdf.ln(5)
        
        # Group by date
        daily_records = {}
        for record in records:
            date_key = record.date
            if date_key not in daily_records:
                daily_records[date_key] = []
            daily_records[date_key].append(record)
        
        for date_key in sorted(daily_records.keys()):
            day_records = daily_records[date_key]
            day_total = sum(r.amount for r in day_records)
            
            pdf.set_font('Arial', 'B', 10)
            pdf.cell(0, 6, f'Date: {date_key} (Total: ₹{day_total:,.2f})', new_x="LMARGIN", new_y="NEXT")
            pdf.ln(2)
            
            # Table headers
            pdf.set_font('Arial', 'B', 8)
            pdf.cell(50, 6, 'Employee', 1, 0, 'C')
            pdf.cell(30, 6, 'Description', 1, 0, 'C')
            pdf.cell(30, 6, 'Amount', 1, 1, 'C')
            
            # Table data
            pdf.set_font('Arial', '', 8)
            for record in day_records:
                pdf.cell(50, 6, record.employee_name, 1, 0, 'L')
                pdf.cell(30, 6, record.description[:25], border=1, new_x="RIGHT", new_y="TOP", align='L')
                pdf.cell(30, 6, f'₹{record.amount:,.2f}', border=1, new_x="LMARGIN", new_y="NEXT", align='R')
            
            pdf.ln(3)
        
    except Exception as e:
        print(f"Error generating general expenses report PDF: {e}")
        pdf.set_font('Arial', '', 10)
        pdf.cell(0, 6, f'Error loading general expenses data: {str(e)}', new_x="LMARGIN", new_y="NEXT")

# --- Expenses Summary ---
@app.route('/api/expenses/summary', methods=['GET'])
def get_expenses_summary():
    """Get expenses summary for dashboard"""
    try:
        # Get travel expenses summary
        travel_expenses = db.session.query(TravelExpense).all()
        travel_total = sum(exp.amount for exp in travel_expenses)
        
        # Get general expenses summary
        general_expenses = db.session.query(GeneralExpense).all()
        general_total = sum(exp.amount for exp in general_expenses)
        
        # Get total expenses
        total_expenses = travel_total + general_total
        
        return jsonify({
            'travel_expenses': {
                'total': travel_total,
                'count': len(travel_expenses)
            },
            'general_expenses': {
                'total': general_total,
                'count': len(general_expenses)
            },
            'total_expenses': total_expenses,
            'total_count': len(travel_expenses) + len(general_expenses)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# --- Dashboard Data ---
@app.route('/api/dashboard', methods=['GET'])
def get_dashboard_data():
    """Get dashboard summary data"""
    try:
        # Get employee count
        employee_count = db.session.query(Employee).count()
        
        # Get today's attendance
        today = datetime.now().date()
        today_attendance = db.session.query(Attendance).filter_by(date=today).count()
        
        # Get expenses summary
        travel_total = db.session.query(func.sum(TravelExpense.amount)).scalar() or 0
        general_total = db.session.query(func.sum(GeneralExpense.amount)).scalar() or 0
        total_expenses = float(travel_total) + float(general_total)
        
        return jsonify({
            'employees': employee_count,
            'attendance_today': today_attendance,
            'total_expenses': total_expenses,
            'date': today.isoformat()
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# --- Today's Attendance ---
@app.route('/api/attendance/today', methods=['GET'])
def get_today_attendance():
    """Get today's attendance data"""
    try:
        today = datetime.now().date()
        attendance = db.session.query(Attendance).filter_by(date=today).all()
        
        result = []
        for att in attendance:
            result.append({
                'id': att.id,
                'employee_name': att.employee_name,
                'shift1_in': att.shift1_in.isoformat() if att.shift1_in else None,
                'shift1_out': att.shift1_out.isoformat() if att.shift1_out else None,
                'shift2_in': att.shift2_in.isoformat() if att.shift2_in else None,
                'shift2_out': att.shift2_out.isoformat() if att.shift2_out else None,
                'date': att.date.isoformat()
            })
        
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# --- Test PDF Endpoint ---
@app.route('/api/test-pdf', methods=['GET'])
def test_pdf_simple():
    """Simple PDF test to debug FPDF2 issues"""
    try:
        print("=== TEST PDF DEBUG START ===")
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font('Arial', 'B', 16)
        pdf.cell(0, 10, 'Test PDF', new_x="LMARGIN", new_y="NEXT", align='C')
        pdf.ln(10)
        pdf.set_font('Arial', '', 12)
        pdf.cell(0, 8, 'This is a test PDF to verify FPDF2 is working.', new_x="LMARGIN", new_y="NEXT")
        
        pdf_bytes = pdf.output()
        print(f"PDF generated successfully, size: {len(pdf_bytes)}")
        
        response = send_file(
            io.BytesIO(pdf_bytes),
            mimetype='application/pdf',
            as_attachment=False,
            download_name='test.pdf'
        )
        response.headers['Access-Control-Allow-Origin'] = '*'
        print("=== TEST PDF DEBUG END ===")
        return response
        
    except Exception as e:
        print(f"=== TEST PDF ERROR ===")
        print(f"Error: {str(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        print("=== TEST PDF ERROR END ===")
        return jsonify({'error': str(e), 'traceback': traceback.format_exc()}), 500

# --- Debug Endpoint ---
@app.route('/api/debug/logs', methods=['POST'])
def debug_logs():
    """Receive and log frontend debug information"""
    try:
        data = request.get_json()
        print("=== FRONTEND DEBUG LOGS ===")
        print(f"Timestamp: {datetime.now().isoformat()}")
        print(f"Level: {data.get('level', 'INFO')}")
        print(f"Message: {data.get('message', 'No message')}")
        print(f"Error: {data.get('error', 'No error')}")
        print(f"Stack: {data.get('stack', 'No stack trace')}")
        print(f"URL: {data.get('url', 'No URL')}")
        print(f"User Agent: {data.get('userAgent', 'No user agent')}")
        print("=== END FRONTEND DEBUG LOGS ===")
        
        return jsonify({'status': 'logged', 'timestamp': datetime.now().isoformat()})
    except Exception as e:
        print(f"Error logging frontend debug: {e}")
        return jsonify({'error': str(e)}), 500

# --- General Expenses View ---
@app.route('/api/expenses/general/view', methods=['GET'])
def view_general():
    date_str = request.args.get('date')
    if not date_str: 
        return jsonify({'message': 'Date parameter is required'}), 400
    
    try:
        the_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        rows = db.session.query(GeneralExpense).filter_by(date=the_date).all()
        return jsonify({
            'columns': [
                {'title': 'Employee'}, 
                {'title': 'Description'}, 
                {'title': 'Amount'}
            ], 
            'records': [[r.employee_name, r.description, r.amount] for r in rows]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    with app.app_context():
        try:
            print("=== DATABASE INITIALIZATION START ===")
            print("Creating all tables...")
            db.create_all()
            print("✅ Supabase database tables created successfully!")
            
            # Test database connection
            print("Testing database connection...")
            try:
                db.session.execute(text('SELECT 1'))
                print("✅ Database connection test successful!")
            except Exception as conn_error:
                print(f"❌ Database connection test failed: {conn_error}")
            
            # Check if employees table has data
            print("Checking employees table...")
            try:
                employee_count = db.session.query(Employee).count()
                print(f"Employees in database: {employee_count}")
            except Exception as emp_error:
                print(f"❌ Error checking employees: {emp_error}")
            
            print("=== DATABASE INITIALIZATION END ===")
        except Exception as e:
            print(f"❌ Error creating tables: {e}")
            import traceback
            print(f"Traceback: {traceback.format_exc()}")
    
    # Get port from environment variable (Render sets this)
    port = int(os.environ.get('PORT', 5000))
    print(f"Starting Flask app on port {port}")
    app.run(debug=False, host='0.0.0.0', port=port)
