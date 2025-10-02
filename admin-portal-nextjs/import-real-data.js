// Import real data from JSON files to Supabase
const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config();

const pool = new Pool({
  user: process.env.SUPABASE_DB_USER || 'postgres.sevlfbqydeludjfzatfe',
  password: process.env.SUPABASE_DB_PASSWORD || 'puravbhatt0504',
  host: process.env.SUPABASE_DB_HOST || 'aws-1-ap-south-1.pooler.supabase.com',
  database: process.env.SUPABASE_DB_NAME || 'postgres',
  port: parseInt(process.env.SUPABASE_DB_PORT || '5432'),
  ssl: { rejectUnauthorized: false }
});

async function importRealData() {
  try {
    console.log('🚀 Importing real data...');

    // Clear existing data
    console.log('🗑️ Clearing existing data...');
    await pool.query('DELETE FROM expenses');
    await pool.query('DELETE FROM attendance');
    await pool.query('DELETE FROM employees');

    // Import employees
    console.log('👥 Importing employees...');
    const employeesData = JSON.parse(fs.readFileSync('../migration/employees_export.json', 'utf8'));
    
    for (const emp of employeesData) {
      await pool.query(`
        INSERT INTO employees (id, name, position, department, email, phone, hire_date, salary)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        position = EXCLUDED.position,
        department = EXCLUDED.department,
        email = EXCLUDED.email,
        phone = EXCLUDED.phone,
        hire_date = EXCLUDED.hire_date,
        salary = EXCLUDED.salary
      `, [
        emp.id,
        emp.name,
        emp.position || 'Employee',
        emp.department || 'General',
        emp.email || `${emp.name.toLowerCase().replace(' ', '.')}@company.com`,
        emp.phone || '+1234567890',
        emp.hire_date || '2024-01-01',
        emp.salary || 50000
      ]);
    }

    // Import attendance
    console.log('📅 Importing attendance...');
    const attendanceData = JSON.parse(fs.readFileSync('../migration/attendance_export.json', 'utf8'));
    
    for (const att of attendanceData) {
      // Find employee ID by name
      const empResult = await pool.query('SELECT id FROM employees WHERE name = $1', [att.employee_name]);
      if (empResult.rows.length > 0) {
        const employeeId = empResult.rows[0].id;
        
        // Calculate total hours
        let totalHours = 0;
        if (att.shift1_in && att.shift1_out) {
          const start1 = new Date(`2000-01-01T${att.shift1_in}`);
          const end1 = new Date(`2000-01-01T${att.shift1_out}`);
          const diffMs1 = end1.getTime() - start1.getTime();
          totalHours += Math.round((diffMs1 / (1000 * 60 * 60)) * 100) / 100;
        }
        if (att.shift2_in && att.shift2_out) {
          const start2 = new Date(`2000-01-01T${att.shift2_in}`);
          const end2 = new Date(`2000-01-01T${att.shift2_out}`);
          const diffMs2 = end2.getTime() - start2.getTime();
          totalHours += Math.round((diffMs2 / (1000 * 60 * 60)) * 100) / 100;
        }

        // Determine status
        let status = 'Present';
        if (att.shift1_in) {
          const checkInTime = new Date(`2000-01-01T${att.shift1_in}`);
          const expectedTime = new Date(`2000-01-01T09:00:00`);
          if (checkInTime > expectedTime) {
            status = 'Late';
          }
        } else {
          status = 'Absent';
        }

        await pool.query(`
          INSERT INTO attendance (id, employee_id, date, shift1_in, shift1_out, shift2_in, shift2_out, total_hours, status)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          ON CONFLICT (id) DO UPDATE SET
          employee_id = EXCLUDED.employee_id,
          date = EXCLUDED.date,
          shift1_in = EXCLUDED.shift1_in,
          shift1_out = EXCLUDED.shift1_out,
          shift2_in = EXCLUDED.shift2_in,
          shift2_out = EXCLUDED.shift2_out,
          total_hours = EXCLUDED.total_hours,
          status = EXCLUDED.status
        `, [
          att.id,
          employeeId,
          att.date,
          att.shift1_in || null,
          att.shift1_out || null,
          att.shift2_in || null,
          att.shift2_out || null,
          totalHours,
          status
        ]);
      }
    }

    // Import expenses
    console.log('💰 Importing expenses...');
    const generalExpenses = JSON.parse(fs.readFileSync('../migration/general_expenses_export.json', 'utf8'));
    const travelExpenses = JSON.parse(fs.readFileSync('../migration/travel_expenses_export.json', 'utf8'));
    
    // Import general expenses
    for (const exp of generalExpenses) {
      const empResult = await pool.query('SELECT id FROM employees WHERE name = $1', [exp.employee_name]);
      if (empResult.rows.length > 0) {
        await pool.query(`
          INSERT INTO expenses (id, employee_id, category, description, amount, date, status)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (id) DO UPDATE SET
          employee_id = EXCLUDED.employee_id,
          category = EXCLUDED.category,
          description = EXCLUDED.description,
          amount = EXCLUDED.amount,
          date = EXCLUDED.date,
          status = EXCLUDED.status
        `, [
          exp.id,
          empResult.rows[0].id,
          exp.category || 'General',
          exp.description || 'General expense',
          exp.amount || 0,
          exp.date || '2025-01-01',
          exp.status || 'Pending'
        ]);
      }
    }

    // Import travel expenses
    for (const exp of travelExpenses) {
      const empResult = await pool.query('SELECT id FROM employees WHERE name = $1', [exp.employee_name]);
      if (empResult.rows.length > 0) {
        await pool.query(`
          INSERT INTO expenses (id, employee_id, category, description, amount, date, status)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (id) DO UPDATE SET
          employee_id = EXCLUDED.employee_id,
          category = EXCLUDED.category,
          description = EXCLUDED.description,
          amount = EXCLUDED.amount,
          date = EXCLUDED.date,
          status = EXCLUDED.status
        `, [
          exp.id + 1000, // Offset to avoid conflicts
          empResult.rows[0].id,
          'Travel',
          exp.description || 'Travel expense',
          exp.amount || 0,
          exp.date || '2025-01-01',
          exp.status || 'Pending'
        ]);
      }
    }

    console.log('✅ Real data imported successfully!');
    console.log(`👥 Employees: ${employeesData.length}`);
    console.log(`📅 Attendance records: ${attendanceData.length}`);
    console.log(`💰 Expenses: ${generalExpenses.length + travelExpenses.length}`);

  } catch (error) {
    console.error('❌ Error importing real data:', error);
  } finally {
    await pool.end();
  }
}

importRealData();
