require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting bulk equipment load...');       
}

app.use(cors());
app.use(express.json());

// 1. Get all assets
app.get('/api/assets', async (req, res) => {
  const assets = await prisma.asset.findMany();
  res.json(assets);
});

// 2. Create a Ticket (WITH BUSINESS LOGIC)
app.post('/api/tickets', async (req, res) => {
  const { description, userId, assetId } = req.body;

  // Business Logic: Check if there's already an open ticket for this asset
  const existingTicket = await prisma.ticket.findFirst({
    where: {
      assetId: parseInt(assetId),
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
      userId: parseInt(userId),
      assetId: parseInt(assetId)
    }
  });

  res.json(newTicket);
});

const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 API ready at http://localhost:${PORT}`));