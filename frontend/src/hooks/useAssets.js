import { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/client';

/**
 * Custom hook to manage assets list, loading, error, and CRUD operations.
 * Returns: { assets, loading, error, fetchAssets, deleteAsset }
 */
export function useAssets(user) {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAssets = useCallback(async () => {
    if (!user) return;
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
  }, [user]);

  const deleteAsset = useCallback(async (assetId) => {
    try {
      await apiClient.delete(`/assets/${assetId}`);
      fetchAssets();
      return { success: true };
    } catch (err) {
      let message = 'Failed to delete asset.';
      if (err.response && err.response.data && err.response.data.error === 'Cannot delete asset: tickets exist for this asset.') {
        message = 'Cannot delete asset: tickets exist for this asset. Please delete all related tickets first.';
      }
      console.error('Error deleting asset:', err);
      return { success: false, message };
    }
  }, [fetchAssets]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  return { assets, loading, error, fetchAssets, deleteAsset };
}
