import { parseMoney, validTransactionType } from '@/lib/money';
import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { auth } from '@/auth';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.chapterId || (session.user?.role !== 'LOCAL_ADMIN' && session.user?.role !== 'FINANCE')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { amount, category, date, description, type } = await request.json();
    let parsedAmount;
    try { if (amount !== undefined) parsedAmount = parseMoney(amount); } catch (error) {
      return NextResponse.json({ error: (error as Error).message }, { status: 400 });
    }
    if ((type !== undefined && !validTransactionType(type)) ||
        (category !== undefined && (typeof category !== 'string' || !category.trim())) ||
        (date !== undefined && (typeof date !== 'string' || !Number.isFinite(new Date(date).getTime())))) {
      return NextResponse.json({ error: 'Invalid financial record' }, { status: 400 });
    }
    const transaction = await db.transaction.findUnique({ where: { id } });

    if (transaction?.chapterId !== session.user?.chapterId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updated = await db.transaction.update({
      where: { id },
      data: {
        amount: parsedAmount,
        category,
        type,
        description,
        date: date ? new Date(date) : undefined
      }
    });
    return NextResponse.json({ ...updated, amount: Number(updated.amount) });
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
  if (!session?.user?.chapterId || (session.user?.role !== 'LOCAL_ADMIN' && session.user?.role !== 'FINANCE')) {
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
