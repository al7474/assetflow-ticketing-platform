// testConnection.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$connect();
    console.log('Conexión exitosa a Supabase PostgreSQL');
  } catch (error) {
    console.error('Error de conexión:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
