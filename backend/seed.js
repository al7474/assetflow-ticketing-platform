require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { hashPassword } = require('./utils/auth');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting bulk equipment load...');

  // Delete existing data (careful - only for development!)
  await prisma.ticket.deleteMany({});
  await prisma.asset.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.organization.deleteMany({});

  // Create organizations first
  const org1 = await prisma.organization.create({
    data: {
      name: 'Acme Corporation',
      slug: 'acme-corp'
    }
  });

  const org2 = await prisma.organization.create({
    data: {
      name: 'Tech Startup Inc',
      slug: 'tech-startup'
    }
  });

  console.log(`✅ Organizations created: ${org1.name}, ${org2.name}`);

  // Assets for Acme Corporation
  const acmeAssets = [
    { name: 'MacBook Pro 14', serialNumber: 'ACME-001', type: 'Laptop', organizationId: org1.id },
    { name: 'Dell XPS 15', serialNumber: 'ACME-002', type: 'Laptop', organizationId: org1.id },
    { name: 'iPhone 15 Pro', serialNumber: 'ACME-003', type: 'Phone', organizationId: org1.id },
  ];

  // Assets for Tech Startup
  const startupAssets = [
    { name: 'iPad Air', serialNumber: 'TECH-001', type: 'Tablet', organizationId: org2.id },
    { name: 'Monitor LG 27"', serialNumber: 'TECH-002', type: 'Monitor', organizationId: org2.id },
  ];

  const allAssets = [...acmeAssets, ...startupAssets];

  for (const asset of allAssets) {
    await prisma.asset.upsert({
      where: { serialNumber: asset.serialNumber },
      update: {},
      create: asset,
    });
  }

  console.log(`✅ ${allAssets.length} assets created`);

  // Create test users with hashed passwords
  const adminPassword = await hashPassword('admin123');
  const employeePassword = await hashPassword('employee123');

  // Acme Corporation users
  await prisma.user.upsert({
    where: { email: 'admin@acme.com' },
    update: { password: adminPassword },
    create: {
      name: 'Admin User (Acme)',
      email: 'admin@acme.com',
      password: adminPassword,
      role: 'ADMIN',
      organizationId: org1.id
    }
  });

  await prisma.user.upsert({
    where: { email: 'employee@acme.com' },
    update: { password: employeePassword },
    create: {
      name: 'John Employee (Acme)',
      email: 'employee@acme.com',
      password: employeePassword,
      role: 'EMPLOYEE',
      organizationId: org1.id
    }
  });

  // Tech Startup users
  await prisma.user.upsert({
    where: { email: 'admin@techstartup.com' },
    update: { password: adminPassword },
    create: {
      name: 'Admin User (Tech Startup)',
      email: 'admin@techstartup.com',
      password: adminPassword,
      role: 'ADMIN',
      organizationId: org2.id
    }
  });

  await prisma.user.upsert({
    where: { email: 'employee@techstartup.com' },
    update: { password: employeePassword },
    create: {
      name: 'Jane Employee (Tech Startup)',
      email: 'employee@techstartup.com',
      password: employeePassword,
      role: 'EMPLOYEE',
      organizationId: org2.id
    }
  });

  console.log('✅ Load completed.');
  console.log('\n📝 Test users for Acme Corporation:');
  console.log('   Admin: admin@acme.com / admin123');
  console.log('   Employee: employee@acme.com / employee123');
  console.log('\n📝 Test users for Tech Startup Inc:');
  console.log('   Admin: admin@techstartup.com / admin123');
  console.log('   Employee: employee@techstartup.com / employee123');
  console.log('\n🔒 Data Isolation: Each organization can only see their own data!');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());