import { useState, useEffect } from 'react'
import apiClient from './api/client'
import { useAuth } from './context/AuthContext'
import Login from './components/Login'
import Register from './components/Register'
import Dashboard from './components/Dashboard'
import PricingPage from './components/PricingPage'
import BillingPage from './components/BillingPage'
import ThemeToggle from './components/ThemeToggle'
import './App.css'

function App() {
  const { user, loading: authLoading, logout, isAdmin, organization } = useAuth()
  const [showRegister, setShowRegister] = useState(false)
  const [assets, setAssets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedAsset, setSelectedAsset] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [viewMode, setViewMode] = useState('dashboard') // 'dashboard', 'assets', 'tickets', 'pricing', 'billing'
  const [tickets, setTickets] = useState([])
  const [loadingTickets, setLoadingTickets] = useState(false)

  // Fetch assets from API
  useEffect(() => {
    if (user) {
      fetchAssets()
    }
  }, [user])

  useEffect(() => {
    if (user && viewMode === 'tickets') {
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
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-indigo-900 dark:to-purple-900 flex items-center justify-center">
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
    return <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-indigo-900 dark:to-purple-900 flex items-center justify-center"><p className="text-white text-xl">Loading assets...</p></div>
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-indigo-900 dark:to-purple-900 flex items-center justify-center p-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center">
          <p className="text-red-500 dark:text-red-300 mb-4">{error}</p>
          <button onClick={fetchAssets} className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600">Retry</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-gray-900 dark:to-gray-800 py-8 px-4 transition-colors duration-200">
      <div className="max-w-7xl mx-auto">
        {/* Header with user info and logout */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2 text-white">
              🖥️ AssetFlow
            </h1>
            <p className="text-white/90 text-lg">
              {organization?.name} - {user.name} {isAdmin && '(Admin)'}
            </p>
          </div>
          <div className="flex gap-3 items-center">
            <ThemeToggle />
            <button 
              onClick={logout}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 dark:bg-gray-800/50 dark:hover:bg-gray-700/50 text-white rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex gap-4 justify-center mb-8 flex-wrap">
          {isAdmin && (
            <button 
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                viewMode === 'dashboard' 
                  ? 'bg-white dark:bg-gray-700 border-2 border-indigo-500 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400' 
                  : 'bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 hover:-translate-y-0.5'
              }`}
              onClick={() => setViewMode('dashboard')}
            >
              📊 Dashboard
            </button>
          )}
          <button 
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              viewMode === 'assets' 
                ? 'bg-white dark:bg-gray-700 border-2 border-indigo-500 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400' 
                : 'bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 hover:-translate-y-0.5'
            }`}
            onClick={() => setViewMode('assets')}
          >
            📦 Assets
          </button>
          {isAdmin && (
            <button 
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                viewMode === 'tickets' 
                  ? 'bg-white dark:bg-gray-700 border-2 border-indigo-500 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400' 
                  : 'bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 hover:-translate-y-0.5'
              }`}
              onClick={() => setViewMode('tickets')}
            >
              🎫 Tickets
            </button>
          )}
          <button 
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              viewMode === 'pricing' 
                ? 'bg-white dark:bg-gray-700 border-2 border-indigo-500 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400' 
                : 'bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 hover:-translate-y-0.5'
            }`}
            onClick={() => setViewMode('pricing')}
          >
            💎 Pricing
          </button>
          <button 
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              viewMode === 'billing' 
                ? 'bg-white dark:bg-gray-700 border-2 border-indigo-500 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400' 
                : 'bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 hover:-translate-y-0.5'
            }`}
            onClick={() => setViewMode('billing')}
          >
            💳 Billing
          </button>
        </div>

        {/* Dashboard View (Admin Only) */}
        {viewMode === 'dashboard' && isAdmin && (
          <Dashboard />
        )}

        {/* Pricing View */}
        {viewMode === 'pricing' && (
          <PricingPage />
        )}

        {/* Billing View */}
        {viewMode === 'billing' && (
          <BillingPage />
        )}

        {/* Assets View */}
        {viewMode === 'assets' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assets.map((asset) => (
              <div key={asset.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:-translate-y-1 hover:shadow-xl transition-all">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{asset.name}</h3>
                <p className="text-gray-700 dark:text-gray-100 mb-2">
                  <strong className="text-gray-900 dark:text-white">Serial:</strong> {asset.serialNumber}
                </p>
                <p className="text-gray-700 dark:text-gray-100 mb-3">
                  <strong className="text-gray-900 dark:text-white">Type:</strong> {asset.type}
                </p>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase mb-4 ${
                  asset.status === 'OPERATIONAL' ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-700' :
                  asset.status === 'REPAIR' ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-700' :
                  'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-700'
                }`}>
                  {asset.status}
                </span>
                <button 
                  className="w-full px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-blue-500 dark:to-indigo-600 text-white font-bold rounded-lg hover:opacity-90 hover:shadow-xl hover:scale-[1.02] transition-all mt-2 shadow-lg"
                  onClick={() => handleReportClick(asset)}
                >
                  📋 Report Failure
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Tickets View (Admin Only) */}
        {viewMode === 'tickets' && isAdmin && (
          <div>
            {loadingTickets ? (
              <p className="text-white text-center text-xl">Loading tickets...</p>
            ) : tickets.length === 0 ? (
              <p className="text-center text-white dark:text-gray-100 text-xl py-12 bg-white/10 dark:bg-gray-800/30 rounded-xl">No tickets found</p>
            ) : (
              <div className="space-y-6">
                {tickets.map((ticket) => (
                  <div key={ticket.id} className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border-l-4 ${
                    ticket.status === 'CLOSED' ? 'border-gray-400 dark:border-gray-600 opacity-70' : 'border-indigo-500 dark:border-indigo-400'
                  }`}>
                    <div className="flex justify-between items-center mb-4 pb-4 border-b-2 border-gray-100 dark:border-gray-700">
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white">Ticket #{ticket.id}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase border ${
                        ticket.status === 'OPEN' ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700' : 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 border-green-300 dark:border-green-700'
                      }`}>
                        {ticket.status}
                      </span>
                    </div>
                    
                    <div className="text-gray-700 dark:text-gray-100 space-y-2">
                      <p className="text-gray-800 dark:text-gray-100"><strong className="text-gray-900 dark:text-white">Equipment:</strong> {ticket.asset.name} ({ticket.asset.serialNumber})</p>
                      <p className="text-gray-800 dark:text-gray-100"><strong className="text-gray-900 dark:text-white">Type:</strong> {ticket.asset.type}</p>
                      <p className="text-gray-800 dark:text-gray-100"><strong className="text-gray-900 dark:text-white">Reported by:</strong> {ticket.user.name} ({ticket.user.email})</p>
                      <p className="text-gray-800 dark:text-gray-100"><strong className="text-gray-900 dark:text-white">Date:</strong> {new Date(ticket.createdAt).toLocaleString()}</p>
                      <p className="text-gray-800 dark:text-gray-100"><strong className="text-gray-900 dark:text-white">Description:</strong></p>
                      <p className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg italic text-gray-600 dark:text-gray-200 mt-2">{ticket.description}</p>
                    </div>

                    {ticket.status === 'OPEN' && (
                      <button 
                        className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-green-500 to-teal-500 dark:from-green-600 dark:to-teal-600 text-white font-semibold rounded-lg hover:opacity-90 hover:shadow-lg transition-all"
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
          <div className="fixed inset-0 bg-black/60 dark:bg-black/80 flex items-center justify-center z-50 p-4" onClick={handleCloseModal}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-lg w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Report Failure</h2>
              <p className="text-gray-600 dark:text-gray-100 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                <strong className="text-gray-900 dark:text-white">Equipment:</strong> {selectedAsset.name} ({selectedAsset.serialNumber})
              </p>
              
              <form onSubmit={handleSubmitReport}>
                <div className="mb-6">
                  <label htmlFor="description" className="block text-gray-900 dark:text-white font-bold mb-2">Describe the issue:</label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="E.g., Screen not turning on, keyboard not working..."
                    rows="5"
                    required
                    disabled={submitting}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 rounded-lg focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none resize-vertical disabled:bg-gray-100 dark:disabled:bg-gray-600"
                  />
                </div>

                <div className="flex gap-4 justify-end">
                  <button 
                    type="button" 
                    onClick={handleCloseModal}
                    className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 font-bold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-blue-500 dark:to-indigo-600 text-white font-bold rounded-lg hover:opacity-90 hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg"
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
