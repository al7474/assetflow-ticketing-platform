const { PrismaClient } = require('@prisma/client');
const { PLANS } = require('../config/stripe');

const prisma = new PrismaClient();

// Middleware to check subscription limits
const checkSubscriptionLimits = (resourceType) => {
  return async (req, res, next) => {
    try {
      const organizationId = req.user.organizationId;

      // Get organization with subscription info
      const organization = await prisma.organization.findUnique({
        where: { id: organizationId },
        select: {
          subscriptionTier: true,
          subscriptionStatus: true,
          currentPeriodEnd: true
        }
      });

      if (!organization) {
        return res.status(404).json({ error: 'Organization not found' });
      }

      // Check if subscription is active
      if (organization.subscriptionStatus !== 'active' && organization.subscriptionTier !== 'FREE') {
        return res.status(403).json({ 
          error: 'Subscription inactive',
          message: 'Your subscription is not active. Please update your payment method.'
        });
      }

      const plan = PLANS[organization.subscriptionTier] || PLANS.FREE;
      const limits = plan.limits;

      // Check specific resource limits
      if (resourceType === 'asset' && limits.maxAssets !== -1) {
        const assetCount = await prisma.asset.count({
          where: { organizationId }
        });

        if (assetCount >= limits.maxAssets) {
          return res.status(403).json({
            error: 'Limit reached',
            message: `Your ${plan.name} plan allows up to ${limits.maxAssets} assets. Please upgrade to add more.`,
            currentCount: assetCount,
            limit: limits.maxAssets,
            tier: organization.subscriptionTier
          });
        }
      }

      if (resourceType === 'ticket' && limits.maxTickets !== -1) {
        const ticketCount = await prisma.ticket.count({
          where: { organizationId }
        });

        if (ticketCount >= limits.maxTickets) {
          return res.status(403).json({
            error: 'Limit reached',
            message: `Your ${plan.name} plan allows up to ${limits.maxTickets} tickets. Please upgrade to add more.`,
            currentCount: ticketCount,
            limit: limits.maxTickets,
            tier: organization.subscriptionTier
          });
        }
      }

      if (resourceType === 'user' && limits.maxUsers !== -1) {
        const userCount = await prisma.user.count({
          where: { organizationId }
        });

        if (userCount >= limits.maxUsers) {
          return res.status(403).json({
            error: 'Limit reached',
            message: `Your ${plan.name} plan allows up to ${limits.maxUsers} users. Please upgrade to add more.`,
            currentCount: userCount,
            limit: limits.maxUsers,
            tier: organization.subscriptionTier
          });
        }
      }

      // Attach plan info to request for later use
      req.subscription = {
        tier: organization.subscriptionTier,
        limits,
        plan
      };

      next();
    } catch (error) {
      console.error('Subscription check error:', error);
      res.status(500).json({ error: 'Failed to check subscription limits' });
    }
  };
};

module.exports = { checkSubscriptionLimits };
