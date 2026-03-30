import { useCallback } from 'react';
import apiClient from '../api/client';

export function useCreateTicket(fetchTickets) {
  return useCallback(
    async ({ assetId, description, type, extraData }) => {
      try {
        await apiClient.post('/tickets', { assetId, description, type, extraData });
        if (fetchTickets) await fetchTickets();
        return { success: true };
      } catch (err) {
        console.error('Error creating ticket:', err);
        return { success: false, message: 'Failed to create ticket.' };
      }
    },
    [fetchTickets]
  );
}
