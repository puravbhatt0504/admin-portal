import { NextResponse } from 'next/server'
import pool from '@/lib/database'
import { PDFService } from '@/lib/pdfService'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const reportType = searchParams.get('type') || 'Attendance'
    const startDate = searchParams.get('start_date') || '2025-01-01'
    const endDate = searchParams.get('end_date') || '2025-01-31'

    let pdfBuffer: Buffer
    let filename: string

    if (reportType === 'Attendance') {
      const result = await pool.query(`
        SELECT 
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
        WHERE a.date >= $1 AND a.date <= $2
        ORDER BY a.date DESC, e.name
      `, [startDate, endDate])
      
      pdfBuffer = PDFService.generateAttendanceReport(result.rows, startDate, endDate)
      filename = `attendance_report_${startDate}_to_${endDate}.pdf`
    } else if (reportType === 'Expenses') {
      const result = await pool.query(`
        SELECT 
          e.name as employee_name,
          exp.category,
          exp.description,
          exp.amount,
          exp.date,
          exp.status
        FROM expenses exp
        JOIN employees e ON exp.employee_id = e.id
        WHERE exp.date >= $1 AND exp.date <= $2
        ORDER BY exp.date DESC, e.name
      `, [startDate, endDate])
      
      // For basic expense report, use the detailed expense report generator
      pdfBuffer = PDFService.generateDetailedExpenseReport(result.rows, startDate, endDate)
      filename = `expense_report_${startDate}_to_${endDate}.pdf`
    } else if (reportType === 'Employees') {
      const result = await pool.query(`
        SELECT 
          id,
          name,
          position,
          department,
          email,
          phone,
          hire_date,
          salary,
          status
        FROM employees
        ORDER BY name
      `)
      
      pdfBuffer = PDFService.generateEmployeeReport(result.rows)
      filename = `employee_report_${new Date().toISOString().split('T')[0]}.pdf`
    } else {
      return NextResponse.json(
        { error: 'Invalid report type. Supported types: Attendance, Expenses, Employees' },
        { status: 400 }
      )
    }

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString()
      }
    })
  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json(
      { error: 'Failed to generate report', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}