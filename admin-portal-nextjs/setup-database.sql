-- Database setup script for Admin Portal Next.js
-- Run this in your Supabase SQL Editor

-- Drop existing tables if they exist (be careful with this in production)
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS employees CASCADE;

-- Create employees table
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
);

-- Create attendance table with shift support
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
);

-- Create expenses table
CREATE TABLE expenses (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    amount DECIMAL(10,2) NOT NULL,
    date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending',
    -- Additional fields for detailed tracking
    kilometers DECIMAL(8,2), -- For travel expenses
    expense_type VARCHAR(50) DEFAULT 'General', -- General, Travel, Food, etc.
    receipt_number VARCHAR(100), -- Receipt reference
    notes TEXT, -- Additional notes
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO employees (name, position, department, email, phone, hire_date, salary) VALUES
('John Doe', 'Manager', 'IT', 'john.doe@company.com', '+1234567890', '2024-01-15', 75000),
('Jane Smith', 'Developer', 'IT', 'jane.smith@company.com', '+1234567891', '2024-02-01', 65000),
('Mike Johnson', 'Designer', 'Design', 'mike.johnson@company.com', '+1234567892', '2024-01-20', 55000);

-- Insert sample attendance data
INSERT INTO attendance (employee_id, date, shift1_in, shift1_out, shift2_in, shift2_out, total_hours, status) VALUES
(1, '2025-01-01', '09:00:00', '17:00:00', NULL, NULL, 8.0, 'Present'),
(2, '2025-01-01', '09:15:00', '17:15:00', NULL, NULL, 8.0, 'Late'),
(3, '2025-01-01', '09:00:00', '13:00:00', '14:00:00', '18:00:00', 8.0, 'Present');

-- Insert sample expense data
INSERT INTO expenses (employee_id, category, description, amount, date, status) VALUES
(1, 'Travel', 'Client meeting in downtown', 150.00, '2025-01-01', 'Approved'),
(2, 'Meals', 'Team lunch', 75.50, '2025-01-01', 'Pending'),
(3, 'Office Supplies', 'New laptop', 1200.00, '2025-01-01', 'Approved');

-- Create indexes for better performance
CREATE INDEX idx_attendance_employee_id ON attendance(employee_id);
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_expenses_employee_id ON expenses(employee_id);
CREATE INDEX idx_expenses_date ON expenses(date);
CREATE INDEX idx_expenses_status ON expenses(status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON attendance
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
