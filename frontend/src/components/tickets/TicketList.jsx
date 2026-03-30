import React, { useState, useEffect } from 'react';
import { useTickets } from '../../hooks/useTickets';
import CreateTicketModal from './CreateTicketModal';
import { TicketCard } from './TicketCard';


const TicketList = () => {
  const { tickets, loading, error, createTicket, closeTicket, deleteTicket } = useTickets();
  const [showModal, setShowModal] = useState(false);
  const [assets, setAssets] = useState([]);
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchAssets = async () => {
    try {
      const response = await import('../../api/client').then(({ default: api }) => api.get('/assets'));
      setAssets(response.data);
    } catch {
      setAssets([]);
    }
  };

  const handleCloseTicket = async (ticketId) => {
    if (!window.confirm('Are you sure you want to close this ticket?')) return;
    const result = await closeTicket(ticketId);
    if (result.success) {
      alert('Ticket closed successfully!');
    } else {
      alert(result.message || 'Failed to close ticket.');
    }
  };

  const handleDeleteTicket = async (ticketId) => {
    if (!window.confirm('Are you sure you want to delete this ticket?')) return;
    const result = await deleteTicket(ticketId);
    if (result.success) {
      alert('Ticket deleted successfully!');
    } else {
      alert(result.message || 'Failed to delete ticket.');
    }
  };

  const handleOpenModal = () => {
    setShowModal(true);
    setDescription('');
    setSelectedAssetId('');
    setFormError('');
    fetchAssets();
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setDescription('');
    setSelectedAssetId('');
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAssetId || !description.trim()) {
      setFormError('Please select an asset and enter a description.');
      return;
    }
    setSubmitting(true);
    setFormError('');
    const result = await createTicket({ assetId: selectedAssetId, description: description.trim() });
    if (result.success) {
      handleCloseModal();
    } else {
      setFormError(result.message || 'Failed to create ticket.');
    }
    setSubmitting(false);
  };


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
        error={formError}
        onSubmit={handleSubmit}
      />

      <div className="space-y-6">
        {loading ? (
          <p className="text-white text-center text-xl">Loading tickets...</p>
        ) : tickets.length === 0 ? (
          <p className="text-center text-white dark:text-gray-100 text-xl py-12 bg-white/10 dark:bg-gray-800/30 rounded-xl">No tickets found</p>
        ) : (
          tickets.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              onClose={handleCloseTicket}
              onDelete={handleDeleteTicket}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default TicketList;
