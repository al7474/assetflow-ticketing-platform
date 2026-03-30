// TicketCard.jsx
// Reusable card component for displaying ticket info
import React from 'react';

export function TicketCard({ ticket, onClose, onDelete }) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border-l-4 ${
      ticket.status === 'CLOSED' ? 'border-gray-400 dark:border-gray-600 opacity-70' : 'border-indigo-500 dark:border-indigo-400'
    }`}>
      <div className="flex justify-between items-center mb-4 pb-4 border-b-2 border-gray-100 dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white">Ticket #{ticket.id}</h3>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase border ${
          ticket.status === 'OPEN'
            ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700'
            : 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 border-green-300 dark:border-green-700'
        }`}>
          {ticket.status}
        </span>
      </div>
      <div className="text-gray-700 dark:text-gray-100 space-y-2">
        <p className="text-gray-800 dark:text-gray-100"><strong className="text-gray-900 dark:text-white">Equipment:</strong> {ticket.asset.name} ({ticket.asset.serialNumber})</p>
        <p className="text-gray-800 dark:text-gray-100"><strong className="text-gray-900 dark:text-white">Ticket Type:</strong> {ticket.type}</p>
        <p className="text-gray-800 dark:text-gray-100"><strong className="text-gray-900 dark:text-white">Asset Type:</strong> {ticket.asset.type}</p>
        <p className="text-gray-800 dark:text-gray-100"><strong className="text-gray-900 dark:text-white">Reported by:</strong> {ticket.user.name} ({ticket.user.email})</p>
        <p className="text-gray-800 dark:text-gray-100"><strong className="text-gray-900 dark:text-white">Description:</strong></p>
        <p className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg italic text-gray-600 dark:text-gray-200 mt-2">{ticket.description}</p>
      </div>
      <div className="flex gap-2 mt-4">
        {ticket.status === 'OPEN' && (
          <button
            className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-gradient-to-r from-green-500 to-teal-500 dark:from-green-600 dark:to-teal-600 text-white font-semibold rounded-lg hover:opacity-90 hover:shadow-lg transition-all text-sm sm:text-base"
            onClick={() => onClose(ticket.id)}
          >
            ✓ Close Ticket
          </button>
        )}
        <button
          className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-gradient-to-r from-red-500 to-pink-500 dark:from-red-600 dark:to-pink-600 text-white font-semibold rounded-lg hover:opacity-90 hover:shadow-lg transition-all text-sm sm:text-base"
          onClick={() => onDelete(ticket.id)}
        >
          🗑 Delete Ticket
        </button>
      </div>
    </div>
  );
}
