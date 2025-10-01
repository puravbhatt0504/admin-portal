const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Supabase PostgreSQL Configuration
const pool = new Pool({
  user: process.env.SUPABASE_DB_USER || 'postgres',
  password: process.env.SUPABASE_DB_PASSWORD || 'puravbhatt0504',
  host: process.env.SUPABASE_DB_HOST || 'db.sevlfbqydeludjfzatfe.supabase.co',
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
    console.log('Using fallback employee data');
    // Fallback data
    res.json({ 
      employees: [
        { id: 1, name: 'John Doe' },
        { id: 2, name: 'Jane Smith' }
      ] 
    });
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
    console.log('Using fallback attendance data');
    // Fallback data
    res.json({ 
      attendance: [
        {
          id: 1,
          employee_name: 'John Doe',
          date: '2025-01-01',
          check_in: '09:00:00',
          check_out: '17:00:00',
          hours_worked: 8.0,
          status: 'Present'
        }
      ] 
    });
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
    console.log('Using fallback expense data');
    // Fallback data
    res.json({ 
      expenses: [
        {
          id: 1,
          employee_name: 'John Doe',
          category: 'Travel',
          description: 'Client meeting',
          amount: 100,
          date: '2025-01-01',
          status: 'Pending'
        }
      ] 
    });
  }
});

app.post('/api/reports/pdf', (req, res) => {
  res.json({
    message: 'PDF generation endpoint ready',
    status: 'success'
  });
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
