/**
 * Ticket routes
 */

const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticket.controller');
const { validateCreateTicket, validateTicketId } = require('../validators/ticket.validator');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { attachOrganization, requireOrganization } = require('../middleware/organization');
const { checkSubscriptionLimits } = require('../middleware/subscription');

// Create ticket (any authenticated user, with limit check)
router.post(
  '/',
  authenticateToken,
  attachOrganization,
  requireOrganization,
  checkSubscriptionLimits('ticket'),
  validateCreateTicket,
  ticketController.createTicket
);

// Get all tickets (admin only)
router.get(
  '/',
  authenticateToken,
  requireAdmin,
  attachOrganization,
  requireOrganization,
  ticketController.getTickets
);

// Close ticket (admin only)
router.patch(
  '/:id/close',
  authenticateToken,
  requireAdmin,
  attachOrganization,
  requireOrganization,
  validateTicketId,
  ticketController.closeTicket
);

// Delete ticket (admin only)
router.delete(
  '/:id',
  authenticateToken,
  requireAdmin,
  attachOrganization,
  requireOrganization,
  validateTicketId,
  ticketController.deleteTicket
);

module.exports = router;
