require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireAdmin } = require('./middleware/auth');
const { attachOrganization, requireOrganization } = require('./middleware/organization');
const { hashPassword, comparePassword, generateToken } = require('./utils/auth');

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

    // For now, assign to a default organization (will be improved later)
    // In production, this should come from invitation or signup flow
    const defaultOrg = await prisma.organization.findFirst();
    if (!defaultOrg) {
      return res.status(500).json({ error: 'No organization available. Contact administrator.' });
    }

    // Create user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'EMPLOYEE', // Default to EMPLOYEE if not specified
        organizationId: defaultOrg.id
      }
    });

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

// ==================== ASSET ROUTES ====================

// ==================== ASSET ROUTES ====================

// 1. Get all assets (protected, filtered by organization)
app.get('/api/assets', authenticateToken, attachOrganization, requireOrganization, async (req, res) => {
  const assets = await prisma.asset.findMany({
    where: {
      organizationId: req.organizationId
    }
  });
  res.json(assets);
});

// 2. Create a Ticket (WITH BUSINESS LOGIC) - protected, org-scoped
app.post('/api/tickets', authenticateToken, attachOrganization, requireOrganization, async (req, res) => {
  const { description, assetId } = req.body;

  // Business Logic: Check if there's already an open ticket for this asset IN THIS ORG
  const existingTicket = await prisma.ticket.findFirst({
    where: {
      assetId: parseInt(assetId),
      organizationId: req.organizationId,
      status: 'OPEN'
    }
  });

  if (existingTicket) {
    return res.status(400).json({ 
      error: 'This asset already has an active failure report.' 
    });
  }

  const newTicket = await prisma.ticket.create({
    data: {
      description,
      userId: req.user.id,
      assetId: parseInt(assetId),
      organizationId: req.organizationId
    }
  });

  res.json(newTicket);
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
app.patch('/api/tickets/:id/close', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const updatedTicket = await prisma.ticket.update({
      where: { id: parseInt(id) },
      data: { status: 'CLOSED' },
      include: {
        user: true,
        asset: true
      }
    });
    res.json(updatedTicket);
  } catch (error) {
    res.status(404).json({ error: 'Ticket not found' });
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

const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 API ready at http://localhost:${PORT}`));