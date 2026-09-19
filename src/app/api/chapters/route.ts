import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { auth } from '@/auth';
import bcrypt from 'bcryptjs';

export async function GET(request: Request) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const regionIdParam = searchParams.get('regionId');

  const role = session.user?.role;
  if (!role) {
    return NextResponse.json({ error: 'Forbidden: Role could not be determined.' }, { status: 403 });
  }
  const contextId = role === 'REGIONAL_ADMIN' ? session.user?.regionId : session.user?.chapterId;

  try {
    const page = Math.max(1, Number(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(10, Number(searchParams.get('limit') || '50')));
    const skip = (page - 1) * limit;

    const chapters = await db.chapter.findMany({
      where: {
        AND: [
          regionIdParam ? { regionId: regionIdParam } : {},
          role === 'REGIONAL_ADMIN' ? { regionId: contextId || 'none' } : {},
          role === 'LOCAL_ADMIN' ? { id: contextId || 'none' } : {},
        ]
      },
      include: {
        region: true,
        admins: {
          select: { id: true, name: true, email: true, role: true }
        },
        _count: {
          select: { students: true, transactions: true }
        }
      },
      orderBy: role === 'NATIONAL_ADMIN' ? { createdAt: 'desc' } : { name: 'asc' },
      skip,
      take: limit
    });

    const cutoffResult = await db.academicYear.aggregate({
      _min: { startDate: true },
      where: { isCurrent: true }
    });
    const cutoffDate = cutoffResult._min.startDate?.toISOString() || null;

    return NextResponse.json({ chapters, cutoffDate, page, limit });
  } catch (err) {
    console.error('Chapters fetch error:', err);
    return NextResponse.json({
      error: 'Failed to fetch chapters'
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const postRole = session.user?.role;
  if (postRole !== 'REGIONAL_ADMIN' && postRole !== 'NATIONAL_ADMIN') {
    return NextResponse.json({ error: 'Forbidden: You do not have permission to create chapters' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { name, regionId, university, type, adminName, adminEmail, adminPassword } = body;
    const chapterType = university || type || 'University';

    if (!name || !regionId) {
      return NextResponse.json({ error: 'Name and Region are required' }, { status: 400 });
    }

    if (postRole === 'REGIONAL_ADMIN' && session.user?.regionId !== regionId) {
      return NextResponse.json({ error: 'Forbidden: You can only create chapters within your assigned region' }, { status: 403 });
    }

    let hashedPassword = null;
    if (adminName && adminEmail && adminPassword) {
      hashedPassword = await bcrypt.hash(adminPassword, 10);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await db.$transaction(async (tx: any) => {
      const chapter = await tx.chapter.create({
        data: { name, regionId, university: chapterType }
      });

      if (hashedPassword) {
        await tx.user.create({
          data: {
            name: adminName,
            email: adminEmail,
            password: hashedPassword,
            role: 'LOCAL_ADMIN',
            regionId: regionId,
            chapterId: chapter.id
          }
        });
      }

      return chapter;
    }, {
      maxWait: 5000,
      timeout: 10000
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    console.error('Chapter create error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
