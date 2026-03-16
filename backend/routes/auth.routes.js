/**
 * Authentication routes
 */


import express from 'express';
import authController from '../controllers/auth.controller.js';
import { validateRegistration, validateLogin, validateInvite } from '../validators/auth.validator.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { attachOrganization, requireOrganization } from '../middleware/organization.js';
import { checkSubscriptionLimits } from '../middleware/subscription.js';

const router = express.Router();

// Public routes
router.post('/register', validateRegistration, authController.register);
router.post('/login', validateLogin, authController.login);

// Protected routes
router.get('/me', authenticateToken, authController.getMe);

// Admin only routes
router.post(
  '/invite',
  authenticateToken,
  requireAdmin,
  attachOrganization,
  requireOrganization,
  checkSubscriptionLimits('user'),
  validateInvite,
  authController.inviteUser
);

export default router;
