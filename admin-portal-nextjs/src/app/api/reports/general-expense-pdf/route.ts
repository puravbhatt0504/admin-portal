import { NextResponse } from 'next/server'
import pool from '@/lib/database'

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
    } catch (error) {
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
      expensesResult.rows = expensesResult.rows.map((row: any) => ({
        ...row,
        kilometers: 0,
        expense_type: 'General',
        receipt_number: '',
        notes: ''
      }))
    }

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
    const foodExpenses = expenses.filter(exp => exp.expense_type === 'Food')
    const officeExpenses = expenses.filter(exp => exp.expense_type === 'Office')

    // Generate PDF content
    let pdfContent = `GENERAL EXPENSES REPORT\n`
    pdfContent += `Generated on: ${new Date().toLocaleString()}\n`
    pdfContent += `Date Range: ${startDate} to ${endDate}\n`
    pdfContent += `${'='.repeat(60)}\n\n`

    // Summary Section
    pdfContent += `📊 GENERAL EXPENSES SUMMARY\n`
    pdfContent += `${'='.repeat(40)}\n`
    pdfContent += `Total General Expenses: ₹${totalAmount.toLocaleString()}\n`
    pdfContent += `Approved: ₹${approvedAmount.toLocaleString()}\n`
    pdfContent += `Pending: ₹${pendingAmount.toLocaleString()}\n`
    pdfContent += `Total Records: ${expenses.length}\n\n`

    // Expense Type Breakdown
    pdfContent += `📋 EXPENSE TYPE BREAKDOWN\n`
    pdfContent += `${'='.repeat(40)}\n`
    pdfContent += `General: ${generalExpenses.length} records (₹${generalExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0).toLocaleString()})\n`
    pdfContent += `Food: ${foodExpenses.length} records (₹${foodExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0).toLocaleString()})\n`
    pdfContent += `Office: ${officeExpenses.length} records (₹${officeExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0).toLocaleString()})\n\n`

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

    // Food Expenses Table
    if (foodExpenses.length > 0) {
      pdfContent += `🍽️ FOOD EXPENSES\n`
      pdfContent += `${'='.repeat(50)}\n`
      pdfContent += `Employee | Category | Description | Amount | Date | Status\n`
      pdfContent += `-`.repeat(80) + `\n`
      foodExpenses.forEach(expense => {
        pdfContent += `${expense.employee_name} | ${expense.category} | ${expense.description} | ₹${expense.amount} | ${expense.date} | ${expense.status}\n`
      })
      pdfContent += `\n`
    }

    // Office Expenses Table
    if (officeExpenses.length > 0) {
      pdfContent += `🏢 OFFICE EXPENSES\n`
      pdfContent += `${'='.repeat(50)}\n`
      pdfContent += `Employee | Category | Description | Amount | Date | Status\n`
      pdfContent += `-`.repeat(80) + `\n`
      officeExpenses.forEach(expense => {
        pdfContent += `${expense.employee_name} | ${expense.category} | ${expense.description} | ₹${expense.amount} | ${expense.date} | ${expense.status}\n`
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
      const empFood = empExpenses.filter(exp => exp.expense_type === 'Food')
      const empOffice = empExpenses.filter(exp => exp.expense_type === 'Office')
      
      if (empGeneral.length > 0) {
        pdfContent += `General Expenses:\n`
        empGeneral.forEach(expense => {
          pdfContent += `  • ${expense.description} - ₹${expense.amount} (${expense.date}) [${expense.status}]\n`
          if (expense.receipt_number) {
            pdfContent += `    Receipt: ${expense.receipt_number}\n`
          }
          if (expense.notes) {
            pdfContent += `    Notes: ${expense.notes}\n`
          }
        })
        pdfContent += `\n`
      }
      
      if (empFood.length > 0) {
        pdfContent += `Food Expenses:\n`
        empFood.forEach(expense => {
          pdfContent += `  • ${expense.description} - ₹${expense.amount} (${expense.date}) [${expense.status}]\n`
          if (expense.receipt_number) {
            pdfContent += `    Receipt: ${expense.receipt_number}\n`
          }
          if (expense.notes) {
            pdfContent += `    Notes: ${expense.notes}\n`
          }
        })
        pdfContent += `\n`
      }
      
      if (empOffice.length > 0) {
        pdfContent += `Office Expenses:\n`
        empOffice.forEach(expense => {
          pdfContent += `  • ${expense.description} - ₹${expense.amount} (${expense.date}) [${expense.status}]\n`
          if (expense.receipt_number) {
            pdfContent += `    Receipt: ${expense.receipt_number}\n`
          }
          if (expense.notes) {
            pdfContent += `    Notes: ${expense.notes}\n`
          }
        })
        pdfContent += `\n`
      }
      
      pdfContent += `\n`
    })

    // Footer
    pdfContent += `\n${'='.repeat(60)}\n`
    pdfContent += `Report Generated: ${new Date().toLocaleString()}\n`
    pdfContent += `Total Records: ${expenses.length}\n`
    pdfContent += `Total Amount: ₹${totalAmount.toLocaleString()}\n`

    const filename = `general_expenses_report_${startDate}_to_${endDate}.txt`

    return NextResponse.json({
      success: true,
      pdfContent: pdfContent,
      filename: filename,
      message: 'General expenses report generated successfully',
      summary: {
        totalAmount,
        approvedAmount,
        pendingAmount,
        totalRecords: expenses.length,
        employeeCount: Object.keys(employeeExpenses).length,
        generalCount: generalExpenses.length,
        foodCount: foodExpenses.length,
        officeCount: officeExpenses.length
      }
    })

  } catch (error) {
    console.error('Error generating general expenses report:', error)
    return NextResponse.json(
      { error: 'Failed to generate general expenses report', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
