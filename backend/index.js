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

app.use(cors());
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

const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 API ready at http://localhost:${PORT}`));