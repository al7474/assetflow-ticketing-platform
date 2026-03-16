/**
 * Subscription routes
 */


import express from 'express';
import subscriptionController from '../controllers/subscription.controller.js';
import { validateCheckout, validateDemoUpgrade } from '../validators/subscription.validator.js';
import { authenticateToken } from '../middleware/auth.js';
import { attachOrganization } from '../middleware/organization.js';

const router = express.Router();

// Public routes
router.get('/plans', subscriptionController.getPlans);

// CRITICAL: Webhook MUST be defined with raw body parser
// This route is registered separately in index.js

// Protected routes
router.get('/status', authenticateToken, attachOrganization, subscriptionController.getStatus);
router.post('/create-checkout', authenticateToken, attachOrganization, validateCheckout, subscriptionController.createCheckout);
router.post('/portal', authenticateToken, attachOrganization, subscriptionController.createPortal);

// Development/Demo route (no Stripe required)
router.post('/demo-upgrade', authenticateToken, attachOrganization, validateDemoUpgrade, subscriptionController.demoUpgrade);

export default router;
