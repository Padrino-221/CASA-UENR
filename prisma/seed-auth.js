/* Explicit, create-only production bootstrap. Never changes existing credentials. */
// eslint-disable-next-line @typescript-eslint/no-require-imports
require('dotenv').config();
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient } = require('@prisma/client');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { Pool } = require('pg');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaPg } = require('@prisma/adapter-pg');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const bcrypt = require('bcryptjs');

async function main() {
  const email = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || !password || password.length < 16) {
    throw new Error('Set BOOTSTRAP_ADMIN_EMAIL and a unique BOOTSTRAP_ADMIN_PASSWORD of at least 16 characters.');
  }
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
  try {
    if (await prisma.user.findUnique({ where: { email } })) {
      console.log('Account already exists; credentials and role were not changed.');
      return;
    }
    await prisma.user.create({ data: { email, password: await bcrypt.hash(password, 12),
      name: process.env.BOOTSTRAP_ADMIN_NAME || 'National Administrator', role: 'NATIONAL_ADMIN' } });
    console.log('Administrator created. Remove bootstrap variables from the environment.');
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
