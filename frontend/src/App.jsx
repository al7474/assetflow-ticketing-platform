import { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Dashboard from './components/Dashboard';
import PricingPage from './components/pricing/PricingPage';
import BillingPage from './components/billing/BillingPage';
import ThemeToggle from './components/ThemeToggle';
import { AssetList } from './components/assets';
import TicketList from './components/tickets';
import { ReportFailureModal } from './components/common';
import { Login, Register } from './components/auth';
import { Header, Navigation } from './components/nav';
import './App.css';

function App() {
  const { user, loading: authLoading, logout, isAdmin, organization } = useAuth();
  const [showRegister, setShowRegister] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState('dashboard'); // 'dashboard', 'assets', 'tickets', 'pricing', 'billing'

  // Modal handlers for reporting asset failure
  const handleReportClick = (asset) => {
    setSelectedAsset(asset);
    setShowModal(true);
    setDescription('');
  };
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedAsset(null);
    setDescription('');
  };
  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      alert('Please enter a description');
      return;
    }
    try {
      setSubmitting(true);
      // You may want to move this API call to a service or context
      await import('./api/client').then(({ default: apiClient }) =>
        apiClient.post('/tickets', {
          description: description.trim(),
          assetId: selectedAsset.id,
        })
      );
      alert('Report submitted successfully!');
      handleCloseModal();
      // Optionally trigger asset/ticket refresh here
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to submit report. Please try again.';
      alert(errorMessage);
      console.error('Error submitting report:', err);
    } finally {
      setSubmitting(false);
    }
  };

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

  // ...existing code...

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-gray-900 dark:to-gray-800 py-4 sm:py-6 md:py-8 px-2 sm:px-4 transition-colors duration-200">
      <div className="max-w-7xl mx-auto">
        <Header organization={organization} user={user} isAdmin={isAdmin} logout={logout} ThemeToggle={ThemeToggle} />
        <Navigation isAdmin={isAdmin} viewMode={viewMode} setViewMode={setViewMode} />

        {/* Dashboard View (Admin Only) */}
        {viewMode === 'dashboard' && isAdmin && <Dashboard />}

        {/* Pricing View */}
        {viewMode === 'pricing' && <PricingPage />}

        {/* Billing View */}
        {viewMode === 'billing' && <BillingPage />}

        {/* Assets View */}
        {viewMode === 'assets' && <AssetList user={user} isAdmin={isAdmin} />}

        {/* Tickets View (Admin Only) */}
        {viewMode === 'tickets' && isAdmin && <TicketList />}

        {/* Report Failure Modal */}
        <ReportFailureModal
          show={showModal}
          onClose={handleCloseModal}
          selectedAsset={selectedAsset}
          description={description}
          setDescription={setDescription}
          submitting={submitting}
          onSubmit={handleSubmitReport}
        />
      </div>
    </div>
  );
}

export default App
