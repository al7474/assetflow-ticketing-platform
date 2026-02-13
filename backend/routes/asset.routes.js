/**
 * Asset routes
 */

const express = require('express');
const router = express.Router();
const assetController = require('../controllers/asset.controller');
const { authenticateToken } = require('../middleware/auth');
const { attachOrganization, requireOrganization } = require('../middleware/organization');

// Get all assets (organization-scoped)
router.get(
  '/',
  authenticateToken,
  attachOrganization,
  requireOrganization,
  assetController.getAssets
);

module.exports = router;
