import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { auth } from '@/auth';
import { canManageMembers } from '@/lib/roles';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session || !canManageMembers(session.user?.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const student = await db.student.findUnique({ where: { id } });

    if (student?.chapterId !== session.user?.chapterId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const editable = ['name', 'studentId', 'email', 'phone', 'department', 'levelYear',
      'maxLevel', 'address', 'nextOfKinName', 'nextOfKinPhone', 'status', 'isLeader',
      'position', 'baptismDate', 'confirmationDate'];
    if (Object.keys(body).some((key) => !editable.includes(key))) {
      return NextResponse.json({ error: 'Unsupported member field' }, { status: 400 });
    }
    const updateData = Object.fromEntries(Object.entries(body).filter(([key]) => editable.includes(key)));

    const updated = await db.student.update({
      where: { id },
      data: updateData
    });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Failed to update member' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session || !canManageMembers(session.user?.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const student = await db.student.findUnique({ where: { id } });
    if (student?.chapterId !== session.user?.chapterId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await db.student.delete({ where: { id } });
    return NextResponse.json({ message: 'Member deleted' });
  } catch {
    return NextResponse.json({ error: 'Failed to delete member' }, { status: 500 });
  }
}
