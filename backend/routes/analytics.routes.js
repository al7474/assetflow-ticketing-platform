/**
 * Analytics routes
 */


import express from 'express';
import analyticsController from '../controllers/analytics.controller.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { attachOrganization, requireOrganization } from '../middleware/organization.js';

const router = express.Router();

// Get dashboard analytics (admin only)
router.get(
  '/dashboard',
  authenticateToken,
  requireAdmin,
  attachOrganization,
  requireOrganization,
  analyticsController.getDashboard
);

export default router;
