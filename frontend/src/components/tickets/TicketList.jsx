import React, { useEffect, useState } from 'react';
import apiClient from '../../api/client';

const TicketList = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    fetchTickets();
  }, []);

  if (loading) {
    return <p className="text-white text-center text-xl">Loading tickets...</p>;
  }
  if (tickets.length === 0) {
    return <p className="text-center text-white dark:text-gray-100 text-xl py-12 bg-white/10 dark:bg-gray-800/30 rounded-xl">No tickets found</p>;
  }
  return (
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
            <p className="text-gray-800 dark:text-gray-100"><strong className="text-gray-900 dark:text-white">Description:</strong></p>
            <p className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg italic text-gray-600 dark:text-gray-200 mt-2">{ticket.description}</p>
          </div>
          {ticket.status === 'OPEN' && (
            <button 
              className="w-full mt-4 px-3 py-2 sm:px-4 sm:py-3 bg-gradient-to-r from-green-500 to-teal-500 dark:from-green-600 dark:to-teal-600 text-white font-semibold rounded-lg hover:opacity-90 hover:shadow-lg transition-all text-sm sm:text-base"
              onClick={() => handleCloseTicket(ticket.id)}
            >
              ✓ Close Ticket
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default TicketList;
