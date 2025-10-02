// Database setup script for Admin Portal Next.js
// Run this with: node setup-db.js

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.SUPABASE_DB_USER || 'postgres.sevlfbqydeludjfzatfe',
  password: process.env.SUPABASE_DB_PASSWORD || 'puravbhatt0504',
  host: process.env.SUPABASE_DB_HOST || 'aws-1-ap-south-1.pooler.supabase.com',
  database: process.env.SUPABASE_DB_NAME || 'postgres',
  port: parseInt(process.env.SUPABASE_DB_PORT || '5432'),
  ssl: { rejectUnauthorized: false }
});

async function setupDatabase() {
  try {
    console.log('🚀 Setting up database...');

    // Drop existing tables if they exist
    console.log('📋 Dropping existing tables...');
    await pool.query('DROP TABLE IF EXISTS expenses CASCADE');
    await pool.query('DROP TABLE IF EXISTS attendance CASCADE');
    await pool.query('DROP TABLE IF EXISTS employees CASCADE');

    // Create employees table
    console.log('👥 Creating employees table...');
    await pool.query(`
      CREATE TABLE employees (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        position VARCHAR(255),
        department VARCHAR(255),
        email VARCHAR(255),
        phone VARCHAR(255),
        hire_date DATE,
        salary DECIMAL(10,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create attendance table
    console.log('📅 Creating attendance table...');
    await pool.query(`
      CREATE TABLE attendance (
        id SERIAL PRIMARY KEY,
        employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        shift1_in TIME,
        shift1_out TIME,
        shift2_in TIME,
        shift2_out TIME,
        total_hours DECIMAL(5,2) DEFAULT 0,
        status VARCHAR(50) DEFAULT 'Present',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create expenses table
    console.log('💰 Creating expenses table...');
    await pool.query(`
      CREATE TABLE expenses (
        id SERIAL PRIMARY KEY,
        employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
        category VARCHAR(100) NOT NULL,
        description TEXT,
        amount DECIMAL(10,2) NOT NULL,
        date DATE NOT NULL,
        status VARCHAR(50) DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert sample data
    console.log('📊 Inserting sample data...');
    
    // Insert employees
    await pool.query(`
      INSERT INTO employees (name, position, department, email, phone, hire_date, salary) VALUES
      ('John Doe', 'Manager', 'IT', 'john.doe@company.com', '+1234567890', '2024-01-15', 75000),
      ('Jane Smith', 'Developer', 'IT', 'jane.smith@company.com', '+1234567891', '2024-02-01', 65000),
      ('Mike Johnson', 'Designer', 'Design', 'mike.johnson@company.com', '+1234567892', '2024-01-20', 55000)
    `);

    // Insert attendance
    await pool.query(`
      INSERT INTO attendance (employee_id, date, shift1_in, shift1_out, shift2_in, shift2_out, total_hours, status) VALUES
      (1, '2025-01-01', '09:00:00', '17:00:00', NULL, NULL, 8.0, 'Present'),
      (2, '2025-01-01', '09:15:00', '17:15:00', NULL, NULL, 8.0, 'Late'),
      (3, '2025-01-01', '09:00:00', '13:00:00', '14:00:00', '18:00:00', 8.0, 'Present')
    `);

    // Insert expenses
    await pool.query(`
      INSERT INTO expenses (employee_id, category, description, amount, date, status) VALUES
      (1, 'Travel', 'Client meeting in downtown', 150.00, '2025-01-01', 'Approved'),
      (2, 'Meals', 'Team lunch', 75.50, '2025-01-01', 'Pending'),
      (3, 'Office Supplies', 'New laptop', 1200.00, '2025-01-01', 'Approved')
    `);

    // Create indexes
    console.log('🔍 Creating indexes...');
    await pool.query('CREATE INDEX idx_attendance_employee_id ON attendance(employee_id)');
    await pool.query('CREATE INDEX idx_attendance_date ON attendance(date)');
    await pool.query('CREATE INDEX idx_expenses_employee_id ON expenses(employee_id)');
    await pool.query('CREATE INDEX idx_expenses_date ON expenses(date)');
    await pool.query('CREATE INDEX idx_expenses_status ON expenses(status)');

    console.log('✅ Database setup completed successfully!');
    console.log('🌐 Your app should now work at http://localhost:3001');

  } catch (error) {
    console.error('❌ Error setting up database:', error);
  } finally {
    await pool.end();
  }
}

setupDatabase();
