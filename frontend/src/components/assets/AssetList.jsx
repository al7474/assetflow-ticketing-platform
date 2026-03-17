import { useState } from 'react';
import { useAssets } from '../../hooks/useAssets';
import CreateAsset from './CreateAsset';
import { AssetCard } from './AssetCard';

export default function AssetList({ user }) {
  const [showCreateAsset, setShowCreateAsset] = useState(false);
  const { assets, loading, error, fetchAssets, deleteAsset } = useAssets(user);

  const handleDeleteAsset = async (assetId) => {
    if (!window.confirm('Are you sure you want to delete this asset?')) return;
    const result = await deleteAsset(assetId);
    if (result.success) {
      alert('Asset deleted successfully!');
    } else {
      alert(result.message || 'Failed to delete asset.');
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
          <AssetCard key={asset.id} asset={asset} onDelete={handleDeleteAsset} />
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
