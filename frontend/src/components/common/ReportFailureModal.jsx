import React from 'react';

const ReportFailureModal = ({ show, onClose, selectedAsset, description, setDescription, submitting, onSubmit }) => {
  if (!show || !selectedAsset) return null;
  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/80 flex items-center justify-center z-50 p-2 sm:p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-8 max-w-lg w-full shadow-2xl" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Report Failure</h2>
        <p className="text-gray-600 dark:text-gray-100 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
          <strong className="text-gray-900 dark:text-white">Equipment:</strong> {selectedAsset.name} ({selectedAsset.serialNumber})
        </p>
        <form onSubmit={onSubmit}>
          <div className="mb-6">
            <label htmlFor="description" className="block text-gray-900 dark:text-white font-bold mb-2">Describe the issue:</label>
            <textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="E.g., Screen not turning on, keyboard not working..."
              rows="4"
              required
              disabled={submitting}
              className="w-full px-3 py-2 sm:px-4 sm:py-3 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 rounded-lg focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none resize-vertical disabled:bg-gray-100 dark:disabled:bg-gray-600 text-sm sm:text-base"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition disabled:opacity-60"
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportFailureModal;
