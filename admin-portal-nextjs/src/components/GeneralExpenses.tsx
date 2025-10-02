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

export default function GeneralExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [filterType, setFilterType] = useState('All') // All, General, Food, Office
  const [formData, setFormData] = useState({
    employee_id: '',
    category: '',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Pending',
    kilometers: '',
    expense_type: 'General',
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
      const result = await response.json()
      
      if (response.ok) {
        // Filter for general expenses (non-travel)
        const generalExpenses = (result.expenses || []).filter((expense: Expense) => {
          // If explicitly marked as travel, exclude it
          if (expense.expense_type === 'Travel') return false
          
          // Check if category suggests travel - exclude these
          const travelCategories = ['Taxi', 'Fuel', 'Toll', 'Parking', 'Flight', 'Hotel', 'Travel', 'Transport']
          if (travelCategories.some(cat => 
            expense.category && expense.category.toLowerCase().includes(cat.toLowerCase())
          )) return false
          
          // Check if description suggests travel - exclude these
          const travelKeywords = ['taxi', 'fuel', 'toll', 'parking', 'flight', 'hotel', 'travel', 'transport', 'uber', 'ola', 'metro', 'bus', 'cab', 'ride']
          if (travelKeywords.some(keyword => 
            expense.description && expense.description.toLowerCase().includes(keyword)
          )) return false
          
          // Include everything else as general expenses
          return true
        })
        
        setExpenses(generalExpenses)
        console.log(`Found ${generalExpenses.length} general expenses out of ${result.expenses?.length || 0} total expenses`)
      } else {
        console.error('Error loading expenses:', result.error)
      }
    } catch (error) {
      console.error('Error loading general expenses:', error)
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
      expense_type: 'General',
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
      expense_type: expense.expense_type || 'General',
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
          amount: parseFloat(formData.amount)
        }),
      })

      if (response.ok) {
        setShowModal(false)
        loadExpenses()
      } else {
        const errorData = await response.json()
        alert('Error saving expense: ' + (errorData.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error saving expense:', error)
      alert('Error saving expense. Please try again.')
    }
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        const response = await fetch(`/api/expenses/${id}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          loadExpenses()
        } else {
          alert('Error deleting expense')
        }
      } catch (error) {
        console.error('Error deleting expense:', error)
        alert('Error deleting expense. Please try again.')
      }
    }
  }

  const filteredExpenses = expenses.filter(expense => {
    if (filterType === 'All') return true
    return expense.expense_type === filterType
  })

  const getTotalAmount = () => {
    return filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0)
  }

  const getExpenseTypeCount = (type: string) => {
    return expenses.filter(expense => expense.expense_type === type).length
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
            <i className="bi bi-briefcase me-2"></i>
            General Expenses
          </h1>
          <p className="text-muted mb-0">Manage office supplies, food, equipment, and other business expenses</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <i className="bi bi-plus-circle me-2"></i>
          Add General Expense
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
                  <h3 className="mb-0 text-success">₹{getTotalAmount().toLocaleString()}</h3>
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
                  <p className="mb-1">Total Records</p>
                  <h3 className="mb-0 text-primary">{filteredExpenses.length}</h3>
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
                  <i className="bi bi-briefcase"></i>
                </div>
                <div>
                  <p className="mb-1">General</p>
                  <h3 className="mb-0 text-info">{getExpenseTypeCount('General')}</h3>
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
                  <i className="bi bi-utensils"></i>
                </div>
                <div>
                  <p className="mb-1">Food</p>
                  <h3 className="mb-0 text-warning">{getExpenseTypeCount('Food')}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-md-6">
              <h5 className="mb-0">Filter by Expense Type</h5>
            </div>
            <div className="col-md-6">
              <div className="btn-group" role="group">
                <input
                  type="radio"
                  className="btn-check"
                  name="filterType"
                  id="filterAll"
                  checked={filterType === 'All'}
                  onChange={() => setFilterType('All')}
                />
                <label className="btn btn-outline-primary" htmlFor="filterAll">
                  All ({expenses.length})
                </label>

                <input
                  type="radio"
                  className="btn-check"
                  name="filterType"
                  id="filterGeneral"
                  checked={filterType === 'General'}
                  onChange={() => setFilterType('General')}
                />
                <label className="btn btn-outline-info" htmlFor="filterGeneral">
                  General ({getExpenseTypeCount('General')})
                </label>

                <input
                  type="radio"
                  className="btn-check"
                  name="filterType"
                  id="filterFood"
                  checked={filterType === 'Food'}
                  onChange={() => setFilterType('Food')}
                />
                <label className="btn btn-outline-warning" htmlFor="filterFood">
                  Food ({getExpenseTypeCount('Food')})
                </label>

                <input
                  type="radio"
                  className="btn-check"
                  name="filterType"
                  id="filterOffice"
                  checked={filterType === 'Office'}
                  onChange={() => setFilterType('Office')}
                />
                <label className="btn btn-outline-secondary" htmlFor="filterOffice">
                  Office ({getExpenseTypeCount('Office')})
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Receipt</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((expense) => (
                  <tr key={expense.id}>
                    <td>{expense.employee_name}</td>
                    <td>
                      <span className={`badge ${
                        expense.expense_type === 'Food' ? 'bg-warning' :
                        expense.expense_type === 'Office' ? 'bg-info' : 'bg-secondary'
                      }`}>
                        {expense.expense_type || 'General'}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-info">{expense.category}</span>
                    </td>
                    <td>{expense.description}</td>
                    <td className="fw-bold text-success">₹{expense.amount.toLocaleString()}</td>
                    <td>{new Date(expense.date).toLocaleDateString()}</td>
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
                {filteredExpenses.length === 0 && (
                  <tr>
                    <td colSpan={9} className="text-center py-4">
                      <div className="text-muted">
                        <i className="bi bi-briefcase fs-1 d-block mb-2"></i>
                        <h5>No general expenses found</h5>
                        <p className="mb-0">
                          {filterType === 'All' 
                            ? 'No general expenses have been added yet.' 
                            : `No ${filterType.toLowerCase()} expenses found.`
                          }
                        </p>
                        <button
                          className="btn btn-primary mt-2"
                          onClick={openAddModal}
                        >
                          <i className="bi bi-plus-circle me-1"></i>Add General Expense
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
                  {editingExpense ? 'Edit' : 'Add'} General Expense
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
                              expense_type: 'General',
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
                        <label className="form-label">Expense Type</label>
                        <select
                          className="form-select"
                          value={formData.expense_type}
                          onChange={(e) => setFormData({ ...formData, expense_type: e.target.value })}
                        >
                          <option value="General">General</option>
                          <option value="Food">Food</option>
                          <option value="Office">Office</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Category</label>
                    <select
                      className="form-select"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      required
                    >
                      <option value="">Select Category</option>
                      <option value="Office Supplies">Office Supplies</option>
                      <option value="Meals">Meals</option>
                      <option value="Equipment">Equipment</option>
                      <option value="Utilities">Utilities</option>
                      <option value="Software">Software</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                    />
                  </div>
                  <div className="row">
                    <div className="col-md-6">
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
                    <div className="col-md-6">
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
                      placeholder="Additional notes or details"
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
                    {editingExpense ? 'Update' : 'Add'} General Expense
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
