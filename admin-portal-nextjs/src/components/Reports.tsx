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
      
      // Get the HTML content
      const htmlContent = await response.text()
      
      // Open in new window and trigger print
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(htmlContent)
        printWindow.document.close()
        printWindow.focus()
        
        // Wait for content to load, then trigger print
        setTimeout(() => {
          printWindow.print()
        }, 500)
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
      
      // Get the HTML content
      const htmlContent = await response.text()
      
      // Open in new window and trigger print
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(htmlContent)
        printWindow.document.close()
        printWindow.focus()
        
        // Wait for content to load, then trigger print
        setTimeout(() => {
          printWindow.print()
        }, 500)
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
      
      // Get the HTML content
      const htmlContent = await response.text()
      
      // Open in new window and trigger print
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(htmlContent)
        printWindow.document.close()
        printWindow.focus()
        
        // Wait for content to load, then trigger print
        setTimeout(() => {
          printWindow.print()
        }, 500)
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
      
      // Get the HTML content
      const htmlContent = await response.text()
      
      // Open in new window and trigger print
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(htmlContent)
        printWindow.document.close()
        printWindow.focus()
        
        // Wait for content to load, then trigger print
        setTimeout(() => {
          printWindow.print()
        }, 500)
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
      const response = await fetch(`/api/reports/pdf?type=${type}&start_date=${startDate}&end_date=${endDate}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      // Get the HTML content
      const htmlContent = await response.text()
      
      // Open in new window and trigger print
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(htmlContent)
        printWindow.document.close()
        printWindow.focus()
        
        // Wait for content to load, then trigger print
        setTimeout(() => {
          printWindow.print()
        }, 500)
      }
      
    } catch (error) {
      console.error(`Error generating ${type} report:`, error)
      alert(`Failed to generate ${type} report. Please try again.`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="mb-0">
              <i className="bi bi-file-earmark-pdf me-2"></i>
              Reports
            </h2>
          </div>

          {/* Date Range Selection */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-calendar-range me-2"></i>
                Select Date Range
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <label className="form-label">Start Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">End Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Basic Reports */}
          <div className="row mb-4">
            <div className="col-md-6">
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0">
                    <i className="bi bi-people me-2"></i>
                    Attendance Report
                  </h5>
                </div>
                <div className="card-body">
                  <p className="text-muted">Generate attendance report for selected date range</p>
                  <form onSubmit={(e) => { e.preventDefault(); generateQuickReport('Attendance'); }}>
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
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Generating...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-download me-2"></i>
                          Generate Attendance Report
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0">
                    <i className="bi bi-person-lines-fill me-2"></i>
                    Employee Report
                  </h5>
                </div>
                <div className="card-body">
                  <p className="text-muted">Generate employee directory report</p>
                  <form onSubmit={(e) => { e.preventDefault(); generateQuickReport('Employees'); }}>
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
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Generating...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-download me-2"></i>
                          Generate Employee Report
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Expense Report */}
          <div className="card mb-4">
            <div className="card-header bg-success text-white">
              <h5 className="mb-0">
                <i className="bi bi-receipt me-2"></i>
                Detailed Expense Report
              </h5>
            </div>
            <div className="card-body">
              <p className="text-muted">
                Generate a comprehensive expense report with employee breakdown, 
                expense categorization, and detailed analysis for the selected date range.
              </p>
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
                  className="btn btn-success"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Generating...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-download me-2"></i>
                      Generate Detailed Expense Report
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* General Expense Report */}
          <div className="card mb-4">
            <div className="card-header bg-info text-white">
              <h5 className="mb-0">
                <i className="bi bi-briefcase me-2"></i>
                General Expense Report
              </h5>
            </div>
            <div className="card-body">
              <p className="text-muted">
                Generate a report for general business expenses (non-travel related) 
                for the selected date range.
              </p>
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
                  className="btn btn-info"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Generating...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-download me-2"></i>
                      Generate General Expense Report
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Travel Expense Report */}
          <div className="card mb-4">
            <div className="card-header bg-warning text-dark">
              <h5 className="mb-0">
                <i className="bi bi-geo-alt me-2"></i>
                Travel Expense Report
              </h5>
            </div>
            <div className="card-body">
              <p className="text-muted">
                Generate a report for travel-related expenses including distance tracking, 
                fuel costs, and transportation expenses for the selected date range.
              </p>
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
                  className="btn btn-warning"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Generating...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-download me-2"></i>
                      Generate Travel Expense Report
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}