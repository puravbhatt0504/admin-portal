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

async function fixDatabaseSchema() {
  try {
    console.log('🔧 Fixing database schema...');
    
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
    
    // Check if we have any expenses and categorize them
    const result = await pool.query('SELECT id, category, description FROM expenses');
    console.log(`📊 Found ${result.rows.length} existing expenses`);
    
    // Categorize existing expenses based on category
    for (const expense of result.rows) {
      let expenseType = 'General';
      
      // Categorize based on category
      if (expense.category && expense.category.toLowerCase().includes('travel')) {
        expenseType = 'Travel';
      } else if (expense.category && expense.category.toLowerCase().includes('taxi')) {
        expenseType = 'Travel';
      } else if (expense.category && expense.category.toLowerCase().includes('fuel')) {
        expenseType = 'Travel';
      } else if (expense.category && expense.category.toLowerCase().includes('toll')) {
        expenseType = 'Travel';
      } else if (expense.category && expense.category.toLowerCase().includes('parking')) {
        expenseType = 'Travel';
      } else if (expense.category && expense.category.toLowerCase().includes('flight')) {
        expenseType = 'Travel';
      } else if (expense.category && expense.category.toLowerCase().includes('hotel')) {
        expenseType = 'Travel';
      } else if (expense.category && expense.category.toLowerCase().includes('meals')) {
        expenseType = 'Food';
      } else if (expense.category && expense.category.toLowerCase().includes('food')) {
        expenseType = 'Food';
      } else if (expense.category && expense.category.toLowerCase().includes('office')) {
        expenseType = 'Office';
      } else if (expense.category && expense.category.toLowerCase().includes('equipment')) {
        expenseType = 'Office';
      } else if (expense.category && expense.category.toLowerCase().includes('supplies')) {
        expenseType = 'Office';
      }
      
      // Update the expense type
      await pool.query(
        'UPDATE expenses SET expense_type = $1 WHERE id = $2',
        [expenseType, expense.id]
      );
      
      console.log(`📝 Updated expense ${expense.id}: "${expense.description}" -> ${expenseType}`);
    }
    
    // Show final counts
    const generalCount = await pool.query("SELECT COUNT(*) FROM expenses WHERE expense_type = 'General'");
    const foodCount = await pool.query("SELECT COUNT(*) FROM expenses WHERE expense_type = 'Food'");
    const officeCount = await pool.query("SELECT COUNT(*) FROM expenses WHERE expense_type = 'Office'");
    const travelCount = await pool.query("SELECT COUNT(*) FROM expenses WHERE expense_type = 'Travel'");
    
    console.log('\n📊 Final Expense Type Distribution:');
    console.log(`General: ${generalCount.rows[0].count} expenses`);
    console.log(`Food: ${foodCount.rows[0].count} expenses`);
    console.log(`Office: ${officeCount.rows[0].count} expenses`);
    console.log(`Travel: ${travelCount.rows[0].count} expenses`);
    
    console.log('\n✅ Database schema fixed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing database schema:', error);
  } finally {
    await pool.end();
  }
}

fixDatabaseSchema();
