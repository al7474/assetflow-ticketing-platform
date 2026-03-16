/**
 * Asset routes
 */


import express from 'express';
import assetController from '../controllers/asset.controller.js';
import { authenticateToken } from '../middleware/auth.js';
import { attachOrganization, requireOrganization } from '../middleware/organization.js';

const router = express.Router();

// Get all assets (organization-scoped)
router.get(
  '/',
  authenticateToken,
  attachOrganization,
  requireOrganization,
  assetController.getAssets
);

export default router;
// Create asset (organization-scoped)
router.post(
  '/',
  authenticateToken,
  attachOrganization,
  requireOrganization,
  assetController.createAsset
);

// Delete asset (organization-scoped)
router.delete(
  '/:id',
  authenticateToken,
  attachOrganization,
  requireOrganization,
  assetController.deleteAsset
);
