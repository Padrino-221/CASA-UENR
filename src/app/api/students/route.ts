import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { auth } from '@/auth';
import { createAuditLog } from '@/lib/audit';
import { isLocalScope, canManageMembers } from '@/lib/roles';

export async function GET(request: Request) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const chapterIdParam = searchParams.get('chapterId');
  const search = searchParams.get('search');
  const page = Math.max(1, Number(searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(10, Number(searchParams.get('limit') || '50')));
  const skip = (page - 1) * limit;

  const role = session.user?.role;
  if (!role) {
    return NextResponse.json({ error: 'Forbidden: Role could not be determined.' }, { status: 403 });
  }
  const contextId = role === 'REGIONAL_ADMIN' ? session.user?.regionId : session.user?.chapterId;

  try {
    const students = await db.student.findMany({
      where: {
        AND: [
          chapterIdParam ? { chapterId: chapterIdParam } : {},
          search ? {
            OR: [
              { name: { contains: search } },
              { studentId: { contains: search } },
            ]
          } : {},
          isLocalScope(role) ? { chapterId: contextId || 'none' } : {},
          role === 'REGIONAL_ADMIN' ? { chapter: { regionId: contextId || 'none' } } : {},
        ]
      },
      include: {
        chapter: {
          include: { region: true }
        }
      },
      orderBy: { name: 'asc' },
      skip,
      take: limit
    });

    return NextResponse.json({ students, page, limit });
  } catch (err) {
    console.error('Students fetch error:', err);
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const postRole = session.user?.role;
  if (!canManageMembers(postRole)) {
    return NextResponse.json({ error: 'Forbidden: Only Local Administrators can register members' }, { status: 403 });
  }

  // LOCAL_ADMIN can only add students to their own chapter
  try {
    const body = await request.json();
    const { name, studentId, chapterId } = body;

    if (!name || !studentId || !chapterId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (session.user?.chapterId !== chapterId) {
      return NextResponse.json({ error: 'Forbidden: You can only register members for your own chapter' }, { status: 403 });
    }

    const student = await db.student.create({
      data: {
        name,
        studentId,
        chapterId,
        status: body.status || 'ACTIVE',
        maxLevel: body.maxLevel || '400',
        email: body.email || null,
        phone: body.phone || null,
        department: body.department || null,
        levelYear: body.levelYear || null,
        address: body.address || null,
        nextOfKinName: body.nextOfKinName || null,
        nextOfKinPhone: body.nextOfKinPhone || null,
        isLeader: body.isLeader || false,
        position: body.position || null,
      }
    });

    // AUDIT LOG
    await createAuditLog({
      userId: session.user.id as string,
      action: 'CREATE',
      entity: 'STUDENT',
      entityId: student.id,
      metadata: { name: student.name, studentId: student.studentId }
    });

    return NextResponse.json(student, { status: 201 });
  } catch (err) {
    const error = err as { code?: string };
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Student ID already exists' }, { status: 400 });
    }
    console.error('Student create error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
