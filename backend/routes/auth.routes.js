/**
 * Authentication routes
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { validateRegistration, validateLogin, validateInvite } = require('../validators/auth.validator');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { attachOrganization, requireOrganization } = require('../middleware/organization');
const { checkSubscriptionLimits } = require('../middleware/subscription');

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

module.exports = router;
