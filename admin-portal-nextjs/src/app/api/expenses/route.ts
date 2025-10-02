import { NextResponse } from 'next/server'
import pool from '@/lib/database'

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT 
        e.id, 
        emp.name as employee_name, 
        e.category, 
        e.description, 
        e.amount, 
        e.date, 
        e.status,
        COALESCE(e.kilometers, 0) as kilometers,
        COALESCE(e.expense_type, 'General') as expense_type,
        COALESCE(e.receipt_number, '') as receipt_number,
        COALESCE(e.notes, '') as notes
      FROM expenses e
      JOIN employees emp ON e.employee_id = emp.id
      ORDER BY e.date DESC, e.id DESC
    `)
    
    return NextResponse.json({ expenses: result.rows })
  } catch (error) {
    console.error('Error fetching expenses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch expenses' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { 
      employee_id, 
      category, 
      description, 
      amount, 
      date, 
      status, 
      kilometers, 
      expense_type, 
      receipt_number, 
      notes 
    } = data

    // First try with all columns
    let result;
    try {
      result = await pool.query(`
        INSERT INTO expenses (employee_id, category, description, amount, date, status, kilometers, expense_type, receipt_number, notes)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `, [
        parseInt(employee_id), 
        category, 
        description, 
        parseFloat(amount), 
        date, 
        status,
        kilometers ? parseFloat(kilometers) : null,
        expense_type || 'General',
        receipt_number || null,
        notes || null
      ])
    } catch (error) {
      // If new columns don't exist, fall back to basic insert
      console.log('New columns not available, using basic insert')
      result = await pool.query(`
        INSERT INTO expenses (employee_id, category, description, amount, date, status)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `, [
        parseInt(employee_id), 
        category, 
        description, 
        parseFloat(amount), 
        date, 
        status
      ])
      
      // Add default values for missing columns
      result.rows[0].kilometers = 0
      result.rows[0].expense_type = expense_type || 'General'
      result.rows[0].receipt_number = receipt_number || ''
      result.rows[0].notes = notes || ''
    }

    return NextResponse.json({ expense: result.rows[0] })
  } catch (error) {
    console.error('Error creating expense:', error)
    return NextResponse.json(
      { error: 'Failed to create expense' },
      { status: 500 }
    )
  }
}
