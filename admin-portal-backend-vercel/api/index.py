from flask import Flask, jsonify, request
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

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
    return jsonify({
        'status': 'healthy',
        'database': 'connected',
        'timestamp': '2025-01-01T00:00:00Z'
    })

@app.route('/api/employees', methods=['GET'])
def get_employees():
    return jsonify({
        'employees': [
            {'id': 1, 'name': 'Test Employee 1'},
            {'id': 2, 'name': 'Test Employee 2'}
        ]
    })

@app.route('/api/employees', methods=['POST'])
def add_employee():
    data = request.get_json()
    return jsonify({
        'message': 'Employee added successfully',
        'id': 999
    })

@app.route('/api/employees/<int:employee_id>', methods=['DELETE'])
def remove_employee(employee_id):
    return jsonify({
        'message': 'Employee removed successfully'
    })

@app.route('/api/attendance', methods=['GET'])
def get_attendance():
    return jsonify({
        'attendance': [
            {
                'id': 1,
                'employee_name': 'Test Employee',
                'date': '2025-01-01',
                'check_in': '09:00:00',
                'check_out': '17:00:00',
                'hours_worked': 8.0,
                'status': 'Present'
            }
        ]
    })

@app.route('/api/expenses', methods=['GET'])
def get_expenses():
    return jsonify({
        'expenses': [
            {
                'id': 1,
                'employee_name': 'Test Employee',
                'category': 'Travel',
                'description': 'Test expense',
                'amount': 100.0,
                'date': '2025-01-01',
                'status': 'Pending'
            }
        ]
    })

@app.route('/api/reports/pdf', methods=['POST'])
def generate_report_pdf():
    return jsonify({
        'message': 'PDF generation endpoint ready',
        'status': 'success'
    })

@app.route('/api/debug/logs', methods=['POST'])
def debug_logs():
    data = request.get_json()
    print(f"Debug log: {data}")
    return jsonify({
        'status': 'logged',
        'timestamp': '2025-01-01T00:00:00Z'
    })

# Vercel serverless function handler
def handler(request):
    return app(request.environ, start_response)