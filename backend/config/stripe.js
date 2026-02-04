const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy');

// Subscription plans with limits
const PLANS = {
  FREE: {
    name: 'Free',
    price: 0,
    stripePriceId: null,
    limits: {
      maxAssets: 5,
      maxTickets: 10,
      maxUsers: 2
    }
  },
  PRO: {
    name: 'Pro',
    price: 2900, // $29.00 in cents
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID,
    limits: {
      maxAssets: 50,
      maxTickets: -1, // unlimited
      maxUsers: 10
    }
  },
  ENTERPRISE: {
    name: 'Enterprise',
    price: 9900, // $99.00 in cents
    stripePriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID,
    limits: {
      maxAssets: -1, // unlimited
      maxTickets: -1, // unlimited
      maxUsers: -1 // unlimited
    }
  }
};

module.exports = { stripe, PLANS };
