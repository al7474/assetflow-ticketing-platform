/**
 * Subscription controller
 * Business logic for subscription and billing operations
 */


import organizationService from '../services/organization.service.js';
import assetService from '../services/asset.service.js';
import ticketService from '../services/ticket.service.js';
import { stripe, PLANS } from '../config/stripe.js';
import { sendSubscriptionEmail } from '../utils/email.js';

class SubscriptionController {
  /**
   * Get available subscription plans
   */
  getPlans(req, res) {
    const plans = Object.entries(PLANS).map(([tier, plan]) => ({
      tier,
      name: plan.name,
      price: plan.price,
      limits: plan.limits
    }));
    res.json(plans);
  }

  /**
   * Get current subscription status
   */
  async getStatus(req, res) {
    try {
      const organizationId = req.user.organizationId;
      const organization = await organizationService.getOrganizationWithSubscription(organizationId);
      if (!organization) {
        return res.status(404).json({ error: 'Organization not found' });
      }
      const plan = PLANS[organization.subscriptionTier] || PLANS.FREE;
      const usage = await this._getOrganizationUsage(organizationId);
      res.json({
        tier: organization.subscriptionTier,
        status: organization.subscriptionStatus,
        currentPeriodEnd: organization.currentPeriodEnd,
        plan: {
          name: plan.name,
          price: plan.price,
          limits: plan.limits
        },
        usage
      });
    } catch (error) {
      console.error('Subscription status error:', error);
      res.status(500).json({ error: 'Failed to fetch subscription status' });
    }
  }

  /**
   * Helper to get organization usage counts
   */
  async _getOrganizationUsage(organizationId) {
    const [assetCount, ticketCount, userCount] = await Promise.all([
      assetService.countAssetsByOrganization(organizationId),
      ticketService.countTicketsByOrganization(organizationId),
      organizationService.countUsers(organizationId)
    ]);
    return {
      assets: assetCount,
      tickets: ticketCount,
      users: userCount
    };
  }

  /**
   * Create Stripe checkout session
   */
  async createCheckout(req, res) {
    try {
      const { tier } = req.body;
      const organizationId = req.user.organizationId;
      const organization = await organizationService.getOrganizationById(organizationId);
      if (!organization) {
        return res.status(404).json({ error: 'Organization not found' });
      }
      // Prevent same tier purchase
      if (organization.subscriptionTier === tier) {
        return res.status(400).json({ error: 'You are already on this plan' });
      }
      const plan = PLANS[tier];
      if (!plan.stripePriceId) {
        return res.status(400).json({ error: 'Stripe price ID not configured for this plan' });
      }
      // Get or create Stripe customer ID
      const customerId = await this._getOrCreateStripeCustomerId(organization, organizationId, req.user.email);
      // Create checkout session
      const session = await this._createStripeCheckoutSession({ customerId, plan, organizationId, tier });
      res.json({ url: session.url });
    } catch (error) {
      console.error('Checkout error:', error);
      res.status(500).json({ error: 'Failed to create checkout session' });
    }
  }

