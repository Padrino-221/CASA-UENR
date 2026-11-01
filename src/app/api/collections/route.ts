import { canViewAdministrativeData } from '@/lib/roles';
import { parseMoney, validTransactionType } from '@/lib/money';
import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { auth } from '@/auth';
import { createAuditLog } from '@/lib/audit';
import { isLocalScope, canManageFinance } from '@/lib/roles';

export async function GET(request: Request) {
  const session = await auth();
    if (session && !canViewAdministrativeData(session.user?.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const chapterId = searchParams.get('chapterId');
  const type = searchParams.get('type');
  const page = Math.max(1, Number(searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(10, Number(searchParams.get('limit') || '50')));
  const skip = (page - 1) * limit;

  const role = session.user?.role;
  if (!canManageFinance(role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const contextId = role === 'REGIONAL_ADMIN' ? session.user?.regionId : session.user?.chapterId;

  try {
    const transactions = await db.transaction.findMany({
      where: {
        AND: [
          chapterId ? { chapterId } : {},
          type ? { type } : {},
          isLocalScope(role) ? { chapterId: contextId || 'none' } : {},
          role === 'REGIONAL_ADMIN' ? { chapter: { regionId: contextId || 'none' } } : {},
        ]
      },
      include: {
        chapter: { select: { name: true } },
        student: { select: { name: true } }
      },
      orderBy: { date: 'desc' },
      skip,
      take: limit
    });
    return NextResponse.json(transactions.map(t => ({ ...t, amount: Number(t.amount) })));
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (session && !canViewAdministrativeData(session.user?.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!canManageFinance(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden: You cannot record transactions' }, { status: 403 });
    }

    const { amount, category, date, chapterId, type, description, studentId } = await req.json();

    if (!amount || !category || !date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let parsedAmount;
    if (!validTransactionType(type || 'INCOME') || typeof category !== 'string' || !category.trim() ||
        typeof date !== 'string' || !Number.isFinite(new Date(date).getTime())) {
      return NextResponse.json({ error: 'Invalid category, type, or date' }, { status: 400 });
    }
    try { parsedAmount = parseMoney(amount); } catch (error) {
      return NextResponse.json({ error: (error as Error).message }, { status: 400 });
    }
    let targetChapterId = chapterId;
    if (isLocalScope(session.user.role)) {
      targetChapterId = session.user.chapterId;
    } else if (session.user.role === 'REGIONAL_ADMIN') {
      const chapter = await db.chapter.findUnique({
        where: { id: chapterId },
        select: { regionId: true }
      });
      if (!chapter || chapter.regionId !== session.user.regionId) {
        return NextResponse.json({ error: 'Forbidden: Chapter is outside your region' }, { status: 403 });
      }
    }

    if (!targetChapterId) {
      return NextResponse.json({ error: 'Chapter context missing' }, { status: 400 });
    }

    if (studentId && !await db.student.findFirst({ where: { id: studentId, chapterId: targetChapterId } })) {
      return NextResponse.json({ error: 'Member is outside this chapter' }, { status: 403 });
    }
    const transaction = await db.transaction.create({
      data: {
        amount: parsedAmount,
        type: type || 'INCOME',
        category,
        description,
        studentId,
        date: new Date(date),
        chapterId: targetChapterId,
        recordedBy: session.user.id
      }
    });

    // AUDIT LOG
    await createAuditLog({
      userId: session.user.id as string,
      action: 'CREATE',
      entity: 'TRANSACTION',
      entityId: transaction.id,
      metadata: { amount: transaction.amount, category: transaction.category, type: transaction.type }
    });

    return NextResponse.json({ ...transaction, amount: Number(transaction.amount) }, { status: 201 });
  } catch (error) {
    console.error('Error recording transaction:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
