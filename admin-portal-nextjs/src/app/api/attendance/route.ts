import { NextResponse } from 'next/server'
import pool from '@/lib/database'

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT 
        a.id, 
        e.name as employee_name, 
        a.date, 
        a.shift1_in, 
        a.shift1_out, 
        a.shift2_in, 
        a.shift2_out, 
        a.total_hours, 
        a.status
      FROM attendance a
      JOIN employees e ON a.employee_id = e.id
      ORDER BY a.date DESC, a.shift1_in DESC
    `)
    
    return NextResponse.json({ attendance: result.rows })
  } catch (error) {
    console.error('Error fetching attendance:', error)
    return NextResponse.json(
      { error: 'Failed to fetch attendance' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { employee_id, date, shift1_in, shift1_out, shift2_in, shift2_out, status } = data

          // Calculate total hours worked
          let total_hours = 0

          // Calculate shift 1 hours
          if (shift1_in && shift1_out) {
            const start1 = new Date(`2000-01-01T${shift1_in}`)
            const end1 = new Date(`2000-01-01T${shift1_out}`)
            let diffMs1 = end1.getTime() - start1.getTime()
            
            // Handle overnight shifts (end time is next day)
            if (diffMs1 < 0) {
              diffMs1 += 24 * 60 * 60 * 1000
            }
            
            const hours1 = diffMs1 / (1000 * 60 * 60)
            if (hours1 > 0) {
              total_hours += Math.round(hours1 * 100) / 100
            }
          }

          // Calculate shift 2 hours
          if (shift2_in && shift2_out) {
            const start2 = new Date(`2000-01-01T${shift2_in}`)
            const end2 = new Date(`2000-01-01T${shift2_out}`)
            let diffMs2 = end2.getTime() - start2.getTime()
            
            // Handle overnight shifts (end time is next day)
            if (diffMs2 < 0) {
              diffMs2 += 24 * 60 * 60 * 1000
            }
            
            const hours2 = diffMs2 / (1000 * 60 * 60)
            if (hours2 > 0) {
              total_hours += Math.round(hours2 * 100) / 100
            }
          }

          // Ensure non-negative result
          total_hours = Math.max(0, total_hours)

    const result = await pool.query(`
      INSERT INTO attendance (employee_id, date, shift1_in, shift1_out, shift2_in, shift2_out, total_hours, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [parseInt(employee_id), date, shift1_in || null, shift1_out || null, shift2_in || null, shift2_out || null, total_hours, status])

    return NextResponse.json({ attendance: result.rows[0] })
  } catch (error) {
    console.error('Error creating attendance:', error)
    return NextResponse.json(
      { error: 'Failed to create attendance' },
      { status: 500 }
    )
  }
}
