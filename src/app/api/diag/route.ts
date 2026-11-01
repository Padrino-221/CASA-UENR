import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== 'NATIONAL_ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  try {
    await db.user.count();
    return NextResponse.json({ status: 'healthy' }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ status: 'unavailable' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
