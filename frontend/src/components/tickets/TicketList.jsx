
import React, { useState, useEffect } from 'react';
import { useTicketList } from '../../hooks/useTicketList';
import { useCreateTicket } from '../../hooks/useCreateTicket';
import { useCloseTicket } from '../../hooks/useCloseTicket';
import { useDeleteTicket } from '../../hooks/useDeleteTicket';
import CreateTicketModal from './CreateTicketModal';
import { TicketCard } from './TicketCard';

// Helper to confirm and execute an action with success/error alerts
async function confirmAndExecute({ message, action, successMsg, errorMsg }) {
  if (!window.confirm(message)) return;
  const result = await action();
  if (result.success) {
    alert(successMsg);
  } else {
    alert(result.message || errorMsg);
  }
}


const TicketList = () => {
  const { tickets, loading, error, fetchTickets } = useTicketList();
  const createTicket = useCreateTicket(fetchTickets);
  const closeTicket = useCloseTicket(fetchTickets);
  const deleteTicket = useDeleteTicket(fetchTickets);
  const [showModal, setShowModal] = useState(false);
  const [assets, setAssets] = useState([]);
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [type, setType] = useState('general');
  const [extraData, setExtraData] = useState({});

  const fetchAssets = async () => {
    try {
      const response = await import('../../api/client').then(({ default: api }) => api.get('/assets'));
      setAssets(response.data);
    } catch {
      setAssets([]);
    }
  };

  const handleCloseTicket = (ticketId) =>
    confirmAndExecute({
      message: 'Are you sure you want to close this ticket?',
      action: () => closeTicket(ticketId),
      successMsg: 'Ticket closed successfully!',
      errorMsg: 'Failed to close ticket.',
    });

  const handleDeleteTicket = (ticketId) =>
    confirmAndExecute({
      message: 'Are you sure you want to delete this ticket?',
      action: () => deleteTicket(ticketId),
      successMsg: 'Ticket deleted successfully!',
      errorMsg: 'Failed to delete ticket.',
    });

  const handleOpenModal = () => {
    setShowModal(true);
    setDescription('');
    setSelectedAssetId('');
    setType('general');
    setFormError('');
    setExtraData({});
    fetchAssets();
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setDescription('');
    setSelectedAssetId('');
    setType('general');
    setFormError('');
    setExtraData({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAssetId || !description.trim() || !type) {
      setFormError('Please select an asset, type, and enter a description.');
      return;
    }
    setSubmitting(true);
    setFormError('');
    const result = await createTicket({ assetId: selectedAssetId, description: description.trim(), type, extraData });
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
        type={type}
        setType={setType}
        submitting={submitting}
        error={formError}
        onSubmit={handleSubmit}
        extraData={extraData}
        setExtraData={setExtraData}
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
