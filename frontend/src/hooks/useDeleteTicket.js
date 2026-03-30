import { useCallback } from 'react';
import apiClient from '../api/client';

export function useDeleteTicket(fetchTickets) {
  return useCallback(async (ticketId) => {
    try {
      await apiClient.delete(`/tickets/${ticketId}`);
      if (fetchTickets) await fetchTickets();
      return { success: true };
    } catch (err) {
      console.error('Error deleting ticket:', err);
      return { success: false, message: 'Failed to delete ticket.' };
    }
  }, [fetchTickets]);
}
