/**
 * Ticket controller
 * Business logic for ticket-related operations
 */


import ticketService from '../services/ticket.service.js';
import assetService from '../services/asset.service.js';
import { sendTicketNotification } from '../utils/email.js';

class TicketController {
  /**
   * Create new ticket
   */
  async createTicket(req, res) {
    try {
      const { description } = req.body;
      // Asset is already validated and attached to req.asset by middleware
      // Open ticket validation is already done by middleware

      // Delegate business logic to the service
      const newTicket = await ticketService.createTicketWithNotification({
        description,
        asset: req.asset,
        userId: req.user.id,
        organizationId: req.organizationId
      });
      res.json(newTicket);
    } catch (error) {
      console.error('Create ticket error:', error);
      res.status(500).json({ error: 'Failed to create ticket' });
    }
  }

  /**
   * Get all tickets (Admin only)
   */
  async getTickets(req, res) {
    try {
      const tickets = await ticketService.getTicketsByOrganization(req.organizationId);
      res.json(tickets);
    } catch (error) {
      console.error('Fetch tickets error:', error);
      res.status(500).json({ error: 'Failed to fetch tickets' });
    }
  }

  /**
   * Delete ticket (Admin only)
   */
  async deleteTicket(req, res) {
    try {
      const { ticketId } = req.params;
      // Verify ticket belongs to organization
      const ticket = await ticketService.getTicketById(ticketId, req.organizationId);
      if (!ticket) {
        return res.status(404).json({ error: 'Ticket not found or access denied' });
      }
      await ticketService.deleteTicket(ticketId);
      res.json({ success: true });
    } catch (error) {
      console.error('Delete ticket error:', error);
      res.status(500).json({ error: 'Failed to delete ticket' });
    }
  }

  /**
   * Close ticket (Admin only)
   */
  async closeTicket(req, res) {
    try {
      const { ticketId } = req.params;

      // Verify ticket belongs to organization
      const ticket = await ticketService.getTicketById(ticketId, req.organizationId);
      if (!ticket) {
        return res.status(404).json({ error: 'Ticket not found or access denied' });
      }

      if (ticket.status === 'CLOSED') {
        return res.status(400).json({ error: 'Ticket is already closed' });
      }

      // Update ticket
      const updatedTicket = await ticketService.updateTicketStatus(ticketId, 'CLOSED');

      res.json(updatedTicket);
    } catch (error) {
      console.error('Close ticket error:', error);
      res.status(500).json({ error: 'Failed to close ticket' });
    }
  }
}

export default new TicketController();
