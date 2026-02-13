/**
 * Asset controller
 * Business logic for asset-related operations
 */

const assetService = require('../services/asset.service');

class AssetController {
  /**
   * Get all assets for organization
   */
  async getAssets(req, res) {
    try {
      const assets = await assetService.getAssetsByOrganization(req.organizationId);
      res.json(assets);
    } catch (error) {
      console.error('Fetch assets error:', error);
      res.status(500).json({ error: 'Failed to fetch assets' });
    }
  }
}

module.exports = new AssetController();
