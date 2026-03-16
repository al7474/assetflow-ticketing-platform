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
      const { description, assetId } = req.body;

      // Check if asset already has open ticket
      const hasOpenTicket = await ticketService.hasOpenTicket(
        assetId,
        req.organizationId
      );

      if (hasOpenTicket) {
        return res.status(400).json({ 
          error: 'This asset already has an active failure report.' 
        });
      }

      // Get asset info and verify ownership
      const asset = await assetService.getAssetById(assetId, req.organizationId);
      if (!asset) {
        return res.status(404).json({ error: 'Asset not found or access denied' });
      }

      // Create ticket
      const newTicket = await ticketService.createTicket({
        title: `Issue with ${asset.name}`,
        description: description.trim(),
        userId: req.user.id,
        assetId,
        organizationId: req.organizationId
      });

      // Send email notification
      await sendTicketNotification(
        req.organizationId,
        newTicket,
        newTicket.asset,
        newTicket.user
      );

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
