import { NextResponse } from 'next/server'
import pool from '@/lib/database'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const reportType = searchParams.get('type') || 'Attendance'
    const startDate = searchParams.get('start_date') || '2025-01-01'
    const endDate = searchParams.get('end_date') || '2025-01-31'

    let data: Record<string, unknown>[] = []
    let title = ''

    if (reportType === 'Attendance') {
      const result = await pool.query(`
        SELECT 
          e.name as employee_name,
          a.date,
          a.check_in,
          a.check_out,
          a.hours_worked,
          a.status
        FROM attendance a
        JOIN employees e ON a.employee_id = e.id
        WHERE a.date >= $1 AND a.date <= $2
        ORDER BY a.date DESC, e.name
      `, [startDate, endDate])
      
      data = result.rows
      title = 'Attendance Report'
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
      
      data = result.rows
      title = 'Expense Report'
    } else if (reportType === 'Employees') {
      const result = await pool.query(`
        SELECT 
          name,
          position,
          department,
          email,
          phone,
          hire_date,
          salary
        FROM employees
        ORDER BY name
      `)
      
      data = result.rows
      title = 'Employee Report'
    }

    // Generate PDF content (simplified text-based PDF)
    let pdfContent = `${title}\n`
    pdfContent += `Generated on: ${new Date().toLocaleString()}\n`
    pdfContent += `Date Range: ${startDate} to ${endDate}\n`
    pdfContent += `${'='.repeat(50)}\n\n`

    if (data.length === 0) {
      pdfContent += 'No data found for the selected criteria.\n'
    } else {
      if (reportType === 'Attendance') {
        pdfContent += 'Employee Name | Date | Check In | Check Out | Hours | Status\n'
        pdfContent += '-'.repeat(70) + '\n'
        data.forEach(record => {
          pdfContent += `${record.employee_name} | ${record.date} | ${record.check_in || 'N/A'} | ${record.check_out || 'N/A'} | ${record.hours_worked || 0} | ${record.status}\n`
        })
      } else if (reportType === 'Expenses') {
        pdfContent += 'Employee Name | Category | Description | Amount | Date | Status\n'
        pdfContent += '-'.repeat(70) + '\n'
        data.forEach(record => {
          pdfContent += `${record.employee_name} | ${record.category} | ${record.description} | ₹${record.amount} | ${record.date} | ${record.status}\n`
        })
      } else if (reportType === 'Employees') {
        pdfContent += 'Name | Position | Department | Email | Phone | Hire Date | Salary\n'
        pdfContent += '-'.repeat(70) + '\n'
        data.forEach(record => {
          pdfContent += `${record.name} | ${record.position} | ${record.department} | ${record.email} | ${record.phone} | ${record.hire_date} | ₹${record.salary}\n`
        })
      }
    }

    // Add summary
    pdfContent += `\n${'='.repeat(50)}\n`
    pdfContent += `Total Records: ${data.length}\n`
    pdfContent += `Report Generated: ${new Date().toLocaleString()}\n`

    const filename = `${reportType.toLowerCase().replace(' ', '_')}_report_${startDate}_to_${endDate}.txt`

    return NextResponse.json({
      success: true,
      pdfContent: pdfContent,
      filename: filename,
      message: 'Report generated successfully'
    })

  } catch (error) {
    console.error('Error generating PDF report:', error)
    return NextResponse.json(
      { error: 'Failed to generate report', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
