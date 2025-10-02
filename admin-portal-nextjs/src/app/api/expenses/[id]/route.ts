import { NextResponse } from 'next/server'
import pool from '@/lib/database'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const data = await request.json()
    const { employee_id, category, description, amount, date, status } = data
    const { id: idParam } = await params
    const id = parseInt(idParam)

    const result = await pool.query(`
      UPDATE expenses 
      SET employee_id = $1, category = $2, description = $3, amount = $4, date = $5, status = $6
      WHERE id = $7
      RETURNING *
    `, [parseInt(employee_id), category, description, parseFloat(amount), date, status, id])

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ expense: result.rows[0] })
  } catch (error) {
    console.error('Error updating expense:', error)
    return NextResponse.json(
      { error: 'Failed to update expense' },
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
      DELETE FROM expenses 
      WHERE id = $1
      RETURNING *
    `, [id])

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: 'Expense deleted successfully' })
  } catch (error) {
    console.error('Error deleting expense:', error)
    return NextResponse.json(
      { error: 'Failed to delete expense' },
      { status: 500 }
    )
  }
}
