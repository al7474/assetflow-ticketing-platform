import { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import CreateAsset from './CreateAsset';

export default function AssetList({ user, isAdmin }) {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateAsset, setShowCreateAsset] = useState(false);

  useEffect(() => {
    if (user) fetchAssets();
  }, [user]);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/assets');
      setAssets(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load assets. Please try again.');
      console.error('Error fetching assets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAsset = async (assetId) => {
    if (!window.confirm('Are you sure you want to delete this asset?')) return;
    try {
      await apiClient.delete(`/assets/${assetId}`);
      alert('Asset deleted successfully!');
      fetchAssets();
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error === 'Cannot delete asset: tickets exist for this asset.') {
        alert('Cannot delete asset: tickets exist for this asset. Please delete all related tickets first.');
      } else {
        alert('Failed to delete asset.');
      }
      console.error('Error deleting asset:', err);
    }
  };

  if (loading) return <div className="text-center text-lg text-gray-600 dark:text-gray-100 py-8">Loading assets...</div>;
  if (error) return <div className="text-center text-red-500 dark:text-red-300 py-8">{error}</div>;

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          onClick={() => setShowCreateAsset(true)}
        >
          + Create Asset
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        {assets.map((asset) => (
          <div key={asset.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:-translate-y-1 hover:shadow-xl transition-all">
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
                onClick={() => handleDeleteAsset(asset.id)}
              >
                🗑 Delete Asset
              </button>
            </div>
          </div>
        ))}
      </div>
      {showCreateAsset && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg max-w-md w-full">
            <CreateAsset onAssetCreated={() => { setShowCreateAsset(false); fetchAssets(); }} />
            <button className="mt-4 px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded-lg" onClick={() => setShowCreateAsset(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
