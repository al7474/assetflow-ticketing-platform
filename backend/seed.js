require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { hashPassword } = require('./utils/auth');
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

  // Create test users with hashed passwords
  const adminPassword = await hashPassword('admin123');
  const employeePassword = await hashPassword('employee123');

  await prisma.user.upsert({
    where: { email: 'admin@assetflow.com' },
    update: { password: adminPassword },
    create: {
      name: 'Admin User',
      email: 'admin@assetflow.com',
      password: adminPassword,
      role: 'ADMIN'
    }
  });

  await prisma.user.upsert({
    where: { email: 'employee@assetflow.com' },
    update: { password: employeePassword },
    create: {
      name: 'John Employee',
      email: 'employee@assetflow.com',
      password: employeePassword,
      role: 'EMPLOYEE'
    }
  });

  console.log('✅ Load completed.');
  console.log('📝 Test users:');
  console.log('   Admin: admin@assetflow.com / admin123');
  console.log('   Employee: employee@assetflow.com / employee123');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());