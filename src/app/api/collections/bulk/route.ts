import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { auth } from '@/auth';
import { parseMoney, validTransactionType } from '@/lib/money';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.chapterId || !['LOCAL_ADMIN', 'FINANCE'].includes(session.user.role || '')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  try {
    const { collections } = await request.json();
    if (!Array.isArray(collections) || !collections.length || collections.length > 1000) {
      return NextResponse.json({ error: 'Provide between 1 and 1000 records' }, { status: 400 });
    }
    const chapterId = session.user.chapterId;
    const naturalIds = [...new Set(collections.map((c: { studentId?: string }) => c.studentId).filter(Boolean))] as string[];
    const students = await db.student.findMany({
      where: { studentId: { in: naturalIds }, chapterId }, select: { id: true, studentId: true }
    });
    const studentMap = new Map(students.map(s => [s.studentId, s.id]));
    // Validate every row before the atomic insert; never silently skip invalid rows.
    let data;
    try {
      data = collections.map((c: { amount: unknown; date?: string; studentId?: string; type?: string; category?: string; description?: string }) => {
        const amount = parseMoney(c.amount);
        const type = c.type || 'INCOME';
        const date = c.date ? new Date(c.date) : new Date();
        const category = c.category || 'Offering';
        if (!validTransactionType(type) || !Number.isFinite(date.getTime()) || typeof category !== 'string' || !category.trim()) {
          throw new Error('Invalid category, type, or date');
        }
        if (c.studentId && !studentMap.has(c.studentId)) throw new Error('Unknown member or member outside this chapter');
        return { amount, type, date, category, description: c.description || null,
          chapterId, studentId: c.studentId ? studentMap.get(c.studentId)! : null, recordedBy: session.user.id };
      });
    } catch (error) {
      return NextResponse.json({ error: (error as Error).message }, { status: 400 });
    }
    const created = await db.transaction.createMany({ data });
    return NextResponse.json({ message: `Successfully logged ${created.count} financial entries.`, count: created.count });
  } catch (error) {
    console.error('Bulk transaction error:', error);
    return NextResponse.json({ error: 'Failed to process bulk transactions' }, { status: 500 });
  }
}
