/**
 * Subscription routes
 */

const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscription.controller');
const { validateCheckout } = require('../validators/subscription.validator');
const { authenticateToken } = require('../middleware/auth');
const { attachOrganization } = require('../middleware/organization');

// Public routes
router.get('/plans', subscriptionController.getPlans);

// CRITICAL: Webhook MUST be defined with raw body parser
// This route is registered separately in index.js

// Protected routes
router.get('/status', authenticateToken, attachOrganization, subscriptionController.getStatus);
router.post('/create-checkout', authenticateToken, attachOrganization, validateCheckout, subscriptionController.createCheckout);
router.post('/portal', authenticateToken, attachOrganization, subscriptionController.createPortal);

// Development/Demo route (no Stripe required)
router.post('/demo-upgrade', authenticateToken, attachOrganization, validateCheckout, subscriptionController.demoUpgrade);

module.exports = router;
