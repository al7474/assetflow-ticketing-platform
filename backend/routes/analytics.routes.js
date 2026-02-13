/**
 * Analytics routes
 */

const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { attachOrganization, requireOrganization } = require('../middleware/organization');

// Get dashboard analytics (admin only)
router.get(
  '/dashboard',
  authenticateToken,
  requireAdmin,
  attachOrganization,
  requireOrganization,
  analyticsController.getDashboard
);

module.exports = router;
