/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const regions = await prisma.region.findMany({ select: { id: true, name: true } });
    const institutions = await prisma.institution.findMany({ select: { id: true, name: true } });
    console.log(JSON.stringify({ regions, institutions }, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
