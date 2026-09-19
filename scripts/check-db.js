/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const counts = {
      regions: await prisma.region.count(),
      institutions: await prisma.institution.count(),
      students: await prisma.student.count(),
      collections: await prisma.collection.count(),
      academicYears: await prisma.academicYear.count(),
      semesters: await prisma.semester.count(),
    };
    console.log('Database Stats:', JSON.stringify(counts, null, 2));
  } catch (error) {
    console.error('Error checking DB:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
