import { useCallback } from 'react';
import apiClient from '../api/client';

export function useCloseTicket(fetchTickets) {
  return useCallback(async (ticketId) => {
    try {
      await apiClient.patch(`/tickets/${ticketId}/close`);
      if (fetchTickets) await fetchTickets();
      return { success: true };
    } catch (err) {
      console.error('Error closing ticket:', err);
      return { success: false, message: 'Failed to close ticket.' };
    }
  }, [fetchTickets]);
}
