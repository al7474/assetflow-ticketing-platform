/**
 * Ticket controller
 * Business logic for ticket-related operations
 */


import ticketService from '../services/ticket.service.js';
import assetService from '../services/asset.service.js';
import { sendTicketNotification } from '../utils/email.js';
import '../validators/ticketTypes.js'; // Register ticket types/validations
import { getTicketValidation } from '../validators/ticketValidationStrategies.js';

class TicketController {
  /**
   * Create new ticket
   */
  async createTicket(req, res, next) {
    try {
      const { description, type, extraData, ...rest } = req.body;
      // Asset is already validated and attached to req.asset by middleware
      // Open ticket validation is already done by middleware

      // Run type-specific validation strategy
      await getTicketValidation(type)({ description, type, extraData, ...rest });

      // Delegate business logic to the service
      const newTicket = await ticketService.createTicketWithNotification({
        description,
        type,
        extraData,
        asset: req.asset,
        userId: req.user.id,
        organizationId: req.organizationId,
        ...rest
      });
      res.json(newTicket);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all tickets (Admin only)
   */
  async getTickets(req, res, next) {
    try {
      const tickets = await ticketService.getTicketsByOrganization(req.organizationId);
      res.json(tickets);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete ticket (Admin only)
   */
  async deleteTicket(req, res, next) {
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
      next(error);
    }
  }

  /**
   * Close ticket (Admin only)
   */
  async closeTicket(req, res, next) {
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
      next(error);
    }
  }
}

export default new TicketController();
