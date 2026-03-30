import assetService from '../services/asset.service.js';
import ticketService from '../services/ticket.service.js';

// Middleware: Check if asset exists and belongs to the organization
export async function validateAssetOwnership(req, res, next) {
  const { assetId } = req.body;
  const asset = await assetService.getAssetById(assetId, req.organizationId);
  if (!asset) {
    return res.status(404).json({ error: 'Asset not found or access denied' });
  }
  req.asset = asset; // Attach asset to request for later use
  next();
}

