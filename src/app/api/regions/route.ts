import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { auth } from '@/auth';
import bcrypt from 'bcryptjs';

export async function GET(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const role = session.user?.role;
    const regionId = session.user?.regionId;

    if (role === 'LOCAL_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const where: { id?: string } = {};
    if (role === 'REGIONAL_ADMIN' && regionId) {
      where.id = regionId;
    }

    const page = Math.max(1, Number(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(10, Number(searchParams.get('limit') || '50')));
    const skip = (page - 1) * limit;

    const regions = await db.region.findMany({
      where,
      include: {
        _count: {
          select: { chapters: true }
        },
        chapters: {
          include: {
            _count: {
              select: { students: true }
            }
          }
        }
      },
      orderBy: { name: 'asc' },
      skip,
      take: limit
    });

    const formattedRegions = regions.map((r: { id: string; name: string; _count: { chapters: number }; chapters: { _count: { students: number } }[] }) => ({
      id: r.id,
      name: r.name,
      _count: {
        chapters: r._count.chapters,
        students: r.chapters.reduce((acc: number, ch: { _count: { students: number } }) => acc + ch._count.students, 0)
      }
    }));

    return NextResponse.json(formattedRegions);
  } catch (err) {
    console.error('Regions fetch error:', err);
    return NextResponse.json({ error: 'Failed to fetch regions' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session || session.user?.role !== 'NATIONAL_ADMIN') {
    return NextResponse.json({ error: 'Forbidden: Only National Administrators can create regions' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { name, adminName, adminEmail, adminPassword } = body;

    if (!name || !adminName || !adminEmail || !adminPassword) {
      return NextResponse.json({ error: 'Region Name and Administrator details are required' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await db.$transaction(async (tx: any) => {
      // 1. Create the Region
      const region = await tx.region.create({
        data: { name }
      });

      // 2. Create the Regional Administrator
      const admin = await tx.user.create({
        data: {
          name: adminName,
          email: adminEmail,
          password: hashedPassword,
          role: 'REGIONAL_ADMIN',
          regionId: region.id
        }
      });

      return { region, admin };
    }, {
      maxWait: 5000,
      timeout: 10000
    });

    return NextResponse.json(result.region, { status: 201 });
  } catch (err) {
    const error = err as { code?: string };
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Region or Administrator Email already exists' }, { status: 400 });
    }
    console.error('Region/Admin Integrated create error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
