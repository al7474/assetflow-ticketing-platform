/**
 * Ticket validators
 * Input validation for ticket-related endpoints
 */

const validateCreateTicket = (req, res, next) => {
  const { description, assetId } = req.body;

  if (!description || !description.trim()) {
    return res.status(400).json({ error: 'Description is required' });
  }

  if (!assetId) {
    return res.status(400).json({ error: 'Asset ID is required' });
  }

  const parsedAssetId = parseInt(assetId);
  if (isNaN(parsedAssetId)) {
    return res.status(400).json({ error: 'Invalid asset ID' });
  }

  // Attach parsed ID to request for controller
  req.body.assetId = parsedAssetId;

  next();
};

const validateTicketId = (req, res, next) => {
  const { id } = req.params;
  const ticketId = parseInt(id);

  if (isNaN(ticketId)) {
    return res.status(400).json({ error: 'Invalid ticket ID' });
  }

  // Attach parsed ID to request
  req.params.ticketId = ticketId;

  next();
};

module.exports = {
  validateCreateTicket,
  validateTicketId
};
