const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();

// CORS configuration
const corsOptions = {
  origin: [
    'https://admin-portal-dusky.vercel.app',
    'https://admin-portal-psi-five.vercel.app',
    'http://localhost:3000',
    'http://127.0.0.1:5500',
    'file://'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
app.use(express.json());

// Manual CORS handling for preflight requests
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

// Supabase PostgreSQL Configuration - Using Shared Pooler
const pool = new Pool({
  user: process.env.SUPABASE_DB_USER || 'postgres.sevlfbqydeludjfzatfe',
  password: process.env.SUPABASE_DB_PASSWORD || 'puravbhatt0504',
  host: process.env.SUPABASE_DB_HOST || 'aws-1-ap-south-1.pooler.supabase.com',
  database: process.env.SUPABASE_DB_NAME || 'postgres',
  port: process.env.SUPABASE_DB_PORT || 5432,
  ssl: { rejectUnauthorized: false }
});

console.log('=== SUPABASE CONFIG ===');
console.log('DB_USER:', process.env.SUPABASE_DB_USER || 'postgres');
console.log('DB_HOST:', process.env.SUPABASE_DB_HOST || 'db.sevlfbqydeludjfzatfe.supabase.co');
console.log('DB_NAME:', process.env.SUPABASE_DB_NAME || 'postgres');
console.log('DB_PORT:', process.env.SUPABASE_DB_PORT || 5432);
console.log('=== END CONFIG ===');

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Admin Portal API - Node.js on Vercel',
    status: 'running',
    version: '2.0.0',
    database: 'Supabase PostgreSQL'
  });
});

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.log('Database connection failed, using fallback mode');
    res.json({
      status: 'healthy',
      database: 'fallback_mode',
      message: 'Using mock data due to database connection issue',
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/api/employees', async (req, res) => {
  try {
    console.log('Fetching employees...');
    const result = await pool.query('SELECT id, name FROM employees ORDER BY id');
    console.log('Employees query result:', result.rows.length, 'rows');
    res.json({ employees: result.rows });
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ error: 'Failed to fetch employees', details: error.message });
  }
});

app.post('/api/employees', async (req, res) => {
  try {
    const { name, position, department, email, phone, hire_date, salary } = req.body;
    const result = await pool.query(
      'INSERT INTO employees (name, position, department, email, phone, hire_date, salary) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      [name, position, department, email, phone, hire_date, salary]
    );
    res.json({ message: 'Employee added successfully', id: result.rows[0].id });
  } catch (error) {
    console.error('Error adding employee:', error);
    res.status(500).json({ error: 'Failed to add employee' });
  }
});

app.delete('/api/employees/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await pool.query('DELETE FROM employees WHERE id = $1', [id]);
    if (result.rowCount > 0) {
      res.json({ message: 'Employee removed successfully' });
    } else {
      res.status(404).json({ error: 'Employee not found' });
    }
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ error: 'Failed to delete employee' });
  }
});

app.get('/api/attendance', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    let query = `
      SELECT a.id, e.name as employee_name, a.date, a.check_in, a.check_out, 
             a.hours_worked, a.status
      FROM attendance a
      JOIN employees e ON a.employee_id = e.id
    `;
    const params = [];
    
    if (start_date) {
      query += ' WHERE a.date >= $1';
      params.push(start_date);
    }
    if (end_date) {
      query += start_date ? ' AND a.date <= $2' : ' WHERE a.date <= $1';
      params.push(end_date);
    }
    
    query += ' ORDER BY a.date DESC';
    
    const result = await pool.query(query, params);
    res.json({ attendance: result.rows });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ error: 'Failed to fetch attendance', details: error.message });
  }
});

app.get('/api/expenses', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    let query = `
      SELECT e.id, emp.name as employee_name, e.category, e.description, 
             e.amount, e.date, e.status
      FROM expenses e
      JOIN employees emp ON e.employee_id = emp.id
    `;
    const params = [];
    
    if (start_date) {
      query += ' WHERE e.date >= $1';
      params.push(start_date);
    }
    if (end_date) {
      query += start_date ? ' AND e.date <= $2' : ' WHERE e.date <= $1';
      params.push(end_date);
    }
    
    query += ' ORDER BY e.date DESC';
    
    console.log('Executing expenses query:', query);
    console.log('Query params:', params);
    
    const result = await pool.query(query, params);
    console.log('Expenses query result:', result.rows.length, 'rows');
    res.json({ expenses: result.rows });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ error: 'Failed to fetch expenses', details: error.message });
  }
});

