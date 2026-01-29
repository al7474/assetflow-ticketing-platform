import { useState, useEffect } from 'react'
import apiClient from './api/client'
import './App.css'

function App() {
  const [assets, setAssets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedAsset, setSelectedAsset] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Fetch assets from API
  useEffect(() => {
    fetchAssets()
  }, [])

  const fetchAssets = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get('/assets')
      setAssets(response.data)
      setError(null)
    } catch (err) {
      setError('Failed to load assets. Please try again.')
      console.error('Error fetching assets:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleReportClick = (asset) => {
    setSelectedAsset(asset)
    setShowModal(true)
    setDescription('')
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedAsset(null)
    setDescription('')
  }

  const handleSubmitReport = async (e) => {
    e.preventDefault()
    
    if (!description.trim()) {
      alert('Please enter a description')
      return
    }

    try {
      setSubmitting(true)
      await apiClient.post('/tickets', {
        description: description.trim(),
        userId: 1, // TODO: Replace with actual logged-in user ID
        assetId: selectedAsset.id
      })
      
      alert('Report submitted successfully!')
      handleCloseModal()
      fetchAssets() // Refresh the list
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to submit report. Please try again.'
      alert(errorMessage)
      console.error('Error submitting report:', err)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="container"><p>Loading assets...</p></div>
  }

  if (error) {
    return (
      <div className="container">
        <p className="error">{error}</p>
        <button onClick={fetchAssets}>Retry</button>
      </div>
    )
  }

  return (
    <div className="container">
      <h1>🖥️ AssetFlow - IT Asset Management</h1>
      <p className="subtitle">Report equipment failures and track repairs</p>

      <div className="assets-grid">
        {assets.map((asset) => (
          <div key={asset.id} className="asset-card">
            <h3>{asset.name}</h3>
            <p className="asset-info">
              <strong>Serial:</strong> {asset.serialNumber}
            </p>
            <p className="asset-info">
              <strong>Type:</strong> {asset.type}
            </p>
            <p className={`asset-status status-${asset.status.toLowerCase()}`}>
              {asset.status}
            </p>
            <button 
              className="report-btn"
              onClick={() => handleReportClick(asset)}
            >
              📋 Report Failure
            </button>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Report Failure</h2>
            <p className="modal-subtitle">
              <strong>Equipment:</strong> {selectedAsset.name} ({selectedAsset.serialNumber})
            </p>
            
            <form onSubmit={handleSubmitReport}>
              <div className="form-group">
                <label htmlFor="description">Describe the issue:</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="E.g., Screen not turning on, keyboard not working..."
                  rows="5"
                  required
                  disabled={submitting}
                />
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  onClick={handleCloseModal}
                  className="btn-cancel"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-submit"
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
