import { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/client';

/**
 * Custom hook to manage tickets: fetch, create, close, delete.
 * Returns: { tickets, loading, error, fetchTickets, createTicket, closeTicket, deleteTicket }
 */
export function useTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/tickets');
      setTickets(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load tickets');
      console.error('Error fetching tickets:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createTicket = useCallback(async ({ assetId, description }) => {
    try {
      await apiClient.post('/tickets', { assetId, description });
      await fetchTickets();
      return { success: true };
    } catch (err) {
      console.error('Error creating ticket:', err);
      return { success: false, message: 'Failed to create ticket.' };
    }
  }, [fetchTickets]);

  const closeTicket = useCallback(async (ticketId) => {
    try {
      await apiClient.patch(`/tickets/${ticketId}/close`);
      await fetchTickets();
      return { success: true };
    } catch (err) {
      console.error('Error closing ticket:', err);
      return { success: false, message: 'Failed to close ticket.' };
    }
  }, [fetchTickets]);

  const deleteTicket = useCallback(async (ticketId) => {
    try {
      await apiClient.delete(`/tickets/${ticketId}`);
      await fetchTickets();
      return { success: true };
    } catch (err) {
      console.error('Error deleting ticket:', err);
      return { success: false, message: 'Failed to delete ticket.' };
    }
  }, [fetchTickets]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  return { tickets, loading, error, fetchTickets, createTicket, closeTicket, deleteTicket };
}
