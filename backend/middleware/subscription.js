
import { PrismaClient } from '@prisma/client';
import { PLANS } from '../config/stripe.js';
const prisma = new PrismaClient();


// Middleware to check subscription limits
const checkSubscriptionLimits = (resourceType) => {
  return async (req, res, next) => {
    try {
      const organizationId = req.user.organizationId;
      const organization = await _getOrganizationWithSubscription(organizationId);
      if (!organization) {
        return res.status(404).json({ error: 'Organization not found' });
      }
      if (!_isSubscriptionActive(organization)) {
        return res.status(403).json({
          error: 'Subscription inactive',
          message: 'Your subscription is not active. Please update your payment method.'
        });
      }
      const plan = PLANS[organization.subscriptionTier] || PLANS.FREE;
      const limits = plan.limits;
      const limitError = await _checkResourceLimit(resourceType, limits, organizationId, plan, organization.subscriptionTier);
      if (limitError) {
        return res.status(403).json(limitError);
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

// Helper to get organization with subscription info
async function _getOrganizationWithSubscription(organizationId) {
  return prisma.organization.findUnique({
    where: { id: organizationId },
    select: {
      subscriptionTier: true,
      subscriptionStatus: true,
      currentPeriodEnd: true
    }
  });
}

// Helper to check if subscription is active
function _isSubscriptionActive(organization) {
  return organization.subscriptionStatus === 'active' || organization.subscriptionTier === 'FREE';
}

// Helper to check resource limits
async function _checkResourceLimit(resourceType, limits, organizationId, plan, subscriptionTier) {
  if (resourceType === 'asset' && limits.maxAssets !== -1) {
    const assetCount = await prisma.asset.count({ where: { organizationId } });
    if (assetCount >= limits.maxAssets) {
      return {
        error: 'Limit reached',
        message: `Your ${plan.name} plan allows up to ${limits.maxAssets} assets. Please upgrade to add more.`,
        currentCount: assetCount,
        limit: limits.maxAssets,
        tier: subscriptionTier
      };
    }
  }
  if (resourceType === 'ticket' && limits.maxTickets !== -1) {
    const ticketCount = await prisma.ticket.count({ where: { organizationId } });
    if (ticketCount >= limits.maxTickets) {
      return {
        error: 'Limit reached',
        message: `Your ${plan.name} plan allows up to ${limits.maxTickets} tickets. Please upgrade to add more.`,
        currentCount: ticketCount,
        limit: limits.maxTickets,
        tier: subscriptionTier
      };
    }
  }
  if (resourceType === 'user' && limits.maxUsers !== -1) {
    const userCount = await prisma.user.count({ where: { organizationId } });
    if (userCount >= limits.maxUsers) {
      return {
        error: 'Limit reached',
        message: `Your ${plan.name} plan allows up to ${limits.maxUsers} users. Please upgrade to add more.`,
        currentCount: userCount,
        limit: limits.maxUsers,
        tier: subscriptionTier
      };
    }
  }
  return null;
}


export { checkSubscriptionLimits };
