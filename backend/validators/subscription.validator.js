/**
 * Subscription validators
 * Input validation for subscription-related endpoints
 */

export const validateCheckout = (req, res, next) => {
  const { tier } = req.body;

  if (!tier) {
    return res.status(400).json({ error: 'Subscription tier is required' });
  }

  if (!['PRO', 'ENTERPRISE'].includes(tier)) {
    return res.status(400).json({ 
      error: 'Invalid subscription tier. Choose PRO or ENTERPRISE.' 
    });
  }

  next();
};

export const validateDemoUpgrade = (req, res, next) => {
  const { tier } = req.body;

  if (!tier) {
    return res.status(400).json({ error: 'Subscription tier is required' });
  }

  if (!['FREE', 'PRO', 'ENTERPRISE'].includes(tier)) {
    return res.status(400).json({ 
      error: 'Invalid subscription tier. Choose FREE, PRO, or ENTERPRISE.' 
    });
  }

  next();
};


