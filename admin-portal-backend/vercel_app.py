import os
import sys
import io
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
from datetime import datetime, timedelta

# Load environment variables
load_dotenv()

# --- App & Database Configuration ---
app = Flask(__name__)
CORS(app)

# Supabase PostgreSQL Configuration
db_user = os.environ.get('SUPABASE_DB_USER', 'postgres')
db_password = os.environ.get('SUPABASE_DB_PASSWORD', 'puravbhatt0504')
db_host = os.environ.get('SUPABASE_DB_HOST', 'db.sevlfbqydeludjfzatfe.supabase.co')
db_name = os.environ.get('SUPABASE_DB_NAME', 'postgres')
db_port = os.environ.get('SUPABASE_DB_PORT', '5432')

print(f"=== VERCEL DATABASE CONFIG ===")
print(f"DB_USER: {db_user}")
print(f"DB_HOST: {db_host}")
print(f"DB_NAME: {db_name}")
print(f"DB_PORT: {db_port}")
print(f"=== END VERCEL CONFIG ===")

# Construct PostgreSQL connection string
connection_string = f"postgresql+psycopg://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
app.config['SQLALCHEMY_DATABASE_URI'] = connection_string
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Configure engine options for Vercel
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    'pool_pre_ping': True,
    'pool_recycle': 300,
    'pool_timeout': 10,
    'max_overflow': 0,
    'pool_size': 1,
    'connect_args': {
        'sslmode': 'require',
        'connect_timeout': 10,
        'options': '-c default_transaction_isolation=read_committed'
    }
}

db = SQLAlchemy(app)

