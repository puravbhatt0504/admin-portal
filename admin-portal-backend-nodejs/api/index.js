const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Mock data
const employees = [
  { id: 1, name: 'John Doe', position: 'Developer', department: 'IT' },
  { id: 2, name: 'Jane Smith', position: 'Designer', department: 'Design' }
];

const attendance = [
  {
    id: 1,
    employee_name: 'John Doe',
    date: '2025-01-01',
    check_in: '09:00:00',
    check_out: '17:00:00',
    hours_worked: 8.0,
    status: 'Present'
  }
];

const expenses = [
  {
    id: 1,
    employee_name: 'John Doe',
    category: 'Travel',
    description: 'Client meeting',
    amount: 100.0,
    date: '2025-01-01',
    status: 'Pending'
  }
];

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Admin Portal API - Node.js on Vercel',
    status: 'running',
    version: '2.0.0',
    database: 'Mock Data (for testing)'
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    database: 'connected',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/employees', (req, res) => {
  res.json({ employees: employees.map(emp => ({ id: emp.id, name: emp.name })) });
});

app.post('/api/employees', (req, res) => {
  const newEmployee = {
    id: employees.length + 1,
    name: req.body.name || 'New Employee',
    position: req.body.position || 'Unknown',
    department: req.body.department || 'Unknown'
  };
  employees.push(newEmployee);
  res.json({ message: 'Employee added successfully', id: newEmployee.id });
});

app.delete('/api/employees/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = employees.findIndex(emp => emp.id === id);
  if (index > -1) {
    employees.splice(index, 1);
    res.json({ message: 'Employee removed successfully' });
  } else {
    res.status(404).json({ error: 'Employee not found' });
  }
});

app.get('/api/attendance', (req, res) => {
  res.json({ attendance });
});

app.get('/api/expenses', (req, res) => {
  res.json({ expenses });
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