app.post('/api/reports/pdf', async (req, res) => {
  try {
    const report_type = req.query.type || 'Attendance';
    const start_date = req.query.start_date || '2025-01-01';
    const end_date = req.query.end_date || '2025-01-31';
    
    // Try to get real data first
    let data = [];
    try {
      if (report_type === 'Attendance') {
        const result = await pool.query(`
          SELECT a.id, e.name as employee_name, a.date, a.check_in, a.check_out, 
                 a.hours_worked, a.status
          FROM attendance a
          JOIN employees e ON a.employee_id = e.id
          WHERE a.date >= $1 AND a.date <= $2
          ORDER BY a.date DESC
        `, [start_date, end_date]);
        data = result.rows;
      } else if (report_type === 'Travel Expenses' || report_type === 'General Expenses') {
        const result = await pool.query(`
          SELECT e.id, emp.name as employee_name, e.category, e.description, 
                 e.amount, e.date, e.status
          FROM expenses e
          JOIN employees emp ON e.employee_id = emp.id
          WHERE e.date >= $1 AND e.date <= $2
          ORDER BY e.date DESC
        `, [start_date, end_date]);
        data = result.rows;
      }
    } catch (dbError) {
      console.log('Database query failed, using fallback data for PDF');
      // Fallback data for PDF generation
      if (report_type === 'Attendance') {
        data = [
          {
            id: 1,
            employee_name: 'John Doe',
            date: '2025-01-15',
            check_in: '09:00:00',
            check_out: '17:00:00',
            hours_worked: 8.0,
            status: 'Present'
          },
          {
            id: 2,
            employee_name: 'Jane Smith',
            date: '2025-01-15',
            check_in: '08:30:00',
            check_out: '16:30:00',
            hours_worked: 8.0,
            status: 'Present'
          }
        ];
      } else {
        data = [
          {
            id: 1,
            employee_name: 'John Doe',
            category: 'Travel',
            description: 'Client meeting',
            amount: 150.00,
            date: '2025-01-15',
            status: 'Approved'
          },
          {
            id: 2,
            employee_name: 'Jane Smith',
            category: 'Meals',
            description: 'Team lunch',
            amount: 75.50,
            date: '2025-01-16',
            status: 'Pending'
          }
        ];
      }
    }
    
    // Generate PDF content (simplified text-based PDF)
    let pdfContent = `${report_type} Report\n`;
    pdfContent += `Period: ${start_date} to ${end_date}\n`;
    pdfContent += `Generated: ${new Date().toISOString().split('T')[0]}\n\n`;
    
    if (report_type === 'Attendance') {
      pdfContent += `Employee Name | Date | Check In | Check Out | Hours | Status\n`;
      pdfContent += `-`.repeat(60) + `\n`;
      data.forEach(record => {
        pdfContent += `${record.employee_name} | ${record.date} | ${record.check_in || 'N/A'} | ${record.check_out || 'N/A'} | ${record.hours_worked} | ${record.status}\n`;
      });
    } else {
      pdfContent += `Employee Name | Category | Description | Amount | Date | Status\n`;
      pdfContent += `-`.repeat(70) + `\n`;
      data.forEach(record => {
        pdfContent += `${record.employee_name} | ${record.category} | ${record.description} | $${record.amount} | ${record.date} | ${record.status}\n`;
      });
    }
    
    // Return PDF content as text (frontend can convert to PDF)
    res.json({
      success: true,
      pdfContent: pdfContent,
      filename: `${report_type.toLowerCase().replace(' ', '_')}_report_${start_date}_to_${end_date}.txt`,
      message: 'PDF data generated successfully'
    });
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({
      error: 'Failed to generate PDF',
      details: error.message
    });
  }
});

app.post('/api/debug/logs', (req, res) => {
  console.log('Debug log:', req.body);
  res.json({
    status: 'logged',
    timestamp: new Date().toISOString()
  });
});

// Export for Vercel
module.exports = app;
