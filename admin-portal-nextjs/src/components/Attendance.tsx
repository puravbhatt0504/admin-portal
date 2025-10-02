'use client'

import { useState, useEffect } from 'react'

interface AttendanceRecord {
  id: number
  employee_name: string
  date: string
  shift1_in: string | null
  shift1_out: string | null
  shift2_in: string | null
  shift2_out: string | null
  total_hours: number
  status: string
}

interface Employee {
  id: number
  name: string
}

export default function Attendance() {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    employee_id: '',
    date: new Date().toISOString().split('T')[0],
    shift1_in: '',
    shift1_out: '',
    shift2_in: '',
    shift2_out: '',
    status: 'Present',
    total_hours: 0
  })
  const [previousAttendance, setPreviousAttendance] = useState<any>(null)
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0])
  const [showAllDays, setShowAllDays] = useState(false)
  const [timeInputs, setTimeInputs] = useState({
    shift1_in_12: '',
    shift1_out_12: '',
    shift2_in_12: '',
    shift2_out_12: ''
  })

  // Helper function to safely calculate total hours
  const calculateTotalHours = (attendanceRecords: AttendanceRecord[]): string => {
    try {
      if (!attendanceRecords || !Array.isArray(attendanceRecords)) {
        return '0.0'
      }
      
      const total = attendanceRecords.reduce((sum, record) => {
        const hours = typeof record.total_hours === 'number' ? record.total_hours : 0
        return sum + hours
      }, 0)
      
      return total.toFixed(1)
    } catch (error) {
      console.error('Error calculating total hours:', error)
      return '0.0'
    }
  }

  useEffect(() => {
    loadAttendance()
    loadEmployees()
  }, [])

  const loadAttendance = async (dateFilter?: string) => {
    try {
      let url = '/api/attendance'
      if (dateFilter && !showAllDays) {
        url += `?date=${dateFilter}`
      }
      
      const response = await fetch(url)
      const result = await response.json()
      setAttendance(result.attendance || [])
    } catch (error) {
      console.error('Error loading attendance:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadEmployees = async () => {
    try {
      const response = await fetch('/api/employees')
      const result = await response.json()
      setEmployees(result.employees || [])
    } catch (error) {
      console.error('Error loading employees:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Calculate and validate total hours before submission
    const calculatedTotal = calculateTotalHours()
    
    // Additional validation to prevent negative values
    if (calculatedTotal < 0) {
      console.error('Negative total hours detected, preventing submission:', calculatedTotal)
      alert('Error: Invalid time entries detected. Please check your shift times.')
      return
    }
    
    try {
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          total_hours: calculatedTotal
        }),
      })

      if (response.ok) {
        setShowModal(false)
        setFormData({
          employee_id: '',
          date: new Date().toISOString().split('T')[0],
          shift1_in: '',
          shift1_out: '',
          shift2_in: '',
          shift2_out: '',
          status: 'Present',
          total_hours: 0
        })
        setTimeInputs({
          shift1_in_12: '',
          shift1_out_12: '',
          shift2_in_12: '',
          shift2_out_12: ''
        })
        setPreviousAttendance(null)
        loadAttendance()
      } else {
        const errorData = await response.json()
        console.error('API Error:', errorData)
        alert('Error saving attendance: ' + (errorData.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error saving attendance:', error)
      alert('Error saving attendance. Please try again.')
    }
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this attendance record?')) {
      try {
        const response = await fetch(`/api/attendance/${id}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          loadAttendance()
        }
      } catch (error) {
        console.error('Error deleting attendance:', error)
      }
    }
  }

  // Helper function to calculate hours between two times (handles late night shifts)
  const calculateShiftHours = (startTime: string, endTime: string) => {
    if (!startTime || !endTime) return 0
    
    // Validate time format
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      console.warn('Invalid time format:', { startTime, endTime })
      return 0
    }
    
    const start = new Date(`2000-01-01T${startTime}`)
    const end = new Date(`2000-01-01T${endTime}`)
    
    let diffMs = end.getTime() - start.getTime()
    
    // Handle overnight shifts (end time is next day)
    // This covers cases like 10 PM to 2 AM, 11 PM to 3 AM, etc.
    if (diffMs < 0) {
      diffMs += 24 * 60 * 60 * 1000
    }
    
    const hours = diffMs / (1000 * 60 * 60)
    const result = Math.max(0, Math.round(hours * 100) / 100) // Ensure non-negative result
    
    // Additional validation to prevent any negative values
    if (result < 0) {
      console.warn('Negative hours detected, returning 0:', { startTime, endTime, result })
      return 0
    }
    
    return result
  }

  // Helper function to check if shift crosses midnight
  const isOvernightShift = (startTime: string, endTime: string) => {
    if (!startTime || !endTime) return false
    
    const start = new Date(`2000-01-01T${startTime}`)
    const end = new Date(`2000-01-01T${endTime}`)
    
    return end.getTime() < start.getTime()
  }

  // Helper function to format time for display
  const formatTime = (time: string) => {
    if (!time) return ''
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    return `${displayHour}:${minutes} ${ampm}`
  }

  // Helper function to convert 12-hour format to 24-hour format
  const convertTo24Hour = (time12: string) => {
    if (!time12) return ''
    
    // Remove extra spaces and convert to uppercase
    const cleanTime = time12.trim().toUpperCase()
    
    // Match patterns like "6 PM", "6:30 PM", "6:30PM", "6PM", etc.
    const match = cleanTime.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/)
    
    if (!match) return ''
    
    let [, hours, minutes = '00', period] = match
    let hour24 = parseInt(hours)
    
    // Convert to 24-hour format
    if (period === 'AM' && hour24 === 12) {
      hour24 = 0
    } else if (period === 'PM' && hour24 !== 12) {
      hour24 += 12
    }
    
    // Format as HH:MM
    return `${hour24.toString().padStart(2, '0')}:${minutes}`
  }

  // Helper function to validate 12-hour time format
  const isValid12HourTime = (time: string) => {
    if (!time) return true // Empty is valid
    const cleanTime = time.trim().toUpperCase()
    const match = cleanTime.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/)
    return !!match
  }

  const calculateTotalHours = () => {
    // Calculate hours for each shift with validation
    const shift1Hours = calculateShiftHours(formData.shift1_in, formData.shift1_out)
    const shift2Hours = calculateShiftHours(formData.shift2_in, formData.shift2_out)
    
    // Ensure both values are non-negative
    const validShift1 = Math.max(0, shift1Hours)
    const validShift2 = Math.max(0, shift2Hours)
    
    const total = validShift1 + validShift2
    
    // Final safety check
    const result = Math.max(0, Math.round(total * 100) / 100)
    
    // Debug logging
    console.log('Total Hours Calculation:', {
      shift1_in: formData.shift1_in,
      shift1_out: formData.shift1_out,
      shift1Hours: validShift1,
      shift2_in: formData.shift2_in,
      shift2_out: formData.shift2_out,
      shift2Hours: validShift2,
      total: result
    })
    
    return result
  }

  const getShift1Hours = () => {
    const hours = calculateShiftHours(formData.shift1_in, formData.shift1_out)
    return Math.max(0, hours)
  }

  const getShift2Hours = () => {
    const hours = calculateShiftHours(formData.shift2_in, formData.shift2_out)
    return Math.max(0, hours)
  }

  // Function to load previous attendance data for selected employee and date
  const loadPreviousAttendance = async (employeeId: string, date: string) => {
    try {
      const response = await fetch(`/api/attendance?employee_id=${employeeId}&date=${date}`)
      const data = await response.json()
      
      if (data.attendance && data.attendance.length > 0) {
        const prevData = data.attendance[0]
        setPreviousAttendance(prevData)
        
        // Auto-fill form with previous data
        setFormData(prev => ({
          ...prev,
          shift1_in: prevData.shift1_in || '',
          shift1_out: prevData.shift1_out || '',
          shift2_in: prevData.shift2_in || '',
          shift2_out: prevData.shift2_out || '',
          status: prevData.status || 'Present'
        }))
        
        // Also populate 12-hour inputs
        setTimeInputs({
          shift1_in_12: convertTo12Hour(prevData.shift1_in || ''),
          shift1_out_12: convertTo12Hour(prevData.shift1_out || ''),
          shift2_in_12: convertTo12Hour(prevData.shift2_in || ''),
          shift2_out_12: convertTo12Hour(prevData.shift2_out || '')
        })
      } else {
        setPreviousAttendance(null)
        // Reset form if no previous data
        setFormData(prev => ({
          ...prev,
          shift1_in: '',
          shift1_out: '',
          shift2_in: '',
          shift2_out: '',
          status: 'Present'
        }))
      }
    } catch (error) {
      console.error('Error loading previous attendance:', error)
      setPreviousAttendance(null)
    }
  }

  // Handle employee selection change
  const handleEmployeeChange = (employeeId: string) => {
    setFormData(prev => ({ ...prev, employee_id: employeeId }))
    if (employeeId && formData.date) {
      loadPreviousAttendance(employeeId, formData.date)
    }
  }

  // Handle date change
  const handleDateChange = (date: string) => {
    setFormData(prev => ({ ...prev, date }))
    if (formData.employee_id && date) {
      loadPreviousAttendance(formData.employee_id, date)
    }
  }

  // Clear form data
  const clearForm = () => {
    setFormData(prev => ({
      ...prev,
      shift1_in: '',
      shift1_out: '',
      shift2_in: '',
      shift2_out: '',
      status: 'Present'
    }))
    setTimeInputs({
      shift1_in_12: '',
      shift1_out_12: '',
      shift2_in_12: '',
      shift2_out_12: ''
    })
    setPreviousAttendance(null)
  }

  // Reset entire form
  const resetForm = () => {
    setFormData({
      employee_id: '',
      date: new Date().toISOString().split('T')[0],
      shift1_in: '',
      shift1_out: '',
      shift2_in: '',
      shift2_out: '',
      status: 'Present',
      total_hours: 0
    })
    setTimeInputs({
      shift1_in_12: '',
      shift1_out_12: '',
      shift2_in_12: '',
      shift2_out_12: ''
    })
    setPreviousAttendance(null)
  }

  // Handle date filter change
  const handleDateFilterChange = (date: string) => {
    setFilterDate(date)
    loadAttendance(date)
  }

  // Toggle between specific date and all days view
  const toggleViewMode = () => {
    setShowAllDays(!showAllDays)
    if (!showAllDays) {
      // Switching to all days view
      loadAttendance()
    } else {
      // Switching to specific date view
      loadAttendance(filterDate)
    }
  }

  // Handle 12-hour time input change
  const handle12HourTimeChange = (field: string, value: string) => {
    setTimeInputs(prev => ({ ...prev, [field]: value }))
    
    // Convert to 24-hour format and update formData
    const time24 = convertTo24Hour(value)
    const formField = field.replace('_12', '')
    
    setFormData(prev => ({ ...prev, [formField]: time24 }))
  }

  // Convert 24-hour time to 12-hour format for display
  const convertTo12Hour = (time24: string) => {
    if (!time24) return ''
    const [hours, minutes] = time24.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    return `${displayHour}:${minutes} ${ampm}`
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h2">Attendance</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <i className="bi bi-calendar-check me-2"></i>
          Mark Attendance
        </button>
      </div>

      {/* Date Filter Section */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-md-6">
              <div className="d-flex align-items-center gap-3">
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="viewModeToggle"
                    checked={showAllDays}
                    onChange={toggleViewMode}
                  />
                  <label className="form-check-label" htmlFor="viewModeToggle">
                    <strong>Show All Days</strong>
                  </label>
                </div>
                {!showAllDays && (
                  <div className="d-flex align-items-center gap-2">
                    <label className="form-label mb-0">
                      <i className="bi bi-calendar3 me-1"></i>Filter by Date:
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      value={filterDate}
                      onChange={(e) => handleDateFilterChange(e.target.value)}
                      style={{ width: 'auto' }}
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="col-md-6 text-end">
              <div className="d-flex align-items-center justify-content-end gap-2">
                <span className="badge bg-info">
                  <i className="bi bi-info-circle me-1"></i>
                  {showAllDays ? 'Showing all days' : `Showing ${filterDate}`}
                </span>
                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => loadAttendance(showAllDays ? undefined : filterDate)}
                  title="Refresh data"
                >
                  <i className="bi bi-arrow-clockwise"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          {/* Attendance Summary */}
          <div className="row mb-3">
            <div className="col-md-8">
              <h5 className="mb-1">
                {showAllDays ? 'All Attendance Records' : `Attendance for ${filterDate}`}
              </h5>
              <p className="text-muted mb-0">
                {attendance.length} record{attendance.length !== 1 ? 's' : ''} found
                {!showAllDays && attendance.length > 0 && (
                  <span className="ms-2">
                    • Total Hours: {calculateTotalHours(attendance)}h
                  </span>
                )}
              </p>
            </div>
            <div className="col-md-4 text-end">
              {!showAllDays && attendance.length === 0 && (
                <button
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => setShowModal(true)}
                >
                  <i className="bi bi-plus-circle me-1"></i>Add for this date
                </button>
              )}
            </div>
          </div>
          
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead className="table-dark">
                <tr>
                  <th>Employee</th>
                  <th>Date</th>
                  <th>Shift 1 In</th>
                  <th>Shift 1 Out</th>
                  <th>Shift 2 In</th>
                  <th>Shift 2 Out</th>
                  <th>Total Hours</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {attendance.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-4">
                      <div className="text-muted">
                        <i className="bi bi-calendar-x fs-1 d-block mb-2"></i>
                        <h5>No attendance records found</h5>
                        <p className="mb-0">
                          {showAllDays 
                            ? 'No attendance has been marked yet.' 
                            : `No attendance records found for ${filterDate}.`
                          }
                        </p>
                        {!showAllDays && (
                          <button
                            className="btn btn-primary mt-2"
                            onClick={() => setShowModal(true)}
                          >
                            <i className="bi bi-plus-circle me-1"></i>Mark Attendance for this date
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  attendance.map((record) => (
                    <tr key={record.id}>
                      <td>{record.employee_name}</td>
                      <td>{new Date(record.date).toLocaleDateString()}</td>
                      <td>{record.shift1_in || '-'}</td>
                      <td>{record.shift1_out || '-'}</td>
                      <td>{record.shift2_in || '-'}</td>
                      <td>{record.shift2_out || '-'}</td>
                      <td>
                        <span className="badge bg-primary">
                          {record.total_hours || 0}h
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${
                          record.status === 'Present' ? 'bg-success' : 
                          record.status === 'Late' ? 'bg-warning' : 'bg-danger'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(record.id)}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Mark Attendance</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Employee</label>
                    <select
                      className="form-select"
                      value={formData.employee_id}
                      onChange={(e) => handleEmployeeChange(e.target.value)}
                      required
                    >
                      <option value="">Select Employee</option>
                      {employees.map((employee) => (
                        <option key={employee.id} value={employee.id}>
                          {employee.name}
                        </option>
                      ))}
                    </select>
                    {previousAttendance && (
                      <div className="alert alert-info mt-2">
                        <small><i className="bi bi-info-circle me-1"></i>Previous attendance data loaded for this employee and date</small>
                      </div>
                    )}
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={formData.date}
                      onChange={(e) => handleDateChange(e.target.value)}
                      required
                    />
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="card border-primary">
                        <div className="card-header bg-primary text-white">
                          <h6 className="mb-0"><i className="bi bi-sunrise me-2"></i>Shift 1 (Morning)</h6>
                        </div>
                        <div className="card-body">
                      <div className="mb-3">
                        <label className="form-label">
                          <i className="bi bi-clock me-1"></i>Check In Time
                        </label>
                        <div className="row">
                          <div className="col-md-6">
                            <div className="input-group">
                              <input
                                type="time"
                                className="form-control form-control-lg"
                                value={formData.shift1_in}
                                onChange={(e) => setFormData({ ...formData, shift1_in: e.target.value })}
                                style={{ fontSize: '1.1rem' }}
                              />
                              <span className="input-group-text">
                                <i className="bi bi-calendar-check"></i>
                              </span>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="input-group">
                              <input
                                type="text"
                                className={`form-control form-control-lg ${!isValid12HourTime(timeInputs.shift1_in_12) ? 'is-invalid' : ''}`}
                                placeholder="6 PM, 6:30 PM"
                                value={timeInputs.shift1_in_12}
                                onChange={(e) => handle12HourTimeChange('shift1_in_12', e.target.value)}
                                style={{ fontSize: '1.1rem' }}
                              />
                              <span className="input-group-text">
                                <i className="bi bi-clock-history"></i>
                              </span>
                            </div>
                            <small className="form-text text-muted">
                              <i className="bi bi-info-circle me-1"></i>
                              Enter time like: 6 PM, 6:30 PM, 6:30PM
                            </small>
                          </div>
                        </div>
                        {formData.shift1_in && (
                          <small className="form-text text-success">
                            <i className="bi bi-check-circle me-1"></i>
                            Selected: {formatTime(formData.shift1_in)}
                          </small>
                        )}
                      </div>
                          <div className="mb-3">
                            <label className="form-label">
                              <i className="bi bi-clock me-1"></i>Check Out Time
                            </label>
                            <div className="row">
                              <div className="col-md-6">
                                <div className="input-group">
                                  <input
                                    type="time"
                                    className="form-control form-control-lg"
                                    value={formData.shift1_out}
                                    onChange={(e) => setFormData({ ...formData, shift1_out: e.target.value })}
                                    style={{ fontSize: '1.1rem' }}
                                  />
                                  <span className="input-group-text">
                                    <i className="bi bi-calendar-x"></i>
                                  </span>
                                </div>
                              </div>
                              <div className="col-md-6">
                                <div className="input-group">
                                  <input
                                    type="text"
                                    className={`form-control form-control-lg ${!isValid12HourTime(timeInputs.shift1_out_12) ? 'is-invalid' : ''}`}
                                    placeholder="5 PM, 5:30 PM"
                                    value={timeInputs.shift1_out_12}
                                    onChange={(e) => handle12HourTimeChange('shift1_out_12', e.target.value)}
                                    style={{ fontSize: '1.1rem' }}
                                  />
                                  <span className="input-group-text">
                                    <i className="bi bi-clock-history"></i>
                                  </span>
                                </div>
                                <small className="form-text text-muted">
                                  <i className="bi bi-info-circle me-1"></i>
                                  Enter time like: 5 PM, 5:30 PM, 5:30PM
                                </small>
                              </div>
                            </div>
                            {formData.shift1_out && (
                              <small className="form-text text-success">
                                <i className="bi bi-check-circle me-1"></i>
                                Selected: {formatTime(formData.shift1_out)}
                              </small>
                            )}
                          </div>
                          {/* Quick Time Selection Buttons */}
                          <div className="mb-3">
                            <small className="text-muted d-block mb-2">Quick Select:</small>
                            <div className="btn-group btn-group-sm" role="group">
                              <button
                                type="button"
                                className="btn btn-outline-primary"
                                onClick={() => setFormData({ ...formData, shift1_in: '09:00', shift1_out: '17:00' })}
                              >
                                9 AM - 5 PM
                              </button>
                              <button
                                type="button"
                                className="btn btn-outline-primary"
                                onClick={() => setFormData({ ...formData, shift1_in: '08:00', shift1_out: '16:00' })}
                              >
                                8 AM - 4 PM
                              </button>
                              <button
                                type="button"
                                className="btn btn-outline-primary"
                                onClick={() => setFormData({ ...formData, shift1_in: '10:00', shift1_out: '18:00' })}
                              >
                                10 AM - 6 PM
                              </button>
                            </div>
                          </div>
                          {formData.shift1_in && formData.shift1_out && (
                            <div className={`alert ${isOvernightShift(formData.shift1_in, formData.shift1_out) ? 'alert-warning' : 'alert-info'}`}>
                              <div className="d-flex align-items-center">
                                <i className={`bi ${isOvernightShift(formData.shift1_in, formData.shift1_out) ? 'bi-moon-stars' : 'bi-info-circle'} me-2`}></i>
                                <div>
                                  <strong>Shift 1 Hours: {getShift1Hours().toFixed(1)} hours</strong>
                                  {isOvernightShift(formData.shift1_in, formData.shift1_out) && (
                                    <div className="small">🌙 Overnight shift detected</div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="card border-success">
                        <div className="card-header bg-success text-white">
                          <h6 className="mb-0"><i className="bi bi-moon me-2"></i>Shift 2 (Evening/Night) - Optional</h6>
                        </div>
                        <div className="card-body">
                          <div className="mb-3">
                            <label className="form-label">
                              <i className="bi bi-clock me-1"></i>Check In Time
                            </label>
                            <div className="row">
                              <div className="col-md-6">
                                <div className="input-group">
                                  <input
                                    type="time"
                                    className="form-control form-control-lg"
                                    value={formData.shift2_in}
                                    onChange={(e) => setFormData({ ...formData, shift2_in: e.target.value })}
                                    style={{ fontSize: '1.1rem' }}
                                  />
                                  <span className="input-group-text">
                                    <i className="bi bi-calendar-check"></i>
                                  </span>
                                </div>
                              </div>
                              <div className="col-md-6">
                                <div className="input-group">
                                  <input
                                    type="text"
                                    className={`form-control form-control-lg ${!isValid12HourTime(timeInputs.shift2_in_12) ? 'is-invalid' : ''}`}
                                    placeholder="6 PM, 8 PM"
                                    value={timeInputs.shift2_in_12}
                                    onChange={(e) => handle12HourTimeChange('shift2_in_12', e.target.value)}
                                    style={{ fontSize: '1.1rem' }}
                                  />
                                  <span className="input-group-text">
                                    <i className="bi bi-clock-history"></i>
                                  </span>
                                </div>
                                <small className="form-text text-muted">
                                  <i className="bi bi-info-circle me-1"></i>
                                  Enter time like: 6 PM, 8 PM, 8:30 PM
                                </small>
                              </div>
                            </div>
                            {formData.shift2_in && (
                              <small className="form-text text-success">
                                <i className="bi bi-check-circle me-1"></i>
                                Selected: {formatTime(formData.shift2_in)}
                              </small>
                            )}
                          </div>
                          <div className="mb-3">
                            <label className="form-label">
                              <i className="bi bi-clock me-1"></i>Check Out Time
                            </label>
                            <div className="row">
                              <div className="col-md-6">
                                <div className="input-group">
                                  <input
                                    type="time"
                                    className="form-control form-control-lg"
                                    value={formData.shift2_out}
                                    onChange={(e) => setFormData({ ...formData, shift2_out: e.target.value })}
                                    style={{ fontSize: '1.1rem' }}
                                  />
                                  <span className="input-group-text">
                                    <i className="bi bi-calendar-x"></i>
                                  </span>
                                </div>
                              </div>
                              <div className="col-md-6">
                                <div className="input-group">
                                  <input
                                    type="text"
                                    className={`form-control form-control-lg ${!isValid12HourTime(timeInputs.shift2_out_12) ? 'is-invalid' : ''}`}
                                    placeholder="2 AM, 6 AM"
                                    value={timeInputs.shift2_out_12}
                                    onChange={(e) => handle12HourTimeChange('shift2_out_12', e.target.value)}
                                    style={{ fontSize: '1.1rem' }}
                                  />
                                  <span className="input-group-text">
                                    <i className="bi bi-clock-history"></i>
                                  </span>
                                </div>
                                <small className="form-text text-muted">
                                  <i className="bi bi-info-circle me-1"></i>
                                  Enter time like: 2 AM, 6 AM, 2:30 AM
                                </small>
                              </div>
                            </div>
                            {formData.shift2_out && (
                              <small className="form-text text-success">
                                <i className="bi bi-check-circle me-1"></i>
                                Selected: {formatTime(formData.shift2_out)}
                              </small>
                            )}
                          </div>
                          {/* Quick Time Selection Buttons for Shift 2 */}
                          <div className="mb-3">
                            <small className="text-muted d-block mb-2">Quick Select:</small>
                            <div className="btn-group btn-group-sm" role="group">
                              <button
                                type="button"
                                className="btn btn-outline-success"
                                onClick={() => setFormData({ ...formData, shift2_in: '18:00', shift2_out: '22:00' })}
                              >
                                6 PM - 10 PM
                              </button>
                              <button
                                type="button"
                                className="btn btn-outline-success"
                                onClick={() => setFormData({ ...formData, shift2_in: '20:00', shift2_out: '02:00' })}
                              >
                                8 PM - 2 AM
                              </button>
                              <button
                                type="button"
                                className="btn btn-outline-success"
                                onClick={() => setFormData({ ...formData, shift2_in: '22:00', shift2_out: '06:00' })}
                              >
                                10 PM - 6 AM
                              </button>
                            </div>
                          </div>
                          {formData.shift2_in && formData.shift2_out && (
                            <div className={`alert ${isOvernightShift(formData.shift2_in, formData.shift2_out) ? 'alert-warning' : 'alert-success'}`}>
                              <div className="d-flex align-items-center">
                                <i className={`bi ${isOvernightShift(formData.shift2_in, formData.shift2_out) ? 'bi-moon-stars' : 'bi-info-circle'} me-2`}></i>
                                <div>
                                  <strong>Shift 2 Hours: {getShift2Hours().toFixed(1)} hours</strong>
                                  {isOvernightShift(formData.shift2_in, formData.shift2_out) && (
                                    <div className="small">🌙 Overnight shift detected</div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Status</label>
                    <select
                      className="form-select"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="Present">Present</option>
                      <option value="Late">Late</option>
                      <option value="Absent">Absent</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <div className="card border-info">
                      <div className="card-header bg-info text-white">
                        <h6 className="mb-0"><i className="bi bi-clock me-2"></i>Total Hours Summary</h6>
                      </div>
                      <div className="card-body">
                        <div className="row text-center">
                        <div className="col-md-4">
                          <div className="border-end">
                            <h4 className={`mb-1 ${calculateTotalHours() < 0 ? 'text-danger' : 'text-primary'}`}>
                              {Math.max(0, calculateTotalHours()).toFixed(1)}
                            </h4>
                            <small className="text-muted">Total Hours</small>
                            {calculateTotalHours() < 0 && (
                              <div className="small text-danger">
                                <i className="bi bi-exclamation-triangle me-1"></i>
                                Invalid time entries
                              </div>
                            )}
                            {(isOvernightShift(formData.shift1_in, formData.shift1_out) || isOvernightShift(formData.shift2_in, formData.shift2_out)) && (
                              <div className="small text-warning">🌙 Includes overnight</div>
                            )}
                          </div>
                        </div>
                          <div className="col-md-4">
                            <div className="border-end">
                              <h4 className="text-success mb-1">{getShift1Hours().toFixed(1)}</h4>
                              <small className="text-muted">Shift 1</small>
                              {isOvernightShift(formData.shift1_in, formData.shift1_out) && (
                                <div className="small text-warning">🌙 Overnight</div>
                              )}
                            </div>
                          </div>
                          <div className="col-md-4">
                            <h4 className="text-warning mb-1">{getShift2Hours().toFixed(1)}</h4>
                            <small className="text-muted">Shift 2</small>
                            {isOvernightShift(formData.shift2_in, formData.shift2_out) && (
                              <div className="small text-warning">🌙 Overnight</div>
                            )}
                          </div>
                        </div>
                        {calculateTotalHours() > 0 && (
                          <div className="mt-3">
                            <div className="progress" style={{ height: '8px' }}>
                              <div 
                                className="progress-bar bg-gradient" 
                                role="progressbar" 
                                style={{ 
                                  width: `${Math.min(100, (calculateTotalHours() / 12) * 100)}%`,
                                  background: 'linear-gradient(90deg, #10b981 0%, #3b82f6 100%)'
                                }}
                              ></div>
                            </div>
                            <small className="text-muted">Progress: {Math.min(100, Math.round((calculateTotalHours() / 12) * 100))}% of 12 hours</small>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className="btn btn-outline-warning"
                      onClick={clearForm}
                      disabled={!formData.shift1_in && !formData.shift1_out && !formData.shift2_in && !formData.shift2_out}
                    >
                      <i className="bi bi-arrow-clockwise me-1"></i>Clear Times
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowModal(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      <i className="bi bi-check-circle me-1"></i>
                      {previousAttendance ? 'Update' : 'Add'} Attendance
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
