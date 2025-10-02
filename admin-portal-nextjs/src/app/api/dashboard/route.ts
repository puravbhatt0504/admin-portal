import { NextResponse } from 'next/server'
import pool from '@/lib/database'

export async function GET() {
  try {
    // Get total employees
    const employeesResult = await pool.query('SELECT COUNT(*) as count FROM employees')
    const totalEmployees = parseInt(employeesResult.rows[0].count)

    // Get today's attendance
    const today = new Date().toISOString().split('T')[0]
    const attendanceResult = await pool.query(`
      SELECT 
        COUNT(CASE WHEN status = 'Present' THEN 1 END) as present,
        COUNT(CASE WHEN status = 'Late' THEN 1 END) as late,
        COUNT(CASE WHEN status = 'Absent' THEN 1 END) as absent
      FROM attendance 
      WHERE date = $1
    `, [today])

    const presentToday = parseInt(attendanceResult.rows[0].present) || 0
    const lateToday = parseInt(attendanceResult.rows[0].late) || 0
    const absentToday = parseInt(attendanceResult.rows[0].absent) || 0

    // Get total expenses for current month
    const currentMonth = new Date().toISOString().substring(0, 7)
    const expensesResult = await pool.query(`
      SELECT SUM(amount) as total 
      FROM expenses 
      WHERE date >= $1 AND status = 'Approved'
    `, [`${currentMonth}-01`])
    const totalExpenses = parseFloat(expensesResult.rows[0].total) || 0

    // Get recent attendance
    const recentAttendanceResult = await pool.query(`
      SELECT 
        e.name as employee_name,
        a.status,
        a.shift1_in,
        a.date
      FROM attendance a
      JOIN employees e ON a.employee_id = e.id
      ORDER BY a.date DESC, a.shift1_in DESC
      LIMIT 10
    `)

    const recentAttendance = recentAttendanceResult.rows.map(row => ({
      employee_name: row.employee_name,
      action: 'Check In',
      time: row.shift1_in,
      status: row.status
    }))

    // Get expense breakdown
    const expenseBreakdownResult = await pool.query(`
      SELECT 
        category,
        SUM(amount) as total
      FROM expenses
      WHERE date >= $1
      GROUP BY category
      ORDER BY total DESC
    `, [`${currentMonth}-01`])

    const expenseBreakdown = expenseBreakdownResult.rows

    return NextResponse.json({
      totalEmployees,
      presentToday,
      lateToday,
      absentToday,
      totalExpenses,
      recentAttendance,
      expenseBreakdown
    })

  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}
