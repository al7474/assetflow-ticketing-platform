// Middleware to add organization filtering to queries
// This ensures data isolation between organizations (multi-tenancy)

export const attachOrganization = (req, res, next) => {
  if (req.user && req.user.organizationId) {
    req.organizationId = req.user.organizationId;
  }
  next();
};

// Middleware to ensure organizationId is present
export const requireOrganization = (req, res, next) => {
  if (!req.organizationId) {
    return res.status(400).json({ error: 'Organization context is required.' });
  }
  next();
};


