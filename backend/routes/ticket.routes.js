/**
 * Ticket routes
 */


import express from 'express';
import ticketController from '../controllers/ticket.controller.js';
import { validateCreateTicket, validateTicketId } from '../validators/ticket.validator.js';
import { validateAssetOwnership } from '../middleware/ticketValidation.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { attachOrganization, requireOrganization } from '../middleware/organization.js';
import { checkSubscriptionLimits } from '../middleware/subscription.js';

const router = express.Router();

// Create ticket (any authenticated user, with limit check)
router.post(
  '/',
  authenticateToken,
  attachOrganization,
  requireOrganization,
  checkSubscriptionLimits('ticket'),
  validateCreateTicket,
  validateAssetOwnership,
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

export default router;
