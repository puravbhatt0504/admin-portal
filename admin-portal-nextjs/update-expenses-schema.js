const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.SUPABASE_DB_USER,
  password: process.env.SUPABASE_DB_PASSWORD,
  host: process.env.SUPABASE_DB_HOST,
  database: process.env.SUPABASE_DB_NAME,
  port: parseInt(process.env.SUPABASE_DB_PORT || '5432'),
  ssl: { rejectUnauthorized: false }
});

async function addExpenseColumns() {
  try {
    console.log('Adding new columns to expenses table...');
    
    // Add new columns if they don't exist
    await pool.query(`
      ALTER TABLE expenses 
      ADD COLUMN IF NOT EXISTS kilometers DECIMAL(8,2),
      ADD COLUMN IF NOT EXISTS expense_type VARCHAR(50) DEFAULT 'General',
      ADD COLUMN IF NOT EXISTS receipt_number VARCHAR(100),
      ADD COLUMN IF NOT EXISTS notes TEXT
    `);
    
    console.log('✅ Successfully added new columns to expenses table');
    
    // Update existing records to have default expense_type
    await pool.query(`
      UPDATE expenses 
      SET expense_type = 'General' 
      WHERE expense_type IS NULL
    `);
    
    console.log('✅ Updated existing records with default expense_type');
    
  } catch (error) {
    console.error('❌ Error updating expenses table:', error);
  } finally {
    await pool.end();
  }
}

addExpenseColumns();