  /**
   * Helper to get or create Stripe customer ID
   */
  async _getOrCreateStripeCustomerId(organization, organizationId, email) {
    let customerId = organization.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email,
        metadata: { organizationId: organizationId.toString() }
      });
      customerId = customer.id;
      await organizationService.updateStripeCustomer(organizationId, customerId);
    }
    return customerId;
  }

  /**
   * Helper to create Stripe checkout session
   */
  async _createStripeCheckoutSession({ customerId, plan, organizationId, tier }) {
    /* eslint-disable camelcase */
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.stripePriceId,
          quantity: 1
        }
      ],
      success_url: `${process.env.FRONTEND_URL}/billing?success=true`,
      cancel_url: `${process.env.FRONTEND_URL}/billing?canceled=true`,
      metadata: {
        organizationId: organizationId.toString(),
        tier
      }
    });
    /* eslint-enable camelcase */
    return session;
  }

  /**
   * Create Stripe billing portal session
   */
  async createPortal(req, res) {
    try {
      const organizationId = req.user.organizationId;

      const organization = await organizationService.getOrganizationById(organizationId);

      if (!organization?.stripeCustomerId) {
        return res.status(400).json({ error: 'No active subscription found' });
      }


      /* eslint-disable camelcase */
      const session = await stripe.billingPortal.sessions.create({
        customer: organization.stripeCustomerId,
        return_url: `${process.env.FRONTEND_URL}/billing`
      });
      /* eslint-enable camelcase */

      res.json({ url: session.url });
    } catch (error) {
      console.error('Portal error:', error);
      res.status(500).json({ error: 'Failed to create portal session' });
    }
  }

  /**
   * Demo mode upgrade/downgrade (Development only - no Stripe required)
   * Instantly changes organization to selected tier
   */
  async demoUpgrade(req, res) {
    try {
      const { tier } = req.body;
      const organizationId = req.user.organizationId;
      if (!['FREE', 'PRO', 'ENTERPRISE'].includes(tier)) {
        return res.status(400).json({ error: 'Invalid tier. Choose FREE, PRO, or ENTERPRISE.' });
      }
      const organization = await organizationService.getOrganizationById(organizationId);
      if (!organization) {
        return res.status(404).json({ error: 'Organization not found' });
      }
      const currentPeriodEnd = this._calculateDemoPeriodEnd(tier);
      await organizationService.updateSubscription(organizationId, {
        subscriptionTier: tier,
        subscriptionStatus: tier === 'FREE' ? 'canceled' : 'active',
        currentPeriodEnd
      });
      // Send confirmation email
      const adminUsers = await organizationService.getAdminUsers(organizationId);
      if (adminUsers.length > 0) {
        await sendSubscriptionEmail(
          adminUsers[0].email,
          adminUsers[0].name,
          tier,
          'active'
        );
      }
      const action = tier === 'FREE' ? 'downgraded' : (organization.subscriptionTier === 'FREE' ? 'upgraded' : 'changed');
      res.json({
        success: true,
        message: `Successfully ${action} to ${tier} plan (Demo Mode)`,
        tier,
        currentPeriodEnd
      });
    } catch (error) {
      console.error('Demo upgrade error:', error);
      res.status(500).json({ error: 'Failed to upgrade plan' });
    }
  }

  /**
   * Helper to calculate demo period end date
   */
  _calculateDemoPeriodEnd(tier) {
    if (tier === 'FREE') return null;
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date;
  }

  /**
   * Handle Stripe webhook events
   */
  async handleWebhook(req, res) {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object;
          const organizationId = parseInt(session.metadata.organizationId);
          const tier = session.metadata.tier;

          const organization = await organizationService.updateSubscriptionWithAdmins(
            organizationId,
            {
              subscriptionTier: tier,
              stripeSubscriptionId: session.subscription,
              subscriptionStatus: 'active',
              currentPeriodEnd: new Date(session.current_period_end * 1000)
            }
          );

          // Send confirmation email
          if (organization.users[0]) {
            await sendSubscriptionEmail(
              organization.users[0].email,
              organization.users[0].name,
              tier,
              'active'
            );
          }
          break;
        }

        case 'customer.subscription.updated': {
          const subscription = event.data.object;
          const organization = await organizationService.findByStripeSubscriptionId(
            subscription.id
          );

          if (organization) {
            await organizationService.updateSubscription(organization.id, {
              subscriptionStatus: subscription.status,
              currentPeriodEnd: new Date(subscription.current_period_end * 1000)
            });
          }
          break;
        }

        case 'customer.subscription.deleted': {
          const subscription = event.data.object;
          const organization = await organizationService.findByStripeSubscriptionId(
            subscription.id
          );

          if (organization) {
            await organizationService.updateSubscription(organization.id, {
              subscriptionTier: 'FREE',
              subscriptionStatus: 'canceled',
              stripeSubscriptionId: null,
              currentPeriodEnd: null
            });
          }
          break;
        }
      }

      res.json({ received: true });
    } catch (error) {
      console.error('Webhook handling error:', error);
      res.status(500).json({ error: 'Webhook handler failed' });
    }
  }
}

export default new SubscriptionController();
