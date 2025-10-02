'use client'

import { useState, useEffect } from 'react'

export default function Settings() {
  const [settings, setSettings] = useState({
    travelRate: 10,
    workingHours: 8,
    lateThreshold: 30
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings')
      const result = await response.json()
      if (result.settings) {
        setSettings(result.settings)
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        alert('Settings saved successfully!')
      } else {
        throw new Error('Failed to save settings')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Failed to save settings. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all settings to default values?')) {
      setSettings({
        travelRate: 10,
        workingHours: 8,
        lateThreshold: 30
      })
    }
  }

  return (
    <div>
      <h1 className="h2 mb-4">Settings</h1>

      <div className="row">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Application Settings</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSave}>
                <div className="mb-3">
                  <label className="form-label">Travel Rate per Kilometer (₹)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={settings.travelRate}
                    onChange={(e) => setSettings({ ...settings, travelRate: parseFloat(e.target.value) || 0 })}
                    min="0"
                    step="0.01"
                  />
                  <div className="form-text">Rate charged per kilometer for travel expenses</div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Standard Working Hours</label>
                  <input
                    type="number"
                    className="form-control"
                    value={settings.workingHours}
                    onChange={(e) => setSettings({ ...settings, workingHours: parseInt(e.target.value) || 8 })}
                    min="1"
                    max="24"
                  />
                  <div className="form-text">Default working hours per day</div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Late Arrival Threshold (minutes)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={settings.lateThreshold}
                    onChange={(e) => setSettings({ ...settings, lateThreshold: parseInt(e.target.value) || 30 })}
                    min="1"
                    max="120"
                  />
                  <div className="form-text">Minutes after which arrival is considered late</div>
                </div>

                <div className="d-flex gap-2">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-2"></i>
                        Save Settings
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={handleReset}
                  >
                    <i className="bi bi-arrow-clockwise me-2"></i>
                    Reset to Default
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">System Information</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <strong>Application Version:</strong><br />
                <span className="text-muted">3.0.0</span>
              </div>
              <div className="mb-3">
                <strong>Database:</strong><br />
                <span className="text-muted">Supabase PostgreSQL</span>
              </div>
              <div className="mb-3">
                <strong>Framework:</strong><br />
                <span className="text-muted">Next.js 15</span>
              </div>
              <div className="mb-3">
                <strong>Last Updated:</strong><br />
                <span className="text-muted">{new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="card mt-3">
            <div className="card-header">
              <h5 className="card-title mb-0">Danger Zone</h5>
            </div>
            <div className="card-body">
              <p className="text-muted small mb-3">
                These actions are destructive and cannot be undone.
              </p>
              <button className="btn btn-outline-danger btn-sm">
                <i className="bi bi-trash me-2"></i>
                Clear All Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
