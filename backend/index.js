require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireAdmin } = require('./middleware/auth');
const { attachOrganization, requireOrganization } = require('./middleware/organization');
const { checkSubscriptionLimits } = require('./middleware/subscription');
const { hashPassword, comparePassword, generateToken } = require('./utils/auth');
const { stripe, PLANS } = require('./config/stripe');
const { sendWelcomeEmail, sendTicketNotification, sendSubscriptionEmail } = require('./utils/email');

const app = express();
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting bulk equipment load...');       
}

// Configure CORS for production
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  process.env.FRONTEND_URL, // Railway frontend URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

// CRITICAL: Stripe webhook MUST be before express.json() to receive raw body
app.post('/api/subscription/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
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

        const organization = await prisma.organization.update({
          where: { id: organizationId },
          data: {
            subscriptionTier: tier,
            stripeSubscriptionId: session.subscription,
            subscriptionStatus: 'active',
            currentPeriodEnd: new Date(session.current_period_end * 1000)
          },
          include: {
            users: {
              where: { role: 'ADMIN' },
              take: 1
            }
          }
        });

        // Send confirmation email to admin
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
        const organization = await prisma.organization.findFirst({
          where: { stripeSubscriptionId: subscription.id }
        });

        if (organization) {
          await prisma.organization.update({
            where: { id: organization.id },
            data: {
              subscriptionStatus: subscription.status,
              currentPeriodEnd: new Date(subscription.current_period_end * 1000)
            }
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const organization = await prisma.organization.findFirst({
          where: { stripeSubscriptionId: subscription.id }
        });

        if (organization) {
          await prisma.organization.update({
            where: { id: organization.id },
            data: {
              subscriptionTier: 'FREE',
              subscriptionStatus: 'canceled',
              stripeSubscriptionId: null,
              currentPeriodEnd: null
            }
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
});

// Now apply JSON parsing to all other routes
app.use(express.json());

// ==================== AUTH ROUTES ====================

// Register new user
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists.' });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create a new organization for this user (secure approach)
    // Generate a slug from company name or email domain
    const emailDomain = email.split('@')[1].split('.')[0];
    const orgSlug = `${emailDomain}-${Date.now()}`;

    const newOrg = await prisma.organization.create({
      data: {
        name: `${name}'s Organization`,
        slug: orgSlug
      }
    });

    // Create user as ADMIN of their new organization
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'ADMIN', // First user is always admin
        organizationId: newOrg.id
      }
    });

    // Send welcome email
    await sendWelcomeEmail(email, name, newOrg.name);

    // Generate token
    const token = generateToken(newUser);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error during registration.' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Find user with organization
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Generate token
    const token = generateToken(user);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
        organization: user.organization
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during login.' });
  }
});

// Get current user info (protected route)
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        organizationId: true,
        organization: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Invite user to organization (Admin only with limit checks)
app.post('/api/auth/invite', 
  authenticateToken, 
  requireAdmin, 
  attachOrganization, 
  requireOrganization,
  checkSubscriptionLimits('user'),
  async (req, res) => {
    try {
      const { name, email, password } = req.body;

      // Validate input
      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required.' });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return res.status(400).json({ error: 'User with this email already exists.' });
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Get organization info for welcome email
      const organization = await prisma.organization.findUnique({
        where: { id: req.organizationId }
      });

      // Create user as EMPLOYEE in the organization
      const newUser = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: 'EMPLOYEE',
          organizationId: req.organizationId
        }
      });

      // Send welcome email
      await sendWelcomeEmail(email, name, organization.name);

      res.status(201).json({
        message: 'User invited successfully',
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role
        }
      });
    } catch (error) {
      console.error('Invite user error:', error);
      res.status(500).json({ error: 'Internal server error during user invitation.' });
    }
  }
);

// ==================== ASSET ROUTES ====================

// ==================== ASSET ROUTES ====================

// 1. Get all assets (protected, filtered by organization)
app.get('/api/assets', authenticateToken, attachOrganization, requireOrganization, async (req, res) => {
  try {
    const assets = await prisma.asset.findMany({
      where: {
        organizationId: req.organizationId
      },
      orderBy: {
        name: 'asc'
      }
    });
    res.json(assets);
  } catch (error) {
    console.error('Fetch assets error:', error);
    res.status(500).json({ error: 'Failed to fetch assets' });
  }
});