# --- Database Models ---
class Employee(db.Model):
    __tablename__ = 'employees'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    position = db.Column(db.String(100), nullable=False)
    department = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    hire_date = db.Column(db.Date, nullable=False)
    salary = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default='Active')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Attendance(db.Model):
    __tablename__ = 'attendance'
    id = db.Column(db.Integer, primary_key=True)
    employee_id = db.Column(db.Integer, db.ForeignKey('employees.id'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    check_in = db.Column(db.Time)
    check_out = db.Column(db.Time)
    hours_worked = db.Column(db.Float, default=0.0)
    status = db.Column(db.String(20), default='Present')
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Expense(db.Model):
    __tablename__ = 'expenses'
    id = db.Column(db.Integer, primary_key=True)
    employee_id = db.Column(db.Integer, db.ForeignKey('employees.id'), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    description = db.Column(db.Text, nullable=False)
    amount = db.Column(db.Float, nullable=False)
    date = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(20), default='Pending')
    receipt_url = db.Column(db.String(500))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# --- API Routes ---
@app.route('/')
def home():
    return jsonify({
        'message': 'Admin Portal API - Vercel Deployment',
        'status': 'running',
        'version': '2.0.0',
        'database': 'Supabase PostgreSQL'
    })

@app.route('/api/health')
def health_check():
    try:
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

@app.route('/api/employees', methods=['GET'])
def get_employees():
    try:
        employees = db.session.query(Employee).all()
        result = [{'id': emp.id, 'name': emp.name} for emp in employees]
        return jsonify({'employees': result})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/employees', methods=['POST'])
def add_employee():
    try:
        data = request.get_json()
        employee = Employee(
            name=data['name'],
            position=data['position'],
            department=data['department'],
            email=data['email'],
            phone=data['phone'],
            hire_date=datetime.strptime(data['hire_date'], '%Y-%m-%d').date(),
            salary=float(data['salary'])
        )
        db.session.add(employee)
        db.session.commit()
        return jsonify({'message': 'Employee added successfully', 'id': employee.id})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/employees/<int:employee_id>', methods=['DELETE'])
def remove_employee(employee_id):
    try:
        employee = db.session.query(Employee).get(employee_id)
        if employee:
            db.session.delete(employee)
            db.session.commit()
            return jsonify({'message': 'Employee removed successfully'})
        return jsonify({'error': 'Employee not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/attendance', methods=['GET'])
def get_attendance():
    try:
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        query = db.session.query(Attendance).join(Employee)
        
        if start_date:
            query = query.filter(Attendance.date >= datetime.strptime(start_date, '%Y-%m-%d').date())
        if end_date:
            query = query.filter(Attendance.date <= datetime.strptime(end_date, '%Y-%m-%d').date())
            
        records = query.all()
        
        result = []
        for record in records:
            result.append({
                'id': record.id,
                'employee_name': record.employee.name,
                'date': record.date.isoformat(),
                'check_in': record.check_in.isoformat() if record.check_in else None,
                'check_out': record.check_out.isoformat() if record.check_out else None,
                'hours_worked': record.hours_worked,
                'status': record.status
            })
        
        return jsonify({'attendance': result})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/expenses', methods=['GET'])
def get_expenses():
    try:
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        query = db.session.query(Expense).join(Employee)
        
        if start_date:
            query = query.filter(Expense.date >= datetime.strptime(start_date, '%Y-%m-%d').date())
        if end_date:
            query = query.filter(Expense.date <= datetime.strptime(end_date, '%Y-%m-%d').date())
            
        records = query.all()
        
        result = []
        for record in records:
            result.append({
                'id': record.id,
                'employee_name': record.employee.name,
                'category': record.category,
                'description': record.description,
                'amount': record.amount,
                'date': record.date.isoformat(),
                'status': record.status
            })
        
        return jsonify({'expenses': result})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/reports/pdf', methods=['POST'])
def generate_report_pdf():
    try:
        report_type = request.args.get('type', 'Attendance')
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        # Create PDF
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font('Arial', 'B', 16)
        pdf.cell(0, 10, f'{report_type} Report', 0, 1, 'C')
        pdf.ln(10)
        
        pdf.set_font('Arial', '', 12)
        pdf.cell(0, 10, f'Period: {start_date} to {end_date}', 0, 1)
        pdf.ln(10)
        
        # Add data based on report type
        if report_type == 'Attendance':
            records = db.session.query(Attendance).join(Employee).filter(
                Attendance.date >= datetime.strptime(start_date, '%Y-%m-%d').date(),
                Attendance.date <= datetime.strptime(end_date, '%Y-%m-%d').date()
            ).all()
            
            pdf.cell(40, 10, 'Employee', 1, 0, 'C')
            pdf.cell(30, 10, 'Date', 1, 0, 'C')
            pdf.cell(30, 10, 'Check In', 1, 0, 'C')
            pdf.cell(30, 10, 'Check Out', 1, 0, 'C')
            pdf.cell(30, 10, 'Hours', 1, 1, 'C')
            
            for record in records:
                pdf.cell(40, 10, record.employee.name, 1, 0)
                pdf.cell(30, 10, record.date.strftime('%Y-%m-%d'), 1, 0)
                pdf.cell(30, 10, record.check_in.strftime('%H:%M') if record.check_in else 'N/A', 1, 0)
                pdf.cell(30, 10, record.check_out.strftime('%H:%M') if record.check_out else 'N/A', 1, 0)
                pdf.cell(30, 10, str(record.hours_worked), 1, 1)
        
        # Generate PDF bytes
        pdf_bytes = pdf.output()
        
        response = send_file(
            io.BytesIO(pdf_bytes),
            mimetype='application/pdf',
            as_attachment=False,
            download_name=f'{report_type.lower()}_report.pdf'
        )
        
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
        
        return response
        
    except Exception as e:
        print(f"PDF generation error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'PDF generation failed: {str(e)}'}), 500

@app.route('/api/debug/logs', methods=['POST'])
def debug_logs():
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

# Vercel handler
def handler(request):
    return app(request.environ, start_response)

if __name__ == '__main__':
    app.run(debug=True)
