import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { auth } from '@/auth';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session || (session.user?.role !== 'LOCAL_ADMIN' && session.user?.role !== 'FINANCE')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { amount, category, date, description, type } = await request.json();
    const transaction = await db.transaction.findUnique({ where: { id } });
    
    if (transaction?.chapterId !== session.user?.chapterId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updated = await db.transaction.update({
      where: { id },
      data: { 
        amount: amount ? parseFloat(amount) : undefined, 
        category, 
        type,
        description,
        date: date ? new Date(date) : undefined 
      }
    });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Failed to update financial record' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session || (session.user?.role !== 'LOCAL_ADMIN' && session.user?.role !== 'FINANCE')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const transaction = await db.transaction.findUnique({ where: { id } });
    if (transaction?.chapterId !== session.user?.chapterId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await db.transaction.delete({ where: { id } });
    return NextResponse.json({ message: 'Financial record deleted' });
  } catch {
    return NextResponse.json({ error: 'Failed to delete record' }, { status: 500 });
  }
}
