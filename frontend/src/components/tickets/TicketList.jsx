import React, { useEffect, useState } from 'react';
import apiClient from '../../api/client';
import CreateTicketModal from './CreateTicketModal';


const TicketList = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [assets, setAssets] = useState([]);
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/tickets');
      setTickets(response.data);
    } catch (err) {
      console.error('Error fetching tickets:', err);
      alert('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const fetchAssets = async () => {
    try {
      const response = await apiClient.get('/assets');
      setAssets(response.data);
    } catch (err) {
      setAssets([]);
    }
  };

  const handleCloseTicket = async (ticketId) => {
    if (!window.confirm('Are you sure you want to close this ticket?')) return;
    try {
      await apiClient.patch(`/tickets/${ticketId}/close`);
      alert('Ticket closed successfully!');
      fetchTickets();
    } catch (err) {
      alert('Failed to close ticket.');
      console.error('Error closing ticket:', err);
    }
  };

  const handleDeleteTicket = async (ticketId) => {
    if (!window.confirm('Are you sure you want to delete this ticket?')) return;
    try {
      await apiClient.delete(`/tickets/${ticketId}`);
      alert('Ticket deleted successfully!');
      fetchTickets();
    } catch (err) {
      alert('Failed to delete ticket.');
      console.error('Error deleting ticket:', err);
    }
  };

  const handleOpenModal = () => {
    setShowModal(true);
    setDescription('');
    setSelectedAssetId('');
    setError('');
    fetchAssets();
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setDescription('');
    setSelectedAssetId('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAssetId || !description.trim()) {
      setError('Please select an asset and enter a description.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await apiClient.post('/tickets', {
        assetId: selectedAssetId,
        description: description.trim(),
      });
      fetchTickets();
      handleCloseModal();
    } catch (err) {
      setError('Failed to create ticket.');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          onClick={handleOpenModal}
        >
          + Create Ticket
        </button>
      </div>

      <CreateTicketModal
        show={showModal}
        onClose={handleCloseModal}
        assets={assets}
        selectedAssetId={selectedAssetId}
        setSelectedAssetId={setSelectedAssetId}
        description={description}
        setDescription={setDescription}
        submitting={submitting}
        error={error}
        onSubmit={handleSubmit}
      />

      <div className="space-y-6">
        {loading ? (
          <p className="text-white text-center text-xl">Loading tickets...</p>
        ) : tickets.length === 0 ? (
          <p className="text-center text-white dark:text-gray-100 text-xl py-12 bg-white/10 dark:bg-gray-800/30 rounded-xl">No tickets found</p>
        ) : (
          tickets.map((ticket) => (
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
                <p className="text-gray-800 dark:text-gray-100"><strong className="text-gray-900 dark:text-white">Description:</strong></p>
                <p className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg italic text-gray-600 dark:text-gray-200 mt-2">{ticket.description}</p>
              </div>
              <div className="flex gap-2 mt-4">
                {ticket.status === 'OPEN' && (
                  <button
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-gradient-to-r from-green-500 to-teal-500 dark:from-green-600 dark:to-teal-600 text-white font-semibold rounded-lg hover:opacity-90 hover:shadow-lg transition-all text-sm sm:text-base"
                    onClick={() => handleCloseTicket(ticket.id)}
                  >
                    ✓ Close Ticket
                  </button>
                )}
                <button
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-gradient-to-r from-red-500 to-pink-500 dark:from-red-600 dark:to-pink-600 text-white font-semibold rounded-lg hover:opacity-90 hover:shadow-lg transition-all text-sm sm:text-base"
                  onClick={() => handleDeleteTicket(ticket.id)}
                >
                  🗑 Delete Ticket
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TicketList;
