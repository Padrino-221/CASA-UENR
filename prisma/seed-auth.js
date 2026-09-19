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
  console.log('🌱 Starting database seed...');
  
  const connectionString = process.env.DATABASE_URL;
  const isLocal = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');
  const pool = new Pool({ 
    connectionString,
    ssl: isLocal ? false : { rejectUnauthorized: false }
  });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const password = await bcrypt.hash('admin123', 10);

    // 1. Ensure we have a Region and Chapter
    let region = await prisma.region.findFirst();
    if (!region) {
      console.log('Creating default region...');
      region = await prisma.region.create({ data: { name: 'Ashanti Region' } });
    }

    let chapter = await prisma.chapter.findFirst({ where: { regionId: region.id } });
    if (!chapter) {
      console.log('Creating default chapter...');
      chapter = await prisma.chapter.create({ 
        data: { name: 'KNUST Chapter', regionId: region.id, university: 'University' } 
      });
    }

    // 2. Create Users
    const users = [
      { email: 'national@u-chms.gov', role: 'NATIONAL_ADMIN', name: 'National Admin' },
      { email: 'regional@u-chms.gov', role: 'REGIONAL_ADMIN', name: 'Regional Admin', regionId: region.id },
      { email: 'local@u-chms.gov', role: 'LOCAL_ADMIN', name: 'Local Admin', chapterId: chapter.id },
      { email: 'content@u-chms.gov', role: 'CONTENT_MANAGER', name: 'Content Manager' },
    ];

    for (const u of users) {
      const { email, role, name, regionId, chapterId } = u;
      console.log(`Upserting user: ${email} (${role})`);
      await prisma.user.upsert({
        where: { email },
        update: { 
          password, 
          role, 
          name, 
          regionId: regionId || null, 
          chapterId: chapterId || null 
        },
        create: { 
          email, 
          password, 
          role, 
          name, 
          regionId: regionId || null, 
          chapterId: chapterId || null 
        },
      });
    }

    console.log('✅ Database seeded with secure administrative accounts.');
    console.log('   national@u-chms.gov  / admin123');
    console.log('   regional@u-chms.gov  / admin123');
    console.log('   local@u-chms.gov     / admin123');
    console.log('   content@u-chms.gov   / admin123');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
