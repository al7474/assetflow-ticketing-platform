require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting bulk equipment load...');

  const assets = [
    { name: 'MacBook Pro 14', serialNumber: 'SN-001', type: 'Laptop' },
    { name: 'Dell XPS 15', serialNumber: 'SN-002', type: 'Laptop' },
    { name: 'iPhone 15 Pro', serialNumber: 'SN-003', type: 'Phone' },
    { name: 'iPad Air', serialNumber: 'SN-004', type: 'Tablet' },
    { name: 'Monitor LG 27"', serialNumber: 'SN-005', type: 'Monitor' },
  ];

  for (const asset of assets) {
    await prisma.asset.upsert({
      where: { serialNumber: asset.serialNumber },
      update: {},
      create: asset,
    });
  }

  // Create a test user
  await prisma.user.upsert({
    where: { email: 'admin@assetflow.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@assetflow.com',
      role: 'ADMIN'
    }
  });

  console.log('✅ Load completed.');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());