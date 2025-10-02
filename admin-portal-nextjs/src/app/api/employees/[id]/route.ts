import { NextResponse } from 'next/server'
import pool from '@/lib/database'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const data = await request.json()
    const { name, position, department, email, phone, hire_date, salary } = data
    const { id: idParam } = await params
    const id = parseInt(idParam)

    const result = await pool.query(`
      UPDATE employees 
      SET name = $1, position = $2, department = $3, email = $4, phone = $5, hire_date = $6, salary = $7
      WHERE id = $8
      RETURNING *
    `, [name, position, department, email, phone, hire_date, parseFloat(salary), id])

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ employee: result.rows[0] })
  } catch (error) {
    console.error('Error updating employee:', error)
    return NextResponse.json(
      { error: 'Failed to update employee' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params
    const id = parseInt(idParam)

    const result = await pool.query(`
      DELETE FROM employees 
      WHERE id = $1
      RETURNING *
    `, [id])

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: 'Employee deleted successfully' })
  } catch (error) {
    console.error('Error deleting employee:', error)
    return NextResponse.json(
      { error: 'Failed to delete employee' },
      { status: 500 }
    )
  }
}
