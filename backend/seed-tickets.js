require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🎫 Creating sample tickets...');

  // Get organizations and users
  const acme = await prisma.organization.findUnique({ where: { slug: 'acme-corp' } });
  const techStartup = await prisma.organization.findUnique({ where: { slug: 'tech-startup' } });
  
  const acmeEmployee = await prisma.user.findUnique({ where: { email: 'employee@acme.com' } });
  const techEmployee = await prisma.user.findUnique({ where: { email: 'employee@techstartup.com' } });

  // Get assets
  const acmeAssets = await prisma.asset.findMany({ where: { organizationId: acme.id } });
  const techAssets = await prisma.asset.findMany({ where: { organizationId: techStartup.id } });

  // Create tickets for Acme Corporation
  const acmeTickets = [
    {
      title: 'Screen Flickering Issue',
      description: 'Laptop screen is flickering constantly',
      status: 'OPEN',
      userId: acmeEmployee.id,
      assetId: acmeAssets[0].id,
      organizationId: acme.id,
      createdAt: new Date('2026-01-28')
    },
    {
      title: 'Battery Not Charging',
      description: 'Battery not charging properly',
      status: 'CLOSED',
      userId: acmeEmployee.id,
      assetId: acmeAssets[1].id,
      organizationId: acme.id,
      createdAt: new Date('2026-01-26')
    },
    {
      title: 'Cracked Screen',
      description: 'Phone screen cracked after drop',
      status: 'OPEN',
      userId: acmeEmployee.id,
      assetId: acmeAssets[2].id,
      organizationId: acme.id,
      createdAt: new Date('2026-01-30')
    },
    {
      title: 'Sticky Keyboard',
      description: 'Keyboard keys are sticky',
      status: 'CLOSED',
      userId: acmeEmployee.id,
      assetId: acmeAssets[0].id,
      organizationId: acme.id,
      createdAt: new Date('2026-01-25')
    }
  ];

  // Create tickets for Tech Startup
  const techTickets = [
    {
      title: 'Touch Screen Not Responding',
      description: 'iPad touch screen not responding',
      status: 'OPEN',
      userId: techEmployee.id,
      assetId: techAssets[0].id,
      organizationId: techStartup.id,
      createdAt: new Date('2026-01-29')
    },
    {
      title: 'Dead Pixels on Monitor',
      description: 'Monitor has dead pixels',
      status: 'OPEN',
      userId: techEmployee.id,
      assetId: techAssets[1].id,
      organizationId: techStartup.id,
      createdAt: new Date('2026-01-31')
    }
  ];

  for (const ticket of [...acmeTickets, ...techTickets]) {
    await prisma.ticket.create({ data: ticket });
  }

  console.log(`✅ Created ${acmeTickets.length} tickets for Acme Corporation`);
  console.log(`✅ Created ${techTickets.length} tickets for Tech Startup Inc`);
  console.log('🎉 Sample tickets created successfully!');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
