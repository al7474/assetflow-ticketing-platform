// AssetCard.jsx
// Reusable card component for displaying asset info
import React from 'react';

export function AssetCard({ asset, onDelete }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:-translate-y-1 hover:shadow-xl transition-all">
      <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 break-words">{asset.name}</h3>
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
      <div className="flex gap-2 mt-4">
        <button
          className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-gradient-to-r from-red-500 to-pink-500 dark:from-red-600 dark:to-pink-600 text-white font-semibold rounded-lg hover:opacity-90 hover:shadow-lg transition-all text-sm sm:text-base"
          onClick={() => onDelete(asset.id)}
        >
          🗑 Delete Asset
        </button>
      </div>
    </div>
  );
}
