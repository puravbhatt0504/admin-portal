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

export default function Expenses() {
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
      setExpenses(result.expenses || [])
    } catch (error) {
      console.error('Error loading expenses:', error)
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
    try {
      const url = editingExpense ? `/api/expenses/${editingExpense.id}` : '/api/expenses'
      const method = editingExpense ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setShowModal(false)
        setEditingExpense(null)
        setFormData({
          employee_id: '',
          category: '',
          description: '',
          amount: '',
          date: new Date().toISOString().split('T')[0],
          status: 'Pending'
        })
        loadExpenses()
      }
    } catch (error) {
      console.error('Error saving expense:', error)
    }
  }

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense)
    setFormData({
      employee_id: expense.employee_name,
      category: expense.category,
      description: expense.description,
      amount: expense.amount.toString(),
      date: expense.date,
      status: expense.status
    })
    setShowModal(true)
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        const response = await fetch(`/api/expenses/${id}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          loadExpenses()
        }
      } catch (error) {
        console.error('Error deleting expense:', error)
      }
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
            <i className="bi bi-credit-card me-2"></i>
            All Expenses
          </h1>
          <p className="text-muted mb-0">Overview of all expenses - General and Travel</p>
        </div>
        <div className="btn-group">
          <button className="btn btn-outline-primary" onClick={() => {
            // This will be handled by the parent component
            const event = new CustomEvent('navigate', { detail: 'general-expenses' })
            window.dispatchEvent(event)
          }}>
            <i className="bi bi-briefcase me-2"></i>
            General Expenses
          </button>
          <button className="btn btn-outline-info" onClick={() => {
            // This will be handled by the parent component
            const event = new CustomEvent('navigate', { detail: 'travel-expenses' })
            window.dispatchEvent(event)
          }}>
            <i className="bi bi-car-front me-2"></i>
            Travel Expenses
          </button>
        </div>
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
                  <h3 className="mb-0 text-success">₹{expenses.reduce((sum, exp) => sum + exp.amount, 0).toLocaleString()}</h3>
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
                  <h3 className="mb-0 text-info">{expenses.filter(exp => exp.expense_type !== 'Travel').length}</h3>
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
                  <i className="bi bi-car-front"></i>
                </div>
                <div>
                  <p className="mb-1">Travel</p>
                  <h3 className="mb-0 text-primary">{expenses.filter(exp => exp.expense_type === 'Travel').length}</h3>
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
                  <h3 className="mb-0 text-warning">{expenses.length}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
                  <th>KM</th>
                  <th>Receipt</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense.id}>
                    <td>{expense.employee_name}</td>
                    <td>
                      <span className={`badge ${
                        expense.expense_type === 'Travel' ? 'bg-primary' :
                        expense.expense_type === 'Food' ? 'bg-success' :
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
                      {expense.kilometers ? `${expense.kilometers} km` : '-'}
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
                <h5 className="modal-title">
                  {editingExpense ? 'Edit Expense' : 'Add Expense'}
                </h5>
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
                        <option key={employee.id} value={employee.id}>
                          {employee.name}
                        </option>
                      ))}
                    </select>
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
                      <option value="Travel">Travel</option>
                      <option value="Meals">Meals</option>
                      <option value="Office Supplies">Office Supplies</option>
                      <option value="Equipment">Equipment</option>
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
                  <div className="mb-3">
                    <label className="form-label">Expense Type</label>
                    <select
                      className="form-select"
                      value={formData.expense_type}
                      onChange={(e) => setFormData({ ...formData, expense_type: e.target.value })}
                    >
                      <option value="General">General</option>
                      <option value="Travel">Travel</option>
                      <option value="Food">Food</option>
                      <option value="Office">Office</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Kilometers (for travel expenses)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.kilometers}
                      onChange={(e) => setFormData({ ...formData, kilometers: e.target.value })}
                      min="0"
                      step="0.1"
                      placeholder="Enter kilometers if applicable"
                    />
                  </div>
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
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingExpense ? 'Update' : 'Add'} Expense
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
