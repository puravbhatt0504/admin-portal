import { NextResponse } from 'next/server'
import pool from '@/lib/database'

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT id, name, position, department, email, phone, hire_date, salary
      FROM employees 
      ORDER BY name
    `)
    
    return NextResponse.json({ employees: result.rows })
  } catch (error) {
    console.error('Error fetching employees:', error)
    // Return fallback data instead of error to prevent loading loop
    return NextResponse.json({
      employees: [],
      error: 'Database connection failed - showing fallback data'
    })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { name, position, department, email, phone, hire_date, salary } = data

    const result = await pool.query(`
      INSERT INTO employees (name, position, department, email, phone, hire_date, salary)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [name, position, department, email, phone, hire_date, parseFloat(salary)])

    return NextResponse.json({ employee: result.rows[0] })
  } catch (error) {
    console.error('Error creating employee:', error)
    return NextResponse.json(
      { error: 'Failed to create employee' },
      { status: 500 }
    )
  }
}
