import React from 'react';

const CreateTicketModal = ({ show, onClose, assets, selectedAssetId, setSelectedAssetId, description, setDescription, submitting, error, onSubmit }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-2" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg max-w-md w-full" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Create Ticket</h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 dark:text-gray-200 mb-2">Asset</label>
            <select
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-indigo-500 dark:bg-gray-800 dark:text-white"
              value={selectedAssetId}
              onChange={e => setSelectedAssetId(e.target.value)}
              required
            >
              <option value="">Select an asset</option>
              {assets.map(asset => (
                <option key={asset.id} value={asset.id}>
                  {asset.name} ({asset.serialNumber})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-700 dark:text-gray-200 mb-2">Description</label>
            <textarea
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-indigo-500 dark:bg-gray-800 dark:text-white"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={4}
              required
            />
          </div>
          {error && <p className="text-red-600 dark:text-red-300">{error}</p>}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-60"
              disabled={submitting}
            >
              {submitting ? 'Creating...' : 'Create Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTicketModal;
