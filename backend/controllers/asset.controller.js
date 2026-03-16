/**
 * Asset controller
 * Business logic for asset-related operations
 */


import assetService from '../services/asset.service.js';

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

  /**
   * Create a new asset for organization
   */
  async createAsset(req, res) {
    try {
      const { name, serialNumber, type } = req.body;
      if (!name || !serialNumber || !type) {
        return res.status(400).json({ error: 'Name, serialNumber, and type are required.' });
      }
      const asset = await assetService.createAsset({
        name,
        serialNumber,
        type,
        organizationId: req.organizationId
      });
      res.status(201).json(asset);
    } catch (error) {
      console.error('Create asset error:', error);
      if (error.code === 'P2002') {
        // Prisma unique constraint failed
        return res.status(409).json({ error: 'Asset with this serial number already exists.' });
      }
      res.status(500).json({ error: 'Failed to create asset' });
    }
  }

  /**
   * Delete asset by ID (organization-scoped)
   */
  async deleteAsset(req, res) {
    try {
      const id = Number(req.params.id);
      // Verify asset belongs to organization
      const asset = await assetService.getAssetById(id, req.organizationId);
      if (!asset) {
        return res.status(404).json({ error: 'Asset not found or access denied' });
      }
      await assetService.deleteAsset(id);
      res.json({ success: true });
    } catch (error) {
      if (error.message === 'Cannot delete asset with related tickets') {
        return res.status(400).json({ error: 'Cannot delete asset: tickets exist for this asset.' });
      }
      console.error('Delete asset error:', error);
      res.status(500).json({ error: 'Failed to delete asset' });
    }
  }
}

export default new AssetController();
