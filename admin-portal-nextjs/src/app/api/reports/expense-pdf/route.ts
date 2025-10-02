import { NextResponse } from 'next/server'
import pool from '@/lib/database'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('start_date') || '2025-01-01'
    const endDate = searchParams.get('end_date') || '2025-01-31'

    // Get all expenses in date range
    const expensesResult = await pool.query(`
      SELECT 
        e.id,
        emp.name as employee_name,
        e.category,
        e.description,
        e.amount,
        e.date,
        e.status,
        e.kilometers,
        e.expense_type,
        e.receipt_number,
        e.notes
      FROM expenses e
      JOIN employees emp ON e.employee_id = emp.id
      WHERE e.date >= $1 AND e.date <= $2
      ORDER BY e.date DESC, emp.name
    `, [startDate, endDate])

    const expenses = expensesResult.rows

    // Calculate totals
    const totalAmount = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0)
    const approvedAmount = expenses
      .filter(exp => exp.status === 'Approved')
      .reduce((sum, exp) => sum + parseFloat(exp.amount), 0)
    const pendingAmount = expenses
      .filter(exp => exp.status === 'Pending')
      .reduce((sum, exp) => sum + parseFloat(exp.amount), 0)

    // Group by employee
    const employeeExpenses = expenses.reduce((acc, expense) => {
      if (!acc[expense.employee_name]) {
        acc[expense.employee_name] = []
      }
      acc[expense.employee_name].push(expense)
      return acc
    }, {} as Record<string, any[]>)

    // Group by expense type
    const generalExpenses = expenses.filter(exp => exp.expense_type === 'General' || !exp.expense_type)
    const travelExpenses = expenses.filter(exp => exp.expense_type === 'Travel')

    // Generate PDF content
    let pdfContent = `EXPENSE REPORT SUMMARY\n`
    pdfContent += `Generated on: ${new Date().toLocaleString()}\n`
    pdfContent += `Date Range: ${startDate} to ${endDate}\n`
    pdfContent += `${'='.repeat(60)}\n\n`

    // Summary Section
    pdfContent += `📊 EXPENSE SUMMARY\n`
    pdfContent += `${'='.repeat(30)}\n`
    pdfContent += `Total Expenses: ₹${totalAmount.toLocaleString()}\n`
    pdfContent += `Approved: ₹${approvedAmount.toLocaleString()}\n`
    pdfContent += `Pending: ₹${pendingAmount.toLocaleString()}\n`
    pdfContent += `Total Records: ${expenses.length}\n\n`

    // Employee Summary
    pdfContent += `👥 EMPLOYEE EXPENSE SUMMARY\n`
    pdfContent += `${'='.repeat(40)}\n`
    Object.entries(employeeExpenses).forEach(([employee, empExpenses]) => {
      const empTotal = empExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0)
      pdfContent += `${employee}: ₹${empTotal.toLocaleString()} (${empExpenses.length} expenses)\n`
    })
    pdfContent += `\n`

    // General Expenses Table
    if (generalExpenses.length > 0) {
      pdfContent += `📋 GENERAL EXPENSES\n`
      pdfContent += `${'='.repeat(50)}\n`
      pdfContent += `Employee | Category | Description | Amount | Date | Status\n`
      pdfContent += `-`.repeat(80) + `\n`
      generalExpenses.forEach(expense => {
        pdfContent += `${expense.employee_name} | ${expense.category} | ${expense.description} | ₹${expense.amount} | ${expense.date} | ${expense.status}\n`
      })
      pdfContent += `\n`
    }

    // Travel Expenses Table
    if (travelExpenses.length > 0) {
      pdfContent += `🚗 TRAVEL EXPENSES\n`
      pdfContent += `${'='.repeat(50)}\n`
      pdfContent += `Employee | Description | Amount | Date | KM | Receipt | Status\n`
      pdfContent += `-`.repeat(80) + `\n`
      travelExpenses.forEach(expense => {
        pdfContent += `${expense.employee_name} | ${expense.description} | ₹${expense.amount} | ${expense.date} | ${expense.kilometers || '-'} | ${expense.receipt_number || '-'} | ${expense.status}\n`
      })
      pdfContent += `\n`
    }

    // Detailed Employee Breakdown
    pdfContent += `\n📊 DETAILED EMPLOYEE BREAKDOWN\n`
    pdfContent += `${'='.repeat(50)}\n\n`

    Object.entries(employeeExpenses).forEach(([employee, empExpenses]) => {
      const empTotal = empExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0)
      
      pdfContent += `👤 ${employee.toUpperCase()}\n`
      pdfContent += `Total: ₹${empTotal.toLocaleString()}\n`
      pdfContent += `-`.repeat(40) + `\n`
      
      // Group by expense type for this employee
      const empGeneral = empExpenses.filter(exp => exp.expense_type === 'General' || !exp.expense_type)
      const empTravel = empExpenses.filter(exp => exp.expense_type === 'Travel')
      
      if (empGeneral.length > 0) {
        pdfContent += `General Expenses:\n`
        empGeneral.forEach(expense => {
          pdfContent += `  • ${expense.description} - ₹${expense.amount} (${expense.date}) [${expense.status}]\n`
        })
        pdfContent += `\n`
      }
      
      if (empTravel.length > 0) {
        pdfContent += `Travel Expenses:\n`
        empTravel.forEach(expense => {
          pdfContent += `  • ${expense.description} - ₹${expense.amount} (${expense.date})\n`
          if (expense.kilometers) {
            pdfContent += `    Distance: ${expense.kilometers} km\n`
          }
          if (expense.receipt_number) {
            pdfContent += `    Receipt: ${expense.receipt_number}\n`
          }
          pdfContent += `    Status: ${expense.status}\n\n`
        })
      }
      
      pdfContent += `\n`
    })

    // Footer
    pdfContent += `\n${'='.repeat(60)}\n`
    pdfContent += `Report Generated: ${new Date().toLocaleString()}\n`
    pdfContent += `Total Records: ${expenses.length}\n`
    pdfContent += `Total Amount: ₹${totalAmount.toLocaleString()}\n`

    const filename = `expense_report_detailed_${startDate}_to_${endDate}.txt`

    return NextResponse.json({
      success: true,
      pdfContent: pdfContent,
      filename: filename,
      message: 'Detailed expense report generated successfully',
      summary: {
        totalAmount,
        approvedAmount,
        pendingAmount,
        totalRecords: expenses.length,
        employeeCount: Object.keys(employeeExpenses).length
      }
    })

  } catch (error) {
    console.error('Error generating detailed expense report:', error)
    return NextResponse.json(
      { error: 'Failed to generate detailed expense report', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
