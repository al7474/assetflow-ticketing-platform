/**
 * Asset service
 * Database operations for asset-related functionality
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class AssetService {
  /**
   * Get all assets for organization
   */
  async getAssetsByOrganization(organizationId) {
    return await prisma.asset.findMany({
      where: { organizationId },
      orderBy: { name: 'asc' }
    });
  }

  /**
   * Get asset by ID and organization
   */
  async getAssetById(id, organizationId) {
    return await prisma.asset.findFirst({
      where: { 
        id,
        organizationId
      }
    });
  }

  /**
   * Count assets by organization
   */
  async countAssetsByOrganization(organizationId) {
    return await prisma.asset.count({
      where: { organizationId }
    });
  }

  /**
   * Get multiple assets by IDs
   */
  async getAssetsByIds(assetIds) {
    return await prisma.asset.findMany({
      where: { id: { in: assetIds } },
      select: { id: true, name: true }
    });
  }
}

module.exports = new AssetService();
