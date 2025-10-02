import { NextResponse } from 'next/server'
import pool from '@/lib/database'
import { PDFService } from '@/lib/pdfService'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('start_date') || '2025-01-01'
    const endDate = searchParams.get('end_date') || '2025-01-31'

    // Get only travel expenses in date range
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
          COALESCE(e.odometer_start, 0) as odometer_start,
          COALESCE(e.odometer_end, 0) as odometer_end,
          COALESCE(e.expense_type, 'General') as expense_type,
          COALESCE(e.receipt_number, '') as receipt_number,
          COALESCE(e.notes, '') as notes
        FROM expenses e
        JOIN employees emp ON e.employee_id = emp.id
        WHERE e.date >= $1 AND e.date <= $2
        AND (e.expense_type = 'Travel' OR 
             e.category IN ('Taxi', 'Fuel', 'Toll', 'Parking', 'Flight', 'Hotel', 'Travel', 'Transport') OR
             e.description ILIKE '%taxi%' OR e.description ILIKE '%fuel%' OR e.description ILIKE '%toll%' OR
             e.description ILIKE '%parking%' OR e.description ILIKE '%flight%' OR e.description ILIKE '%hotel%' OR
             e.description ILIKE '%travel%' OR e.description ILIKE '%transport%' OR e.description ILIKE '%uber%' OR
             e.description ILIKE '%ola%' OR e.description ILIKE '%metro%' OR e.description ILIKE '%bus%' OR
             e.description ILIKE '%cab%' OR e.description ILIKE '%ride%')
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
        AND (e.category IN ('Taxi', 'Fuel', 'Toll', 'Parking', 'Flight', 'Hotel', 'Travel', 'Transport') OR
             e.description ILIKE '%taxi%' OR e.description ILIKE '%fuel%' OR e.description ILIKE '%toll%' OR
             e.description ILIKE '%parking%' OR e.description ILIKE '%flight%' OR e.description ILIKE '%hotel%' OR
             e.description ILIKE '%travel%' OR e.description ILIKE '%transport%' OR e.description ILIKE '%uber%' OR
             e.description ILIKE '%ola%' OR e.description ILIKE '%metro%' OR e.description ILIKE '%bus%' OR
             e.description ILIKE '%cab%' OR e.description ILIKE '%ride%')
        ORDER BY e.date DESC, emp.name
      `, [startDate, endDate])
      
      // Add default values for missing columns
      expensesResult.rows = expensesResult.rows.map((row: Record<string, unknown>) => ({
        ...row,
        kilometers: 0,
        expense_type: 'Travel',
        receipt_number: '',
        notes: ''
      }))
    }

    const expenses = expensesResult.rows

    // Generate HTML report
    const htmlContent = PDFService.generateTravelExpenseReport(expenses, startDate, endDate)
    
    return new NextResponse(htmlContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
      }
    })
  } catch (error) {
    console.error('Error generating travel expense report:', error)
    return NextResponse.json(
      { error: 'Failed to generate travel expense report', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}