// 2. Create a Ticket (WITH BUSINESS LOGIC) - protected, org-scoped
app.post('/api/tickets', authenticateToken, attachOrganization, requireOrganization, checkSubscriptionLimits('ticket'), async (req, res) => {
  try {
    const { description, assetId } = req.body;

    // Validate input
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

    // Business Logic: Check if there's already an open ticket for this asset IN THIS ORG
    const existingTicket = await prisma.ticket.findFirst({
      where: {
        assetId: parsedAssetId,
        organizationId: req.organizationId,
        status: 'OPEN'
      }
    });

    if (existingTicket) {
      return res.status(400).json({ 
        error: 'This asset already has an active failure report.' 
      });
    }

    // Get asset info for title and verify it belongs to org
    const asset = await prisma.asset.findFirst({
      where: { 
        id: parsedAssetId,
        organizationId: req.organizationId
      }
    });

    if (!asset) {
      return res.status(404).json({ error: 'Asset not found or access denied' });
    }

    const newTicket = await prisma.ticket.create({
      data: {
        title: `Issue with ${asset.name}`,
        description: description.trim(),
        userId: req.user.id,
        assetId: parsedAssetId,
        organizationId: req.organizationId
      },
      include: {
        user: true,
        asset: true
      }
    });

    // Send email notification to admins
    await sendTicketNotification(
      req.organizationId,
      newTicket,
      newTicket.asset,
      newTicket.user
    );

    res.json(newTicket);
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({ error: 'Failed to create ticket' });
  }
});

