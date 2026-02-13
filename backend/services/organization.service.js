/**
 * Organization service
 * Database operations for organization and subscription-related functionality
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class OrganizationService {
  /**
   * Get organization by ID
   */
  async getOrganizationById(id) {
    return await prisma.organization.findUnique({
      where: { id }
    });
  }

  /**
   * Get organization with subscription details
   */
  async getOrganizationWithSubscription(id) {
    return await prisma.organization.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        slug: true,
        subscriptionTier: true,
        subscriptionStatus: true,
        currentPeriodEnd: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true
      }
    });
  }

  /**
   * Update organization subscription
   */
  async updateSubscription(id, subscriptionData) {
    return await prisma.organization.update({
      where: { id },
      data: subscriptionData
    });
  }

  /**
   * Update organization with admin users
   */
  async updateSubscriptionWithAdmins(id, subscriptionData) {
    return await prisma.organization.update({
      where: { id },
      data: subscriptionData,
      include: {
        users: {
          where: { role: 'ADMIN' },
          take: 1
        }
      }
    });
  }

  /**
   * Find organization by Stripe subscription ID
   */
  async findByStripeSubscriptionId(subscriptionId) {
    return await prisma.organization.findFirst({
      where: { stripeSubscriptionId: subscriptionId }
    });
  }

  /**
   * Update Stripe customer ID
   */
  async updateStripeCustomer(id, customerId) {
    return await prisma.organization.update({
      where: { id },
      data: { stripeCustomerId: customerId }
    });
  }

  /**
   * Count users in organization
   */
  async countUsers(organizationId) {
    return await prisma.user.count({
      where: { organizationId }
    });
  }

  /**
   * Get admin users from organization
   */
  async getAdminUsers(organizationId) {
    return await prisma.user.findMany({
      where: { 
        organizationId,
        role: 'ADMIN'
      },
      select: {
        id: true,
        name: true,
        email: true
      }
    });
  }
}

module.exports = new OrganizationService();
