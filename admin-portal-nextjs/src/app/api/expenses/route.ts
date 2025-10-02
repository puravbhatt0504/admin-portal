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
        e.status
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
    const { employee_id, category, description, amount, date, status } = data

    const result = await pool.query(`
      INSERT INTO expenses (employee_id, category, description, amount, date, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [parseInt(employee_id), category, description, parseFloat(amount), date, status])

    return NextResponse.json({ expense: result.rows[0] })
  } catch (error) {
    console.error('Error creating expense:', error)
    return NextResponse.json(
      { error: 'Failed to create expense' },
      { status: 500 }
    )
  }
}
