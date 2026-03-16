import { useState } from 'react';
import apiClient from '../../api/client';

export default function CreateAsset({ onAssetCreated }) {
  const [name, setName] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [type, setType] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await apiClient.post('/assets', { name, serialNumber, type });
      setName('');
      setSerialNumber('');
      setType('');
      if (onAssetCreated) onAssetCreated();
    } catch {
      setError('Failed to create asset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-gray-700 dark:text-gray-200 mb-2">Asset Name</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-indigo-500 dark:bg-gray-800 dark:text-white"
          required
        />
      </div>
      <div>
        <label className="block text-gray-700 dark:text-gray-200 mb-2">Serial Number</label>
        <input
          type="text"
          value={serialNumber}
          onChange={e => setSerialNumber(e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-indigo-500 dark:bg-gray-800 dark:text-white"
          required
        />
      </div>
      <div>
        <label className="block text-gray-700 dark:text-gray-200 mb-2">Type</label>
        <input
          type="text"
          value={type}
          onChange={e => setType(e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-indigo-500 dark:bg-gray-800 dark:text-white"
          required
        />
      </div>
      {error && <p className="text-red-600 dark:text-red-300">{error}</p>}
      <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700" disabled={loading}>
        {loading ? 'Creating...' : 'Create Asset'}
      </button>
    </form>
  );
}
