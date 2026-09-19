// eslint-disable-next-line @typescript-eslint/no-require-imports
require('dotenv').config();
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient } = require('@prisma/client');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { Pool } = require('pg');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaPg } = require('@prisma/adapter-pg');

async function main() {
  console.log('🌱 Starting UENR Chapter semester cycle population...');
  
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('❌ DATABASE_URL is not defined in .env');
    process.exit(1);
  }

  const isLocal = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');
  const pool = new Pool({ 
    connectionString,
    ssl: isLocal ? false : { rejectUnauthorized: false }
  });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    // Find UENR Chapter
    const uenr = await prisma.chapter.findFirst({
      where: {
        name: {
          contains: 'UENR',
          mode: 'insensitive'
        }
      }
    });

    if (!uenr) {
      console.error('❌ UENR Chapter not found in database!');
      process.exit(1);
    }

    console.log(`🏫 Found Chapter: ${uenr.name} (ID: ${uenr.id})`);

    // Clean up existing academic years for UENR to ensure a fresh, pristine cycle
    console.log('🧹 Cleaning up any existing academic cycles for UENR...');
    await prisma.semester.deleteMany({
      where: { chapterId: uenr.id }
    });
    await prisma.academicYear.deleteMany({
      where: { chapterId: uenr.id }
    });

    // Create 2025/2026 Academic Year
    console.log('📅 Creating 2025/2026 Academic Year...');
    const acadYear = await prisma.academicYear.create({
      data: {
        name: '2025/2026 Academic Year',
        startDate: new Date('2025-08-01T00:00:00Z'),
        endDate: new Date('2026-06-30T23:59:59Z'),
        isCurrent: true,
        chapterId: uenr.id
      }
    });

    console.log(`✅ Created Academic Year: ${acadYear.name}`);

    // Create Semester 1
    console.log('⏳ Creating Semester 1 (ACTIVE)...');
    const sem1 = await prisma.semester.create({
      data: {
        name: 'Semester 1',
        academicYearId: acadYear.id,
        chapterId: uenr.id,
        startDate: new Date('2025-08-05T00:00:00Z'),
        endDate: new Date('2025-12-20T23:59:59Z'),
        status: 'ACTIVE'
      }
    });

    console.log(`✅ Created Semester: ${sem1.name} (Status: ${sem1.status})`);

    // Create Semester 2
    console.log('⏳ Creating Semester 2 (UPCOMING)...');
    const sem2 = await prisma.semester.create({
      data: {
        name: 'Semester 2',
        academicYearId: acadYear.id,
        chapterId: uenr.id,
        startDate: new Date('2026-01-10T00:00:00Z'),
        endDate: new Date('2026-05-31T23:59:59Z'),
        status: 'UPCOMING'
      }
    });

    console.log(`✅ Created Semester: ${sem2.name} (Status: ${sem2.status})`);
    console.log('🎉 UENR chapter cycle successfully populated!');

  } catch (error) {
    console.error('❌ Error populating UENR semester cycle:', error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
