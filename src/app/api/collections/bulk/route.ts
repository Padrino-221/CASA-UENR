import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { auth } from '@/auth';

export async function POST(request: Request) {
  const session = await auth();
  if (!session || (session.user?.role !== 'LOCAL_ADMIN' && session.user?.role !== 'FINANCE')) {
    return NextResponse.json({ error: 'Unauthorized: Only local administrators can perform bulk financial logging.' }, { status: 401 });
  }

  try {
    const { collections } = await request.json();
    const chapterId = session.user.chapterId;

    if (!collections || !Array.isArray(collections)) {
      return NextResponse.json({ error: 'Invalid payload: Expected an array of records.' }, { status: 400 });
    }

    // Resolve natural studentIds to database IDs if present
    const naturalIds = [...new Set(collections.map((c: { studentId?: string }) => c.studentId).filter(Boolean))];
    const studentMap = new Map<string, string>();
    if (naturalIds.length > 0) {
      const students = await db.student.findMany({
        where: { studentId: { in: naturalIds as string[] }, chapterId: chapterId as string },
        select: { id: true, studentId: true }
      });
      students.forEach((s: { id: string; studentId: string }) => studentMap.set(s.studentId, s.id));
    }

    // Process transactions
    const transactionsData = collections.map((c: { amount: string; date?: string; studentId?: string; type?: string; category?: string; description?: string }) => {
      const parsedAmount = parseFloat(c.amount);
      if (isNaN(parsedAmount)) return null;

      let cDate = new Date();
      if (c.date) {
        const parsed = new Date(c.date);
        if (!isNaN(parsed.getTime())) cDate = parsed;
      }

      const internalStudentId = c.studentId ? (studentMap.get(c.studentId) || null) : null;

      return {
        amount: parsedAmount,
        type: c.type || 'INCOME',
        category: String(c.category || 'Offering'),
        description: c.description || null,
        date: cDate,
        chapterId: chapterId,
        studentId: internalStudentId,
        recordedBy: session.user.id
      };
    }).filter((c: Record<string, unknown> | null) => c !== null);

    // Bulk creation
    const created = await db.transaction.createMany({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: transactionsData as any,
    });

    return NextResponse.json({
      message: `Successfully logged ${created.count} financial entries.`,
      count: created.count,
    });
  } catch (error) {
    console.error('Bulk transaction error:', error);
    return NextResponse.json({ error: 'Failed to process bulk transactions.' }, { status: 500 });
  }
}
