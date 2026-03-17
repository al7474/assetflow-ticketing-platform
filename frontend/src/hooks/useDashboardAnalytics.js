import { useState, useEffect } from 'react';
import apiClient from '../api/client';

/**
 * Custom hook to fetch dashboard analytics data.
 * Returns: { analytics, loading, error, refetch }
 */
export function useDashboardAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/analytics/dashboard');
      setAnalytics(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { analytics, loading, error, refetch: fetchAnalytics };
}
