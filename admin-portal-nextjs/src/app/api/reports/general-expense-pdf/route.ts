import { NextResponse } from 'next/server'
import pool from '@/lib/database'
import { PDFService } from '@/lib/pdfService'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('start_date') || '2025-01-01'
    const endDate = searchParams.get('end_date') || '2025-01-31'

    // Get only general expenses (non-travel) in date range
    let expensesResult;
    try {
      expensesResult = await pool.query(`
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
        WHERE e.date >= $1 AND e.date <= $2
        AND (e.expense_type != 'Travel' OR e.expense_type IS NULL)
        ORDER BY e.date DESC, emp.name
      `, [startDate, endDate])
    } catch {
      // Fallback to basic query if new columns don't exist
      expensesResult = await pool.query(`
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
        WHERE e.date >= $1 AND e.date <= $2
        ORDER BY e.date DESC, emp.name
      `, [startDate, endDate])
      
      // Add default values for missing columns
      expensesResult.rows = expensesResult.rows.map((row: Record<string, unknown>) => ({
        ...row,
        kilometers: 0,
        expense_type: 'General',
        receipt_number: '',
        notes: ''
      }))
    }

    const expenses = expensesResult.rows

    // Generate PDF using PDFMake
    const pdfBuffer = PDFService.generateGeneralExpenseReport(expenses, startDate, endDate)
    
    const filename = `general_expense_report_${startDate}_to_${endDate}.pdf`

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString()
      }
    })
  } catch (error) {
    console.error('Error generating general expense report:', error)
    return NextResponse.json(
      { error: 'Failed to generate general expense report', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}