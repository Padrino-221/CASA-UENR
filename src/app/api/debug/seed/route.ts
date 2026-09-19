import path from 'path';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const session = await auth();
  if (!session || session.user?.role !== 'NATIONAL_ADMIN') {
    return NextResponse.json({ error: 'Forbidden: National admin only' }, { status: 403 });
  }

  try {
    const seedPath = path.join(process.cwd(), 'prisma', 'seed-full.js');
    const { seedFullData } = await import(seedPath);
    const result = await seedFullData();
    return NextResponse.json({ message: 'Demo database seeded successfully', result });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message || 'Seed failed' }, { status: 500 });
  }
}