// 3. Get all tickets (Admin view) - requires admin role, org-scoped
app.get('/api/tickets', authenticateToken, requireAdmin, attachOrganization, requireOrganization, async (req, res) => {
  const tickets = await prisma.ticket.findMany({
    where: {
      organizationId: req.organizationId
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      asset: {
        select: {
          id: true,
          name: true,
          serialNumber: true,
          type: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
  res.json(tickets);
});

// 4. Close/Resolve a ticket - requires admin role
app.patch('/api/tickets/:id/close', authenticateToken, requireAdmin, attachOrganization, requireOrganization, async (req, res) => {
  try {
    const { id } = req.params;
    const ticketId = parseInt(id);

    if (isNaN(ticketId)) {
      return res.status(400).json({ error: 'Invalid ticket ID' });
    }

    // Verify ticket belongs to organization
    const ticket = await prisma.ticket.findFirst({
      where: {
        id: ticketId,
        organizationId: req.organizationId
      }
    });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found or access denied' });
    }

    if (ticket.status === 'CLOSED') {
      return res.status(400).json({ error: 'Ticket is already closed' });
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id: ticketId },
      data: { status: 'CLOSED' },
      include: {
        user: true,
        asset: true
      }
    });

    res.json(updatedTicket);
  } catch (error) {
    console.error('Close ticket error:', error);
    res.status(500).json({ error: 'Failed to close ticket' });
  }
});

// ==================== ANALYTICS ROUTES ====================

// Get dashboard analytics (Admin only)
app.get('/api/analytics/dashboard', authenticateToken, requireAdmin, attachOrganization, requireOrganization, async (req, res) => {
  try {
    const orgId = req.organizationId;

    // Total tickets by status
    const totalTickets = await prisma.ticket.count({ where: { organizationId: orgId } });
    const openTickets = await prisma.ticket.count({ where: { organizationId: orgId, status: 'OPEN' } });
    const closedTickets = await prisma.ticket.count({ where: { organizationId: orgId, status: 'CLOSED' } });

    // Tickets by asset
    const ticketsByAsset = await prisma.ticket.groupBy({
      by: ['assetId'],
      where: { organizationId: orgId },
      _count: { id: true }
    });

    // Get asset names for the grouped data
    const assetIds = ticketsByAsset.map(t => t.assetId);
    const assets = await prisma.asset.findMany({
      where: { id: { in: assetIds } },
      select: { id: true, name: true }
    });

    const ticketsByAssetWithNames = ticketsByAsset.map(item => ({
      assetName: assets.find(a => a.id === item.assetId)?.name || 'Unknown',
      count: item._count.id
    }));

    // Recent tickets timeline (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentTickets = await prisma.ticket.findMany({
      where: {
        organizationId: orgId,
        createdAt: { gte: sevenDaysAgo }
      },
      orderBy: { createdAt: 'asc' },
      select: {
        createdAt: true,
        status: true
      }
    });

    // Group by date
    const ticketsByDate = {};
    recentTickets.forEach(ticket => {
      const date = ticket.createdAt.toISOString().split('T')[0];
      if (!ticketsByDate[date]) {
        ticketsByDate[date] = { date, open: 0, closed: 0 };
      }
      if (ticket.status === 'OPEN') {
        ticketsByDate[date].open++;
      } else {
        ticketsByDate[date].closed++;
      }
    });

    const timeline = Object.values(ticketsByDate);

    // Total assets
    const totalAssets = await prisma.asset.count({ where: { organizationId: orgId } });

    res.json({
      summary: {
        totalTickets,
        openTickets,
        closedTickets,
        totalAssets
      },
      ticketsByAsset: ticketsByAssetWithNames,
      timeline
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// ==================== SUBSCRIPTION ROUTES ====================

// Get available subscription plans
app.get('/api/subscription/plans', (req, res) => {
  const plans = Object.entries(PLANS).map(([tier, plan]) => ({
    tier,
    name: plan.name,
    price: plan.price,
    limits: plan.limits
  }));
  res.json(plans);
});

// Get current subscription status
app.get('/api/subscription/status', authenticateToken, attachOrganization, async (req, res) => {
  try {
    const organizationId = req.user.organizationId;

    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        subscriptionTier: true,
        subscriptionStatus: true,
        currentPeriodEnd: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true
      }
    });

    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    const plan = PLANS[organization.subscriptionTier] || PLANS.FREE;

    // Get current usage
    const [assetCount, ticketCount, userCount] = await Promise.all([
      prisma.asset.count({ where: { organizationId } }),
      prisma.ticket.count({ where: { organizationId } }),
      prisma.user.count({ where: { organizationId } })
    ]);

    res.json({
      tier: organization.subscriptionTier,
      status: organization.subscriptionStatus,
      currentPeriodEnd: organization.currentPeriodEnd,
      plan: {
        name: plan.name,
        price: plan.price,
        limits: plan.limits
      },
      usage: {
        assets: assetCount,
        tickets: ticketCount,
        users: userCount
      }
    });
  } catch (error) {
    console.error('Subscription status error:', error);
    res.status(500).json({ error: 'Failed to fetch subscription status' });
  }
});

// Create Stripe checkout session
app.post('/api/subscription/create-checkout', authenticateToken, attachOrganization, async (req, res) => {
  try {
    const { tier } = req.body;
    const organizationId = req.user.organizationId;

    if (!tier) {
      return res.status(400).json({ error: 'Subscription tier is required' });
    }

    if (!['PRO', 'ENTERPRISE'].includes(tier)) {
      return res.status(400).json({ error: 'Invalid subscription tier. Choose PRO or ENTERPRISE.' });
    }

    const organization = await prisma.organization.findUnique({
      where: { id: organizationId }
    });

    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    // Prevent downgrade or same tier purchase
    if (organization.subscriptionTier === tier) {
      return res.status(400).json({ error: 'You are already on this plan' });
    }

    const plan = PLANS[tier];
    if (!plan.stripePriceId) {
      return res.status(400).json({ error: 'Stripe price ID not configured for this plan' });
    }

    // Create or retrieve Stripe customer
    let customerId = organization.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: req.user.email,
        metadata: {
          organizationId: organizationId.toString()
        }
      });
      customerId = customer.id;

      await prisma.organization.update({
        where: { id: organizationId },
        data: { stripeCustomerId: customerId }
      });
    }

    // Create checkout session
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

    res.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Create Stripe billing portal session
app.post('/api/subscription/portal', authenticateToken, attachOrganization, async (req, res) => {
  try {
    const organizationId = req.user.organizationId;

    const organization = await prisma.organization.findUnique({
      where: { id: organizationId }
    });

    if (!organization?.stripeCustomerId) {
      return res.status(400).json({ error: 'No active subscription found' });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: organization.stripeCustomerId,
      return_url: `${process.env.FRONTEND_URL}/billing`
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Portal error:', error);
    res.status(500).json({ error: 'Failed to create portal session' });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 API ready at http://localhost:${PORT}`));