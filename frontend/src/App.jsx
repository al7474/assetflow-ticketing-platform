import { useState, useEffect } from 'react'
import apiClient from './api/client'
import { useAuth } from './context/AuthContext'
import Login from './components/Login'
import Register from './components/Register'
import './App.css'

function App() {
  const { user, loading: authLoading, logout, isAdmin } = useAuth()
  const [showRegister, setShowRegister] = useState(false)
  const [assets, setAssets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedAsset, setSelectedAsset] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [viewMode, setViewMode] = useState('assets') // 'assets' or 'admin'
  const [tickets, setTickets] = useState([])
  const [loadingTickets, setLoadingTickets] = useState(false)

  // Fetch assets from API
  useEffect(() => {
    if (user) {
      fetchAssets()
    }
  }, [user])

  useEffect(() => {
    if (user && viewMode === 'admin') {
      fetchTickets()
    }
  }, [user, viewMode])

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

  const fetchTickets = async () => {
    try {
      setLoadingTickets(true)
      const response = await apiClient.get('/tickets')
      setTickets(response.data)
    } catch (err) {
      console.error('Error fetching tickets:', err)
      alert('Failed to load tickets')
    } finally {
      setLoadingTickets(false)
    }
  }

  const handleCloseTicket = async (ticketId) => {
    if (!confirm('Are you sure you want to close this ticket?')) {
      return
    }

    try {
      await apiClient.patch(`/tickets/${ticketId}/close`)
      alert('Ticket closed successfully!')
      fetchTickets() // Refresh the list
    } catch (err) {
      console.error('Error closing ticket:', err)
      alert('Failed to close ticket')
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

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
        <p className="text-white text-xl">Loading...</p>
      </div>
    )
  }

  // Show login/register if not authenticated
  if (!user) {
    if (showRegister) {
      return <Register onSwitchToLogin={() => setShowRegister(false)} />
    }
    return <Login onSwitchToRegister={() => setShowRegister(true)} />
  }

  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center"><p className="text-white text-xl">Loading assets...</p></div>
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-8">
        <div className="bg-white rounded-lg p-6 text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button onClick={fetchAssets} className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600">Retry</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header with user info and logout */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-2">🖥️ AssetFlow</h1>
            <p className="text-white/90 text-lg">Welcome, {user.name} {isAdmin && '(Admin)'}</p>
          </div>
          <button 
            onClick={logout}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition"
          >
            Logout
          </button>
        </div>

        {/* View Toggle - Only show admin tab if user is admin */}
        <div className="flex gap-4 justify-center mb-8">
          <button 
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              viewMode === 'assets' 
                ? 'bg-white border-2 border-indigo-500 text-indigo-600' 
                : 'bg-white/90 text-gray-700 hover:bg-white hover:-translate-y-0.5'
            }`}
            onClick={() => setViewMode('assets')}
          >
            📦 Assets
          </button>
          {isAdmin && (
            <button 
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                viewMode === 'admin' 
                  ? 'bg-white border-2 border-indigo-500 text-indigo-600' 
                  : 'bg-white/90 text-gray-700 hover:bg-white hover:-translate-y-0.5'
              }`}
              onClick={() => setViewMode('admin')}
            >
              🎫 Admin: Tickets
            </button>
          )}
        </div>

        {/* Assets View */}
        {viewMode === 'assets' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assets.map((asset) => (
              <div key={asset.id} className="bg-white rounded-xl p-6 shadow-lg hover:-translate-y-1 hover:shadow-xl transition-all">
                <h3 className="text-xl font-bold text-gray-800 mb-4">{asset.name}</h3>
                <p className="text-gray-600 mb-2">
                  <strong>Serial:</strong> {asset.serialNumber}
                </p>
                <p className="text-gray-600 mb-3">
                  <strong>Type:</strong> {asset.type}
                </p>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase mb-4 ${
                  asset.status === 'OPERATIONAL' ? 'bg-green-100 text-green-800' :
                  asset.status === 'REPAIR' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {asset.status}
                </span>
                <button 
                  className="w-full px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity mt-2"
                  onClick={() => handleReportClick(asset)}
                >
                  📋 Report Failure
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Admin View */}
        {viewMode === 'admin' && (
          <div>
            {loadingTickets ? (
              <p className="text-white text-center text-xl">Loading tickets...</p>
            ) : tickets.length === 0 ? (
              <p className="text-center text-white text-xl py-12 bg-white/10 rounded-xl">No tickets found</p>
            ) : (
              <div className="space-y-6">
                {tickets.map((ticket) => (
                  <div key={ticket.id} className={`bg-white rounded-xl p-6 shadow-lg border-l-4 ${
                    ticket.status === 'CLOSED' ? 'border-gray-400 opacity-70' : 'border-indigo-500'
                  }`}>
                    <div className="flex justify-between items-center mb-4 pb-4 border-b-2 border-gray-100">
                      <h3 className="text-xl font-bold text-gray-800">Ticket #{ticket.id}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                        ticket.status === 'OPEN' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {ticket.status}
                      </span>
                    </div>
                    
                    <div className="text-gray-700 space-y-2">
                      <p><strong className="text-gray-900">Equipment:</strong> {ticket.asset.name} ({ticket.asset.serialNumber})</p>
                      <p><strong className="text-gray-900">Type:</strong> {ticket.asset.type}</p>
                      <p><strong className="text-gray-900">Reported by:</strong> {ticket.user.name} ({ticket.user.email})</p>
                      <p><strong className="text-gray-900">Date:</strong> {new Date(ticket.createdAt).toLocaleString()}</p>
                      <p><strong className="text-gray-900">Description:</strong></p>
                      <p className="bg-gray-50 p-4 rounded-lg italic text-gray-600 mt-2">{ticket.description}</p>
                    </div>

                    {ticket.status === 'OPEN' && (
                      <button 
                        className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
                        onClick={() => handleCloseTicket(ticket.id)}
                      >
                        ✓ Close Ticket
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={handleCloseModal}>
            <div className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Report Failure</h2>
              <p className="text-gray-600 mb-6 pb-4 border-b border-gray-200">
                <strong>Equipment:</strong> {selectedAsset.name} ({selectedAsset.serialNumber})
              </p>
              
              <form onSubmit={handleSubmitReport}>
                <div className="mb-6">
                  <label htmlFor="description" className="block text-gray-800 font-semibold mb-2">Describe the issue:</label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="E.g., Screen not turning on, keyboard not working..."
                    rows="5"
                    required
                    disabled={submitting}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none resize-vertical disabled:bg-gray-100"
                  />
                </div>

                <div className="flex gap-4 justify-end">
                  <button 
                    type="button" 
                    onClick={handleCloseModal}
                    className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
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
    </div>
  )
}

export default App
