'use client'

import { useState, useEffect } from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface DashboardData {
  totalEmployees: number
  presentToday: number
  lateToday: number
  absentToday: number
  totalExpenses: number
  recentAttendance: {
    employee_name: string
    action: string
    time: string
    status: string
  }[]
  expenseBreakdown: {
    category: string
    total: number
  }[]
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData>({
    totalEmployees: 0,
    presentToday: 0,
    lateToday: 0,
    absentToday: 0,
    totalExpenses: 0,
    recentAttendance: [],
    expenseBreakdown: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard')
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const chartData = {
    labels: ['Present', 'Late', 'Absent'],
    datasets: [
      {
        label: 'Today\'s Attendance',
        data: [data.presentToday, data.lateToday, data.absentToday],
        backgroundColor: ['#28a745', '#ffc107', '#dc3545'],
        borderColor: ['#28a745', '#ffc107', '#dc3545'],
        borderWidth: 1,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Today\'s Attendance Status',
      },
    },
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
      <h1 className="h2 mb-4">Dashboard</h1>
      
      {/* Corporate Stats Cards */}
      <div className="row mb-4">
        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card stats-card h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="icon me-3">
                  <i className="bi bi-people"></i>
                </div>
                <div>
                  <p className="mb-1">Total Employees</p>
                  <h3 className="mb-0">{data.totalEmployees}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card stats-card h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="icon me-3" style={{ background: 'rgba(5, 150, 105, 0.1)', color: '#059669' }}>
                  <i className="bi bi-check-circle"></i>
                </div>
                <div>
                  <p className="mb-1">Present Today</p>
                  <h3 className="mb-0">{data.presentToday}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card stats-card h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="icon me-3" style={{ background: 'rgba(217, 119, 6, 0.1)', color: '#d97706' }}>
                  <i className="bi bi-clock"></i>
                </div>
                <div>
                  <p className="mb-1">Late Today</p>
                  <h3 className="mb-0">{data.lateToday}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card stats-card h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="icon me-3" style={{ background: 'rgba(220, 38, 38, 0.1)', color: '#dc2626' }}>
                  <i className="bi bi-x-circle"></i>
                </div>
                <div>
                  <p className="mb-1">Absent Today</p>
                  <h3 className="mb-0">{data.absentToday}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Second Row - Expenses */}
      <div className="row mb-4">
        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card stats-card h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="icon me-3" style={{ background: 'rgba(8, 145, 178, 0.1)', color: '#0891b2' }}>
                  <i className="bi bi-credit-card"></i>
                </div>
                <div>
                  <p className="mb-1">Total Expenses (This Month)</p>
                  <h3 className="mb-0">₹{data.totalExpenses.toLocaleString()}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="row">
        <div className="col-xl-8 col-lg-7">
          <div className="card shadow mb-4">
            <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
              <h6 className="m-0 font-weight-bold text-primary">Attendance Overview</h6>
            </div>
            <div className="card-body">
              <div className="chart-area">
                <Bar data={chartData} options={chartOptions} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-4 col-lg-5">
          <div className="card shadow mb-4">
            <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
              <h6 className="m-0 font-weight-bold text-primary">Quick Actions</h6>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                <button className="btn btn-primary">
                  <i className="bi bi-person-plus me-2"></i>
                  Add Employee
                </button>
                <button className="btn btn-success">
                  <i className="bi bi-calendar-check me-2"></i>
                  Mark Attendance
                </button>
                <button className="btn btn-info">
                  <i className="bi bi-file-earmark-text me-2"></i>
                  Generate Report
                </button>
                <button className="btn btn-warning">
                  <i className="bi bi-gear me-2"></i>
                  Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="row">
        <div className="col-lg-12">
          <div className="card shadow mb-4">
            <div className="card-header py-3">
              <h6 className="m-0 font-weight-bold text-primary">Recent Activity</h6>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Action</th>
                      <th>Time</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentAttendance.map((item, index) => (
                      <tr key={index}>
                        <td>{item.employee_name}</td>
                        <td>{item.action}</td>
                        <td>{item.time}</td>
                        <td>
                          <span className={`badge ${item.status === 'Present' ? 'bg-success' : item.status === 'Late' ? 'bg-warning' : 'bg-danger'}`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
