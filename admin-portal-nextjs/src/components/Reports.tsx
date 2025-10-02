'use client'

import { useState } from 'react'

export default function Reports() {
  const [reportType, setReportType] = useState('Attendance')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [loading, setLoading] = useState(false)

  const generateReport = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/reports/pdf?type=${reportType}&start_date=${startDate}&end_date=${endDate}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()

      if (result.success && result.pdfContent) {
        // Generate actual PDF using jsPDF
        const { jsPDF } = await import('jspdf')
        const doc = new jsPDF()
        
        // Set font
        doc.setFont('helvetica')
        
        // Split content into pages
        const lines = result.pdfContent.split('\n')
        const pageHeight = 280
        let yPosition = 20
        
        lines.forEach((line) => {
          if (yPosition > pageHeight) {
            doc.addPage()
            yPosition = 20
          }
          
          // Handle different line types
          if (line.includes('=')) {
            // Header lines
            doc.setFontSize(16)
            doc.setFont('helvetica', 'bold')
            doc.text(line, 20, yPosition)
            yPosition += 10
          } else if (line.includes('📊') || line.includes('👥') || line.includes('📋')) {
            // Section headers
            doc.setFontSize(14)
            doc.setFont('helvetica', 'bold')
            doc.text(line, 20, yPosition)
            yPosition += 8
          } else if (line.includes('•')) {
            // List items
            doc.setFontSize(10)
            doc.setFont('helvetica', 'normal')
            doc.text(line, 25, yPosition)
            yPosition += 6
          } else if (line.includes('|')) {
            // Table rows
            doc.setFontSize(8)
            doc.setFont('helvetica', 'normal')
            doc.text(line, 20, yPosition)
            yPosition += 5
          } else if (line.trim() === '') {
            // Empty lines
            yPosition += 4
          } else {
            // Regular text
            doc.setFontSize(10)
            doc.setFont('helvetica', 'normal')
            doc.text(line, 20, yPosition)
            yPosition += 6
          }
        })
        
        // Download the PDF
        doc.save(`${reportType}_report_${startDate}_to_${endDate}.pdf`)
      } else {
        throw new Error(result.error || 'Failed to generate report')
      }
    } catch (error) {
      console.error('Error generating report:', error)
      alert('Failed to generate report. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const generateDetailedExpenseReport = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/reports/expense-pdf?start_date=${startDate}&end_date=${endDate}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()

      if (result.success && result.pdfContent) {
        // Generate actual PDF using jsPDF
        const { jsPDF } = await import('jspdf')
        const doc = new jsPDF()
        
        // Set font
        doc.setFont('helvetica')
        
        // Parse the data from the API response
        const data = result.summary
        
        // Title Page
        doc.setFontSize(20)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(0, 100, 0) // Green color
        doc.text('EXPENSE REPORT SUMMARY', 20, 30)
        
        doc.setFontSize(12)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(0, 0, 0) // Black color
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 45)
        doc.text(`Date Range: ${startDate} to ${endDate}`, 20, 55)
        
        // Summary Section with colored boxes
        doc.setFontSize(16)
        doc.setFont('helvetica', 'bold')
        doc.text('📊 EXPENSE SUMMARY', 20, 75)
        
        // Create colored summary boxes
        const summaryY = 85
        const boxWidth = 50
        const boxHeight = 25
        
        // Total Expenses Box (Green)
        doc.setFillColor(0, 150, 0)
        doc.rect(20, summaryY, boxWidth, boxHeight, 'F')
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(10)
        doc.text('TOTAL EXPENSES', 25, summaryY + 8)
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text(`₹${data.totalAmount.toLocaleString()}`, 25, summaryY + 18)
        
        // Approved Box (Blue)
        doc.setFillColor(0, 100, 200)
        doc.rect(80, summaryY, boxWidth, boxHeight, 'F')
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(10)
        doc.text('APPROVED', 85, summaryY + 8)
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text(`₹${data.approvedAmount.toLocaleString()}`, 85, summaryY + 18)
        
        // Pending Box (Orange)
        doc.setFillColor(255, 140, 0)
        doc.rect(140, summaryY, boxWidth, boxHeight, 'F')
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(10)
        doc.text('PENDING', 145, summaryY + 8)
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text(`₹${data.pendingAmount.toLocaleString()}`, 145, summaryY + 18)
        
        // Records Box (Purple)
        doc.setFillColor(150, 0, 150)
        doc.rect(200, summaryY, boxWidth, boxHeight, 'F')
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(10)
        doc.text('RECORDS', 205, summaryY + 8)
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text(`${data.totalRecords}`, 205, summaryY + 18)
        
        // Reset text color
        doc.setTextColor(0, 0, 0)
        
        // Employee Summary Table
        let currentY = summaryY + 40
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text('👥 EMPLOYEE EXPENSE SUMMARY', 20, currentY)
        
        currentY += 15
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        
        // Create employee summary table
        const employeeData = result.employeeExpenses || {}
        const tableHeaders = ['Employee', 'Total Amount', 'Expenses Count']
        const colWidths = [80, 60, 40]
        const startX = 20
        
        // Table header
        doc.setFillColor(240, 240, 240)
        doc.rect(startX, currentY - 5, colWidths[0] + colWidths[1] + colWidths[2], 10, 'F')
        doc.setFont('helvetica', 'bold')
        doc.text(tableHeaders[0], startX + 2, currentY + 2)
        doc.text(tableHeaders[1], startX + colWidths[0] + 2, currentY + 2)
        doc.text(tableHeaders[2], startX + colWidths[0] + colWidths[1] + 2, currentY + 2)
        
        currentY += 10
        doc.setFont('helvetica', 'normal')
        
        // Employee rows
        Object.entries(employeeData).forEach(([employee, expenses]) => {
          if (currentY > 270) {
            doc.addPage()
            currentY = 20
          }
          
          const empTotal = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0)
          doc.text(employee, startX + 2, currentY + 2)
          doc.setTextColor(0, 150, 0) // Green for amounts
          doc.text(`₹${empTotal.toLocaleString()}`, startX + colWidths[0] + 2, currentY + 2)
          doc.setTextColor(0, 0, 0) // Reset to black
          doc.text(expenses.length.toString(), startX + colWidths[0] + colWidths[1] + 2, currentY + 2)
          currentY += 8
        })
        
        // Add new page for detailed breakdown
        doc.addPage()
        currentY = 20
        
        // Detailed breakdown
        doc.setFontSize(16)
        doc.setFont('helvetica', 'bold')
        doc.text('📊 DETAILED BREAKDOWN', 20, currentY)
        currentY += 20
        
        // Process each employee
        Object.entries(employeeData).forEach(([employee, expenses]) => {
          if (currentY > 200) {
            doc.addPage()
            currentY = 20
          }
          
          const empTotal = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0)
          
          // Employee header
          doc.setFontSize(12)
          doc.setFont('helvetica', 'bold')
          doc.setTextColor(0, 100, 200) // Blue for employee names
          doc.text(`👤 ${employee.toUpperCase()}`, 20, currentY)
          currentY += 10
          
          doc.setFontSize(10)
          doc.setTextColor(0, 150, 0) // Green for total
          doc.text(`Total: ₹${empTotal.toLocaleString()}`, 20, currentY)
          currentY += 15
          
          // Group by expense type
          const generalExpenses = expenses.filter(exp => exp.expense_type === 'General' || !exp.expense_type)
          const travelExpenses = expenses.filter(exp => exp.expense_type === 'Travel')
          
          // General expenses
          if (generalExpenses.length > 0) {
            doc.setFont('helvetica', 'bold')
            doc.setTextColor(0, 0, 0)
            doc.text('General Expenses:', 20, currentY)
            currentY += 8
            
            doc.setFont('helvetica', 'normal')
            generalExpenses.forEach(expense => {
              if (currentY > 270) {
                doc.addPage()
                currentY = 20
              }
              doc.text(`• ${expense.description} - ₹${expense.amount} (${new Date(expense.date).toLocaleDateString()}) [${expense.status}]`, 25, currentY)
              currentY += 6
            })
            currentY += 5
          }
          
          // Travel expenses
          if (travelExpenses.length > 0) {
            doc.setFont('helvetica', 'bold')
            doc.setTextColor(0, 0, 0)
            doc.text('Travel Expenses:', 20, currentY)
            currentY += 8
            
            doc.setFont('helvetica', 'normal')
            travelExpenses.forEach(expense => {
              if (currentY > 270) {
                doc.addPage()
                currentY = 20
              }
              doc.text(`• ${expense.description} - ₹${expense.amount} (${new Date(expense.date).toLocaleDateString()})`, 25, currentY)
              if (expense.kilometers && expense.kilometers > 0) {
                doc.text(`  Distance: ${expense.kilometers} km`, 30, currentY + 4)
                currentY += 4
              }
              if (expense.receipt_number) {
                doc.text(`  Receipt: ${expense.receipt_number}`, 30, currentY + 4)
                currentY += 4
              }
              doc.text(`  Status: ${expense.status}`, 30, currentY + 4)
              currentY += 8
            })
            currentY += 10
          }
        })
        
        // Download the PDF
        doc.save(`detailed_expense_report_${startDate}_to_${endDate}.pdf`)
        
        // Show summary in alert
        if (result.summary) {
          alert(`PDF Report Generated!\n\nTotal Amount: ₹${result.summary.totalAmount.toLocaleString()}\nApproved: ₹${result.summary.approvedAmount.toLocaleString()}\nPending: ₹${result.summary.pendingAmount.toLocaleString()}\nRecords: ${result.summary.totalRecords}`)
        }
      } else {
        throw new Error(result.error || 'Failed to generate detailed expense report')
      }
    } catch (error) {
      console.error('Error generating detailed expense report:', error)
      alert('Failed to generate detailed expense report. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const generateGeneralExpenseReport = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/reports/general-expense-pdf?start_date=${startDate}&end_date=${endDate}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()

      if (result.success && result.pdfContent) {
        // Generate actual PDF using jsPDF
        const { jsPDF } = await import('jspdf')
        const doc = new jsPDF()
        
        // Set font
        doc.setFont('helvetica')
        
        // Split content into pages
        const lines = result.pdfContent.split('\n')
        const pageHeight = 280
        let yPosition = 20
        
        lines.forEach((line) => {
          if (yPosition > pageHeight) {
            doc.addPage()
            yPosition = 20
          }
          
          // Handle different line types
          if (line.includes('=')) {
            // Header lines
            doc.setFontSize(16)
            doc.setFont('helvetica', 'bold')
            doc.text(line, 20, yPosition)
            yPosition += 10
          } else if (line.includes('📊') || line.includes('👥') || line.includes('📋')) {
            // Section headers
            doc.setFontSize(14)
            doc.setFont('helvetica', 'bold')
            doc.text(line, 20, yPosition)
            yPosition += 8
          } else if (line.includes('•')) {
            // List items
            doc.setFontSize(10)
            doc.setFont('helvetica', 'normal')
            doc.text(line, 25, yPosition)
            yPosition += 6
          } else if (line.includes('|')) {
            // Table rows
            doc.setFontSize(8)
            doc.setFont('helvetica', 'normal')
            doc.text(line, 20, yPosition)
            yPosition += 5
          } else if (line.trim() === '') {
            // Empty lines
            yPosition += 4
          } else {
            // Regular text
            doc.setFontSize(10)
            doc.setFont('helvetica', 'normal')
            doc.text(line, 20, yPosition)
            yPosition += 6
          }
        })
        
        // Download the PDF
        doc.save(`general_expense_report_${startDate}_to_${endDate}.pdf`)
        
        // Show summary in alert
        if (result.summary) {
          alert(`PDF Report Generated!\n\nTotal Amount: ₹${result.summary.totalAmount.toLocaleString()}\nApproved: ₹${result.summary.approvedAmount.toLocaleString()}\nPending: ₹${result.summary.pendingAmount.toLocaleString()}\nRecords: ${result.summary.totalRecords}\n\nBreakdown:\nGeneral: ${result.summary.generalCount}\nFood: ${result.summary.foodCount}\nOffice: ${result.summary.officeCount}`)
        }
      } else {
        throw new Error(result.error || 'Failed to generate general expense report')
      }
    } catch (error) {
      console.error('Error generating general expense report:', error)
      alert('Failed to generate general expense report. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const generateTravelExpenseReport = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/reports/travel-expense-pdf?start_date=${startDate}&end_date=${endDate}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()

      if (result.success && result.pdfContent) {
        // Generate actual PDF using jsPDF
        const { jsPDF } = await import('jspdf')
        const doc = new jsPDF()
        
        // Set font
        doc.setFont('helvetica')
        
        // Split content into pages
        const lines = result.pdfContent.split('\n')
        const pageHeight = 280
        let yPosition = 20
        
        lines.forEach((line) => {
          if (yPosition > pageHeight) {
            doc.addPage()
            yPosition = 20
          }
          
          // Handle different line types
          if (line.includes('=')) {
            // Header lines
            doc.setFontSize(16)
            doc.setFont('helvetica', 'bold')
            doc.text(line, 20, yPosition)
            yPosition += 10
          } else if (line.includes('📊') || line.includes('👥') || line.includes('📋')) {
            // Section headers
            doc.setFontSize(14)
            doc.setFont('helvetica', 'bold')
            doc.text(line, 20, yPosition)
            yPosition += 8
          } else if (line.includes('•')) {
            // List items
            doc.setFontSize(10)
            doc.setFont('helvetica', 'normal')
            doc.text(line, 25, yPosition)
            yPosition += 6
          } else if (line.includes('|')) {
            // Table rows
            doc.setFontSize(8)
            doc.setFont('helvetica', 'normal')
            doc.text(line, 20, yPosition)
            yPosition += 5
          } else if (line.trim() === '') {
            // Empty lines
            yPosition += 4
          } else {
            // Regular text
            doc.setFontSize(10)
            doc.setFont('helvetica', 'normal')
            doc.text(line, 20, yPosition)
            yPosition += 6
          }
        })
        
        // Download the PDF
        doc.save(`travel_expense_report_${startDate}_to_${endDate}.pdf`)
        
        // Show summary in alert
        if (result.summary) {
          alert(`PDF Report Generated!\n\nTotal Amount: ₹${result.summary.totalAmount.toLocaleString()}\nApproved: ₹${result.summary.approvedAmount.toLocaleString()}\nPending: ₹${result.summary.pendingAmount.toLocaleString()}\nRecords: ${result.summary.totalRecords}\nDistance: ${result.summary.totalKilometers.toFixed(1)} km\nAvg Cost/km: ₹${result.summary.averageCostPerKm.toFixed(2)}\n\nBreakdown:\nTaxi: ${result.summary.taxiCount}\nFuel: ${result.summary.fuelCount}\nFlight: ${result.summary.flightCount}\nHotel: ${result.summary.hotelCount}`)
        }
      } else {
        throw new Error(result.error || 'Failed to generate travel expense report')
      }
    } catch (error) {
      console.error('Error generating travel expense report:', error)
      alert('Failed to generate travel expense report. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const generateQuickReport = async (type: string) => {
    setLoading(true)
    try {
      let startDate, endDate
      const today = new Date()
      
      switch (type) {
        case 'today':
          startDate = endDate = today.toISOString().split('T')[0]
          break
        case 'week':
          const weekStart = new Date(today)
          weekStart.setDate(today.getDate() - today.getDay())
          startDate = weekStart.toISOString().split('T')[0]
          endDate = today.toISOString().split('T')[0]
          break
        case 'month':
          const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
          startDate = monthStart.toISOString().split('T')[0]
          endDate = today.toISOString().split('T')[0]
          break
        default:
          startDate = endDate = today.toISOString().split('T')[0]
      }

      const response = await fetch(`/api/reports/pdf?type=${reportType}&start_date=${startDate}&end_date=${endDate}`)
      const result = await response.json()

      if (result.success && result.pdfContent) {
        const blob = new Blob([result.pdfContent], { type: 'application/pdf' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = result.filename || 'report.pdf'
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        throw new Error(result.error || 'Failed to generate report')
      }
    } catch (error) {
      console.error('Error generating quick report:', error)
      alert('Failed to generate report. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="h2 mb-4">Reports</h1>

      <div className="row">
        {/* Quick Reports */}
        <div className="col-lg-6 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Quick Reports</h5>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                <button
                  className="btn btn-primary"
                  onClick={() => generateQuickReport('today')}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Generating...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-calendar-day me-2"></i>
                      Today
                    </>
                  )}
                </button>
                <button
                  className="btn btn-success"
                  onClick={() => generateQuickReport('week')}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Generating...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-calendar-week me-2"></i>
                      This Week
                    </>
                  )}
                </button>
                <button
                  className="btn btn-info"
                  onClick={() => generateQuickReport('month')}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Generating...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-calendar-month me-2"></i>
                      This Month
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Expense Report */}
        <div className="col-lg-6 mb-4">
          <div className="card border-success">
            <div className="card-header bg-success text-white">
              <h5 className="card-title mb-0">
                <i className="bi bi-file-earmark-bar-graph me-2"></i>
                Detailed Expense Report
              </h5>
            </div>
            <div className="card-body">
              <p className="text-muted mb-3">
                Generate comprehensive expense reports with:
              </p>
              <ul className="list-unstyled mb-3">
                <li><i className="bi bi-check-circle text-success me-2"></i>Total expenses summary (highlighted in green)</li>
                <li><i className="bi bi-check-circle text-success me-2"></i>Employee-specific breakdowns</li>
                <li><i className="bi bi-check-circle text-success me-2"></i>Separate General & Travel expense tables</li>
                <li><i className="bi bi-check-circle text-success me-2"></i>Detailed info: date, km, amount, receipt numbers</li>
              </ul>
              <form onSubmit={(e) => { e.preventDefault(); generateDetailedExpenseReport(); }}>
                <div className="mb-3">
                  <label className="form-label">Start Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">End Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-success w-100"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Generating Detailed Report...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-file-earmark-bar-graph me-2"></i>
                      Generate Detailed Expense Report
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* General Expenses Report */}
        <div className="col-lg-6 mb-4">
          <div className="card border-info">
            <div className="card-header bg-info text-white">
              <h5 className="card-title mb-0">
                <i className="bi bi-briefcase me-2"></i>
                General Expenses Report
              </h5>
            </div>
            <div className="card-body">
              <p className="text-muted mb-3">
                Generate focused reports for general business expenses:
              </p>
              <ul className="list-unstyled mb-3">
                <li><i className="bi bi-check-circle text-info me-2"></i>Office supplies, food, equipment</li>
                <li><i className="bi bi-check-circle text-info me-2"></i>Expense type breakdown (General, Food, Office)</li>
                <li><i className="bi bi-check-circle text-info me-2"></i>Employee-specific general expenses</li>
                <li><i className="bi bi-check-circle text-info me-2"></i>Receipt numbers and detailed notes</li>
              </ul>
              <form onSubmit={(e) => { e.preventDefault(); generateGeneralExpenseReport(); }}>
                <div className="mb-3">
                  <label className="form-label">Start Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">End Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-info w-100"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Generating General Report...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-briefcase me-2"></i>
                      Generate General Expenses Report
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Travel Expenses Report */}
        <div className="col-lg-6 mb-4">
          <div className="card border-primary">
            <div className="card-header bg-primary text-white">
              <h5 className="card-title mb-0">
                <i className="bi bi-car-front me-2"></i>
                Travel Expenses Report
              </h5>
            </div>
            <div className="card-body">
              <p className="text-muted mb-3">
                Generate focused reports for travel-related expenses:
              </p>
              <ul className="list-unstyled mb-3">
                <li><i className="bi bi-check-circle text-primary me-2"></i>Taxi, fuel, toll, parking, flights, hotels</li>
                <li><i className="bi bi-check-circle text-primary me-2"></i>Distance tracking and cost per kilometer</li>
                <li><i className="bi bi-check-circle text-primary me-2"></i>Travel category breakdown</li>
                <li><i className="bi bi-check-circle text-primary me-2"></i>Employee travel efficiency analysis</li>
              </ul>
              <form onSubmit={(e) => { e.preventDefault(); generateTravelExpenseReport(); }}>
                <div className="mb-3">
                  <label className="form-label">Start Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">End Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Generating Travel Report...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-car-front me-2"></i>
                      Generate Travel Expenses Report
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Custom Date Range Report */}
        <div className="col-lg-6 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Custom Date Range Report</h5>
            </div>
            <div className="card-body">
              <form onSubmit={(e) => { e.preventDefault(); generateReport(); }}>
                <div className="mb-3">
                  <label className="form-label">Report Type</label>
                  <select
                    className="form-select"
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                  >
                    <option value="Attendance">Attendance</option>
                    <option value="Expenses">Expenses</option>
                    <option value="Employees">Employees</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Start Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">End Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Generating Report...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-file-earmark-pdf me-2"></i>
                      Generate PDF Report
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Report Features */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Report Features</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <h6>Available Reports:</h6>
                  <ul className="list-unstyled">
                    <li><i className="bi bi-check-circle text-success me-2"></i>Attendance Reports</li>
                    <li><i className="bi bi-check-circle text-success me-2"></i>Expense Reports</li>
                    <li><i className="bi bi-check-circle text-success me-2"></i>Employee Reports</li>
                    <li><i className="bi bi-check-circle text-success me-2"></i>Custom Date Ranges</li>
                  </ul>
                </div>
                <div className="col-md-6">
                  <h6>Report Formats:</h6>
                  <ul className="list-unstyled">
                    <li><i className="bi bi-file-earmark-pdf text-danger me-2"></i>PDF Format</li>
                    <li><i className="bi bi-download text-primary me-2"></i>Auto Download</li>
                    <li><i className="bi bi-calendar text-info me-2"></i>Date Filtering</li>
                    <li><i className="bi bi-graph-up text-success me-2"></i>Charts & Analytics</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
