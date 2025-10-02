'use client'

import { useState, useEffect } from 'react'

interface Expense {
  id: number
  employee_name: string
  category: string
  description: string
  amount: number
  date: string
  status: string
  kilometers?: number
  expense_type?: string
  receipt_number?: string
  notes?: string
}

interface Employee {
  id: number
  name: string
}

export default function TravelExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [formData, setFormData] = useState({
    employee_id: '',
    category: '',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Pending',
    kilometers: '',
    odometer_start: '',
    odometer_end: '',
    expense_type: 'Travel',
    receipt_number: '',
    notes: ''
  })

  useEffect(() => {
    loadExpenses()
    loadEmployees()
  }, [])

  const loadExpenses = async () => {
    try {
      const response = await fetch('/api/expenses')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      
      if (result.error) {
        throw new Error(result.error)
      }
      
      // Filter for travel expenses - check both expense_type and category
      const travelExpenses = (result.expenses || []).filter((expense: Expense) => {
        // Check if explicitly marked as travel
        if (expense.expense_type === 'Travel') return true
        
        // Check if category suggests travel
        const travelCategories = ['Taxi', 'Fuel', 'Toll', 'Parking', 'Flight', 'Hotel', 'Travel', 'Transport']
        if (travelCategories.some(cat => 
          expense.category && expense.category.toLowerCase().includes(cat.toLowerCase())
        )) return true
        
        // Check if description suggests travel
        const travelKeywords = ['taxi', 'fuel', 'toll', 'parking', 'flight', 'hotel', 'travel', 'transport', 'uber', 'ola', 'metro', 'bus', 'cab', 'ride']
        if (travelKeywords.some(keyword => 
          expense.description && expense.description.toLowerCase().includes(keyword)
        )) return true
        
        return false
      })
      
      setExpenses(travelExpenses)
      console.log(`Found ${travelExpenses.length} travel expenses out of ${result.expenses?.length || 0} total expenses`)
    } catch (error) {
      console.error('Error loading travel expenses:', error)
      // Set empty array on error to prevent loading loop
      setExpenses([])
    } finally {
      setLoading(false)
    }
  }

  const loadEmployees = async () => {
    try {
      const response = await fetch('/api/employees')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      
      if (result.error) {
        throw new Error(result.error)
      }
      
      setEmployees(result.employees || [])
    } catch (error) {
      console.error('Error loading employees:', error)
      // Set empty array on error
      setEmployees([])
    }
  }

  const openAddModal = () => {
    setEditingExpense(null)
    setFormData({
      employee_id: '',
      category: '',
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      status: 'Pending',
      kilometers: '',
      odometer_start: '',
      odometer_end: '',
      expense_type: 'Travel',
      receipt_number: '',
      notes: ''
    })
    setShowModal(true)
  }

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense)
    setFormData({
      employee_id: expense.employee_name,
      category: expense.category,
      description: expense.description,
      amount: expense.amount.toString(),
      date: expense.date,
      status: expense.status,
      kilometers: expense.kilometers?.toString() || '',
      odometer_start: (expense as any).odometer_start?.toString() || '',
      odometer_end: (expense as any).odometer_end?.toString() || '',
      expense_type: 'Travel',
      receipt_number: expense.receipt_number || '',
      notes: expense.notes || ''
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const employee = employees.find(emp => emp.name === formData.employee_id)
      if (!employee) {
        alert('Please select a valid employee')
        return
      }

      const response = await fetch('/api/expenses', {
        method: editingExpense ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          employee_id: employee.id,
          amount: parseFloat(formData.amount),
          odometer_start: formData.odometer_start ? parseFloat(formData.odometer_start) : null,
          odometer_end: formData.odometer_end ? parseFloat(formData.odometer_end) : null
        }),
      })

      if (response.ok) {
        setShowModal(false)
        loadExpenses()
      } else {
        const errorData = await response.json()
        alert('Error saving travel expense: ' + (errorData.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error saving travel expense:', error)
      alert('Error saving travel expense. Please try again.')
    }
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this travel expense?')) {
      try {
        const response = await fetch(`/api/expenses/${id}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          loadExpenses()
        } else {
          alert('Error deleting travel expense')
        }
      } catch (error) {
        console.error('Error deleting travel expense:', error)
        alert('Error deleting travel expense. Please try again.')
      }
    }
  }

  const getTotalAmount = () => {
    return expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0)
  }

  const getTotalKilometers = () => {
    return expenses.reduce((sum, expense) => sum + (expense.kilometers || 0), 0)
  }

  const getAverageCostPerKm = () => {
    const totalKm = getTotalKilometers()
    if (totalKm === 0) return 0
    return getTotalAmount() / totalKm
  }

  const calculateKilometers = () => {
    const start = parseFloat(formData.odometer_start)
    const end = parseFloat(formData.odometer_end)
    if (start && end && end > start) {
      const km = end - start
      const amount = km * 3.5 // ₹3.5 per km
      setFormData({ 
        ...formData, 
        kilometers: km.toString(),
        amount: amount.toFixed(2)
      })
    }
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
        <div>
          <h1 className="h2 text-primary">
            <i className="bi bi-car-front me-2"></i>
            Travel Expenses
          </h1>
          <p className="text-muted mb-0">Manage travel-related expenses with distance tracking</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <i className="bi bi-plus-circle me-2"></i>
          Add Travel Expense
        </button>
      </div>

      {/* Summary Cards */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card stats-card h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="icon me-3">
                  <i className="bi bi-currency-rupee"></i>
                </div>
                <div>
                  <p className="mb-1">Total Amount</p>
                  <h3 className="mb-0 text-success">₹{(getTotalAmount() || 0).toLocaleString()}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card stats-card h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="icon me-3">
                  <i className="bi bi-speedometer2"></i>
                </div>
                <div>
                  <p className="mb-1">Total Distance</p>
                  <h3 className="mb-0 text-info">{getTotalKilometers().toFixed(1)} km</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card stats-card h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="icon me-3">
                  <i className="bi bi-list-ul"></i>
                </div>
                <div>
                  <p className="mb-1">Total Trips</p>
                  <h3 className="mb-0 text-primary">{expenses.length}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card stats-card h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="icon me-3">
                  <i className="bi bi-calculator"></i>
                </div>
                <div>
                  <p className="mb-1">Avg Cost/km</p>
                  <h3 className="mb-0 text-warning">₹{getAverageCostPerKm().toFixed(2)}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Travel Expenses Table */}
      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Distance</th>
                  <th>Receipt</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense.id}>
                    <td>{expense.employee_name}</td>
                    <td>{expense.description}</td>
                    <td className="fw-bold text-success">₹{(expense.amount || 0).toLocaleString()}</td>
                    <td>{new Date(expense.date).toLocaleDateString()}</td>
                    <td>
                      {expense.kilometers ? (
                        <span className="badge bg-info">
                          {expense.kilometers} km
                        </span>
                      ) : '-'}
                    </td>
                    <td>
                      {expense.receipt_number ? (
                        <span className="badge bg-light text-dark">{expense.receipt_number}</span>
                      ) : '-'}
                    </td>
                    <td>
                      <span className={`badge ${
                        expense.status === 'Approved' ? 'bg-success' : 
                        expense.status === 'Pending' ? 'bg-warning' : 'bg-danger'
                      }`}>
                        {expense.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => handleEdit(expense)}
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(expense.id)}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
                {expenses.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-4">
                      <div className="text-muted">
                        <i className="bi bi-car-front fs-1 d-block mb-2"></i>
                        <h5>No travel expenses found</h5>
                        <p className="mb-0">No travel expenses have been added yet.</p>
                        <button
                          className="btn btn-primary mt-2"
                          onClick={openAddModal}
                        >
                          <i className="bi bi-plus-circle me-1"></i>Add Travel Expense
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-car-front me-2"></i>
                  {editingExpense ? 'Edit' : 'Add'} Travel Expense
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Employee</label>
                        <select
                          className="form-select"
                          value={formData.employee_id}
                          onChange={(e) => {
                            const newEmployeeId = e.target.value
                            setFormData({ 
                              ...formData, 
                              employee_id: newEmployeeId,
                              // Auto-clear other fields when selecting new employee
                              category: '',
                              description: '',
                              amount: '',
                              status: 'Pending',
                              kilometers: '',
                              receipt_number: '',
                              notes: ''
                            })
                          }}
                          required
                        >
                          <option value="">Select Employee</option>
                          {employees.map((employee) => (
                            <option key={employee.id} value={employee.name}>
                              {employee.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Category</label>
                        <select
                          className="form-select"
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          required
                        >
                          <option value="">Select Category</option>
                          <option value="Taxi">Taxi</option>
                          <option value="Fuel">Fuel</option>
                          <option value="Toll">Toll</option>
                          <option value="Parking">Parking</option>
                          <option value="Public Transport">Public Transport</option>
                          <option value="Flight">Flight</option>
                          <option value="Hotel">Hotel</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="e.g., Client meeting in Mumbai, Airport pickup"
                      required
                    />
                  </div>
                  <div className="row">
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label className="form-label">Amount (₹)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.amount}
                          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label className="form-label">Odometer Start (km)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.odometer_start}
                          onChange={(e) => setFormData({ ...formData, odometer_start: e.target.value })}
                          min="0"
                          step="0.1"
                          placeholder="Start reading"
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label className="form-label">Odometer End (km)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.odometer_end}
                          onChange={(e) => setFormData({ ...formData, odometer_end: e.target.value })}
                          min="0"
                          step="0.1"
                          placeholder="End reading"
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label className="form-label">Distance (km)</label>
                        <div className="input-group">
                          <input
                            type="number"
                            className="form-control"
                            value={formData.kilometers}
                            onChange={(e) => setFormData({ ...formData, kilometers: e.target.value })}
                            min="0"
                            step="0.1"
                            placeholder="Enter distance"
                            required
                          />
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={calculateKilometers}
                            disabled={!formData.odometer_start || !formData.odometer_end}
                          >
                            Calculate
                          </button>
                        </div>
                        <small className="text-muted">
                          Enter odometer readings above and click Calculate, or enter distance manually
                        </small>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label className="form-label">Date</label>
                        <input
                          type="date"
                          className="form-control"
                          value={formData.date}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Receipt Number</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.receipt_number}
                          onChange={(e) => setFormData({ ...formData, receipt_number: e.target.value })}
                          placeholder="Enter receipt number if available"
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Status</label>
                        <select
                          className="form-select"
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Approved">Approved</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Notes</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Additional notes about the travel expense"
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <i className="bi bi-car-front me-1"></i>
                    {editingExpense ? 'Update' : 'Add'} Travel Expense
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
