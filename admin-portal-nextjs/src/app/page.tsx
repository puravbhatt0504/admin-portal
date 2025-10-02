'use client'

import { useState, useEffect } from 'react'
import Dashboard from '@/components/Dashboard'
import Employees from '@/components/Employees'
import Attendance from '@/components/Attendance'
import Expenses from '@/components/Expenses'
import GeneralExpenses from '@/components/GeneralExpenses'
import TravelExpenses from '@/components/TravelExpenses'
import Reports from '@/components/Reports'
import Settings from '@/components/Settings'

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    // Load dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode') === 'true'
    setDarkMode(savedDarkMode)

    // Listen for navigation events from child components
    const handleNavigate = (event: CustomEvent) => {
      setActiveTab(event.detail)
    }

    window.addEventListener('navigate', handleNavigate as EventListener)
    
    return () => {
      window.removeEventListener('navigate', handleNavigate as EventListener)
    }
  }, [])

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    localStorage.setItem('darkMode', newDarkMode.toString())
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />
      case 'employees':
        return <Employees />
      case 'attendance':
        return <Attendance />
      case 'expenses':
        return <Expenses />
      case 'general-expenses':
        return <GeneralExpenses />
      case 'travel-expenses':
        return <TravelExpenses />
      case 'reports':
        return <Reports />
      case 'settings':
        return <Settings />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className={`min-vh-100 ${darkMode ? 'dark-theme' : 'light-theme'}`}>
      {/* Header */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container-fluid">
          <a className="navbar-brand d-flex align-items-center" href="#">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Company Logo" className="me-2" />
            Admin Portal
          </a>
          
          <div className="d-flex align-items-center">
            <button 
              className="btn btn-outline-light me-3"
              onClick={toggleDarkMode}
            >
              <i className={`bi ${darkMode ? 'bi-sun' : 'bi-moon'}`}></i>
              {darkMode ? 'Light' : 'Dark'} Mode
            </button>
          </div>
        </div>
      </nav>

      <div className="container-fluid">
        <div className="row">
          {/* Sidebar */}
          <nav className="col-md-3 col-lg-2 d-md-block bg-light sidebar">
            <div className="position-sticky pt-3">
              <ul className="nav flex-column">
                <li className="nav-item">
                  <a 
                    className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
                    href="#"
                    onClick={(e) => { e.preventDefault(); setActiveTab('dashboard') }}
                  >
                    <i className="bi bi-speedometer2 me-2"></i>
                    Dashboard
                  </a>
                </li>
                <li className="nav-item">
                  <a 
                    className={`nav-link ${activeTab === 'employees' ? 'active' : ''}`}
                    href="#"
                    onClick={(e) => { e.preventDefault(); setActiveTab('employees') }}
                  >
                    <i className="bi bi-people me-2"></i>
                    Employees
                  </a>
                </li>
                <li className="nav-item">
                  <a 
                    className={`nav-link ${activeTab === 'attendance' ? 'active' : ''}`}
                    href="#"
                    onClick={(e) => { e.preventDefault(); setActiveTab('attendance') }}
                  >
                    <i className="bi bi-calendar-check me-2"></i>
                    Attendance
                  </a>
                </li>
                <li className="nav-item">
                  <a 
                    className={`nav-link ${activeTab === 'expenses' ? 'active' : ''}`}
                    href="#"
                    onClick={(e) => { e.preventDefault(); setActiveTab('expenses') }}
                  >
                    <i className="bi bi-credit-card me-2"></i>
                    All Expenses
                  </a>
                </li>
                <li className="nav-item">
                  <a 
                    className={`nav-link ${activeTab === 'general-expenses' ? 'active' : ''}`}
                    href="#"
                    onClick={(e) => { e.preventDefault(); setActiveTab('general-expenses') }}
                  >
                    <i className="bi bi-briefcase me-2"></i>
                    General Expenses
                  </a>
                </li>
                <li className="nav-item">
                  <a 
                    className={`nav-link ${activeTab === 'travel-expenses' ? 'active' : ''}`}
                    href="#"
                    onClick={(e) => { e.preventDefault(); setActiveTab('travel-expenses') }}
                  >
                    <i className="bi bi-car-front me-2"></i>
                    Travel Expenses
                  </a>
                </li>
                <li className="nav-item">
                  <a 
                    className={`nav-link ${activeTab === 'reports' ? 'active' : ''}`}
                    href="#"
                    onClick={(e) => { e.preventDefault(); setActiveTab('reports') }}
                  >
                    <i className="bi bi-file-earmark-text me-2"></i>
                    Reports
                  </a>
                </li>
                <li className="nav-item">
                  <a 
                    className={`nav-link ${activeTab === 'settings' ? 'active' : ''}`}
                    href="#"
                    onClick={(e) => { e.preventDefault(); setActiveTab('settings') }}
                  >
                    <i className="bi bi-gear me-2"></i>
                    Settings
                  </a>
                </li>
              </ul>
            </div>
          </nav>

          {/* Main content */}
          <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
            <div className="pt-3 pb-2 mb-3">
              {renderContent()}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}