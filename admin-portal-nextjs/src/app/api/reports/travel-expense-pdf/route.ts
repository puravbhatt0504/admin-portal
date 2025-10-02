import { NextResponse } from 'next/server'
import pool from '@/lib/database'

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

    // Calculate totals
    const totalAmount = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0)
    const approvedAmount = expenses
      .filter(exp => exp.status === 'Approved')
      .reduce((sum, exp) => sum + parseFloat(exp.amount), 0)
    const pendingAmount = expenses
      .filter(exp => exp.status === 'Pending')
      .reduce((sum, exp) => sum + parseFloat(exp.amount), 0)

    // Calculate travel metrics
    const totalKilometers = expenses.reduce((sum, exp) => sum + (parseFloat(exp.kilometers) || 0), 0)
    const averageCostPerKm = totalKilometers > 0 ? totalAmount / totalKilometers : 0

    // Group by employee
    const employeeExpenses = expenses.reduce((acc, expense) => {
      if (!acc[expense.employee_name]) {
        acc[expense.employee_name] = []
      }
      acc[expense.employee_name].push(expense)
      return acc
    }, {} as Record<string, any[]>)

    // Group by travel category
    const taxiExpenses = expenses.filter(exp => exp.category === 'Taxi')
    const fuelExpenses = expenses.filter(exp => exp.category === 'Fuel')
    const tollExpenses = expenses.filter(exp => exp.category === 'Toll')
    const parkingExpenses = expenses.filter(exp => exp.category === 'Parking')
    const flightExpenses = expenses.filter(exp => exp.category === 'Flight')
    const hotelExpenses = expenses.filter(exp => exp.category === 'Hotel')
    const otherTravelExpenses = expenses.filter(exp => 
      !['Taxi', 'Fuel', 'Toll', 'Parking', 'Flight', 'Hotel'].includes(exp.category)
    )

    // Generate PDF content
    let pdfContent = `TRAVEL EXPENSES REPORT\n`
    pdfContent += `Generated on: ${new Date().toLocaleString()}\n`
    pdfContent += `Date Range: ${startDate} to ${endDate}\n`
    pdfContent += `${'='.repeat(60)}\n\n`

    // Summary Section
    pdfContent += `🚗 TRAVEL EXPENSES SUMMARY\n`
    pdfContent += `${'='.repeat(40)}\n`
    pdfContent += `Total Travel Expenses: ₹${totalAmount.toLocaleString()}\n`
    pdfContent += `Approved: ₹${approvedAmount.toLocaleString()}\n`
    pdfContent += `Pending: ₹${pendingAmount.toLocaleString()}\n`
    pdfContent += `Total Records: ${expenses.length}\n`
    pdfContent += `Total Distance: ${totalKilometers.toFixed(1)} km\n`
    pdfContent += `Average Cost/km: ₹${averageCostPerKm.toFixed(2)}\n\n`

    // Travel Category Breakdown
    pdfContent += `📋 TRAVEL CATEGORY BREAKDOWN\n`
    pdfContent += `${'='.repeat(40)}\n`
    pdfContent += `Taxi: ${taxiExpenses.length} records (₹${taxiExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0).toLocaleString()})\n`
    pdfContent += `Fuel: ${fuelExpenses.length} records (₹${fuelExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0).toLocaleString()})\n`
    pdfContent += `Toll: ${tollExpenses.length} records (₹${tollExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0).toLocaleString()})\n`
    pdfContent += `Parking: ${parkingExpenses.length} records (₹${parkingExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0).toLocaleString()})\n`
    pdfContent += `Flight: ${flightExpenses.length} records (₹${flightExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0).toLocaleString()})\n`
    pdfContent += `Hotel: ${hotelExpenses.length} records (₹${hotelExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0).toLocaleString()})\n`
    pdfContent += `Other: ${otherTravelExpenses.length} records (₹${otherTravelExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0).toLocaleString()})\n\n`

    // Employee Summary
    pdfContent += `👥 EMPLOYEE TRAVEL SUMMARY\n`
    pdfContent += `${'='.repeat(40)}\n`
    Object.entries(employeeExpenses).forEach(([employee, empExpenses]) => {
      const empTotal = empExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0)
      const empDistance = empExpenses.reduce((sum, exp) => sum + (parseFloat(exp.kilometers) || 0), 0)
      pdfContent += `${employee}: ₹${empTotal.toLocaleString()} (${empExpenses.length} trips, ${empDistance.toFixed(1)} km)\n`
    })
    pdfContent += `\n`

    // Taxi Expenses Table
    if (taxiExpenses.length > 0) {
      pdfContent += `🚕 TAXI EXPENSES\n`
      pdfContent += `${'='.repeat(50)}\n`
      pdfContent += `Employee | Description | Amount | Date | Distance | Receipt | Status\n`
      pdfContent += `-`.repeat(90) + `\n`
      taxiExpenses.forEach(expense => {
        pdfContent += `${expense.employee_name} | ${expense.description} | ₹${expense.amount} | ${expense.date} | ${expense.kilometers || '-'} km | ${expense.receipt_number || '-'} | ${expense.status}\n`
      })
      pdfContent += `\n`
    }

    // Fuel Expenses Table
    if (fuelExpenses.length > 0) {
      pdfContent += `⛽ FUEL EXPENSES\n`
      pdfContent += `${'='.repeat(50)}\n`
      pdfContent += `Employee | Description | Amount | Date | Distance | Receipt | Status\n`
      pdfContent += `-`.repeat(90) + `\n`
      fuelExpenses.forEach(expense => {
        pdfContent += `${expense.employee_name} | ${expense.description} | ₹${expense.amount} | ${expense.date} | ${expense.kilometers || '-'} km | ${expense.receipt_number || '-'} | ${expense.status}\n`
      })
      pdfContent += `\n`
    }

    // Flight Expenses Table
    if (flightExpenses.length > 0) {
      pdfContent += `✈️ FLIGHT EXPENSES\n`
      pdfContent += `${'='.repeat(50)}\n`
      pdfContent += `Employee | Description | Amount | Date | Receipt | Status\n`
      pdfContent += `-`.repeat(80) + `\n`
      flightExpenses.forEach(expense => {
        pdfContent += `${expense.employee_name} | ${expense.description} | ₹${expense.amount} | ${expense.date} | ${expense.receipt_number || '-'} | ${expense.status}\n`
      })
      pdfContent += `\n`
    }

    // Hotel Expenses Table
    if (hotelExpenses.length > 0) {
      pdfContent += `🏨 HOTEL EXPENSES\n`
      pdfContent += `${'='.repeat(50)}\n`
      pdfContent += `Employee | Description | Amount | Date | Receipt | Status\n`
      pdfContent += `-`.repeat(80) + `\n`
      hotelExpenses.forEach(expense => {
        pdfContent += `${expense.employee_name} | ${expense.description} | ₹${expense.amount} | ${expense.date} | ${expense.receipt_number || '-'} | ${expense.status}\n`
      })
      pdfContent += `\n`
    }

    // Other Travel Expenses Table
    if (otherTravelExpenses.length > 0) {
      pdfContent += `🚗 OTHER TRAVEL EXPENSES\n`
      pdfContent += `${'='.repeat(50)}\n`
      pdfContent += `Employee | Category | Description | Amount | Date | Distance | Receipt | Status\n`
      pdfContent += `-`.repeat(100) + `\n`
      otherTravelExpenses.forEach(expense => {
        pdfContent += `${expense.employee_name} | ${expense.category} | ${expense.description} | ₹${expense.amount} | ${expense.date} | ${expense.kilometers || '-'} km | ${expense.receipt_number || '-'} | ${expense.status}\n`
      })
      pdfContent += `\n`
    }

    // Detailed Employee Breakdown
    pdfContent += `\n📊 DETAILED EMPLOYEE TRAVEL BREAKDOWN\n`
    pdfContent += `${'='.repeat(50)}\n\n`

    Object.entries(employeeExpenses).forEach(([employee, empExpenses]) => {
      const empTotal = empExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0)
      const empDistance = empExpenses.reduce((sum, exp) => sum + (parseFloat(exp.kilometers) || 0), 0)
      const empCostPerKm = empDistance > 0 ? empTotal / empDistance : 0
      
      pdfContent += `👤 ${employee.toUpperCase()}\n`
      pdfContent += `Total: ₹${empTotal.toLocaleString()}\n`
      pdfContent += `Distance: ${empDistance.toFixed(1)} km\n`
      pdfContent += `Cost/km: ₹${empCostPerKm.toFixed(2)}\n`
      pdfContent += `-`.repeat(40) + `\n`
      
      // Group by category for this employee
      const empTaxi = empExpenses.filter(exp => exp.category === 'Taxi')
      const empFuel = empExpenses.filter(exp => exp.category === 'Fuel')
      const empFlight = empExpenses.filter(exp => exp.category === 'Flight')
      const empHotel = empExpenses.filter(exp => exp.category === 'Hotel')
      const empOther = empExpenses.filter(exp => 
        !['Taxi', 'Fuel', 'Flight', 'Hotel'].includes(exp.category)
      )
      
      if (empTaxi.length > 0) {
        pdfContent += `Taxi Expenses:\n`
        empTaxi.forEach(expense => {
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
      
      if (empFuel.length > 0) {
        pdfContent += `Fuel Expenses:\n`
        empFuel.forEach(expense => {
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
      
      if (empFlight.length > 0) {
        pdfContent += `Flight Expenses:\n`
        empFlight.forEach(expense => {
          pdfContent += `  • ${expense.description} - ₹${expense.amount} (${expense.date})\n`
          if (expense.receipt_number) {
            pdfContent += `    Receipt: ${expense.receipt_number}\n`
          }
          pdfContent += `    Status: ${expense.status}\n\n`
        })
      }
      
      if (empHotel.length > 0) {
        pdfContent += `Hotel Expenses:\n`
        empHotel.forEach(expense => {
          pdfContent += `  • ${expense.description} - ₹${expense.amount} (${expense.date})\n`
          if (expense.receipt_number) {
            pdfContent += `    Receipt: ${expense.receipt_number}\n`
          }
          pdfContent += `    Status: ${expense.status}\n\n`
        })
      }
      
      if (empOther.length > 0) {
        pdfContent += `Other Travel Expenses:\n`
        empOther.forEach(expense => {
          pdfContent += `  • ${expense.category}: ${expense.description} - ₹${expense.amount} (${expense.date})\n`
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
    pdfContent += `Total Distance: ${totalKilometers.toFixed(1)} km\n`
    pdfContent += `Average Cost/km: ₹${averageCostPerKm.toFixed(2)}\n`

    const filename = `travel_expenses_report_${startDate}_to_${endDate}.txt`

    return NextResponse.json({
      success: true,
      pdfContent: pdfContent,
      filename: filename,
      message: 'Travel expenses report generated successfully',
      summary: {
        totalAmount,
        approvedAmount,
        pendingAmount,
        totalRecords: expenses.length,
        totalKilometers,
        averageCostPerKm,
        employeeCount: Object.keys(employeeExpenses).length,
        taxiCount: taxiExpenses.length,
        fuelCount: fuelExpenses.length,
        flightCount: flightExpenses.length,
        hotelCount: hotelExpenses.length
      }
    })

  } catch (error) {
    console.error('Error generating travel expenses report:', error)
    return NextResponse.json(
      { error: 'Failed to generate travel expenses report', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
