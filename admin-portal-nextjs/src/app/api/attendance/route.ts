import { NextResponse } from 'next/server'
import pool from '@/lib/database'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get('employee_id')
    const date = searchParams.get('date')
    
    let query = `
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
    `
    
    const conditions = []
    const params = []
    
    if (employeeId) {
      conditions.push(`a.employee_id = $${params.length + 1}`)
      params.push(parseInt(employeeId))
    }
    
    if (date) {
      conditions.push(`a.date = $${params.length + 1}`)
      params.push(date)
    }
    
    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`
    }
    
    query += ` ORDER BY a.date DESC, a.shift1_in DESC`
    
    const result = await pool.query(query, params)
    
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

    // Debug logging
    console.log('API Total Hours Calculation:', {
      shift1_in,
      shift1_out,
      shift2_in,
      shift2_out,
      total_hours
    })

    // Check if attendance already exists for this employee and date
    const existingAttendance = await pool.query(`
      SELECT id FROM attendance 
      WHERE employee_id = $1 AND date = $2
    `, [parseInt(employee_id), date])

    let result

    if (existingAttendance.rows.length > 0) {
      // Update existing record
      console.log('Updating existing attendance record')
      result = await pool.query(`
        UPDATE attendance 
        SET shift1_in = $1, shift1_out = $2, shift2_in = $3, shift2_out = $4, total_hours = $5, status = $6
        WHERE employee_id = $7 AND date = $8
        RETURNING *
      `, [shift1_in || null, shift1_out || null, shift2_in || null, shift2_out || null, total_hours, status, parseInt(employee_id), date])
    } else {
      // Insert new record with retry mechanism for ID collisions
      console.log('Creating new attendance record')
      
      let attempts = 0
      const maxAttempts = 5
      let insertSuccess = false
      
      while (attempts < maxAttempts && !insertSuccess) {
        try {
          // Generate a unique ID using multiple factors (keeping it within integer range)
          const timestampId = Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 100000) + (parseInt(employee_id) * 1000) + attempts
          
          result = await pool.query(`
            INSERT INTO attendance (id, employee_id, date, shift1_in, shift1_out, shift2_in, shift2_out, total_hours, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *
          `, [timestampId, parseInt(employee_id), date, shift1_in || null, shift1_out || null, shift2_in || null, shift2_out || null, total_hours, status])
          
          insertSuccess = true
        } catch (error: any) {
          if (error.code === '23505' && attempts < maxAttempts - 1) {
            // Duplicate key error, try again with different ID
            attempts++
            console.log(`ID collision detected, retrying with attempt ${attempts + 1}`)
            continue
          } else {
            throw error
          }
        }
      }
      
      if (!insertSuccess) {
        throw new Error('Failed to create attendance record after multiple attempts')
      }
    }
    
    return NextResponse.json({ 
      attendance: result.rows[0],
      message: existingAttendance.rows.length > 0 ? 'Attendance updated successfully' : 'Attendance created successfully'
    })
  } catch (error) {
    console.error('Error creating/updating attendance:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create/update attendance',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
