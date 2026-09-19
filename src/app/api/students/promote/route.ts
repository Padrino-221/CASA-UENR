import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { auth } from '@/auth';

export async function POST() {
  const session = await auth();
  
  if (!session || !session.user?.chapterId || session.user?.role !== 'LOCAL_ADMIN') {
    return NextResponse.json({ 
      error: 'Unauthorized: Academic promotion can only be executed by localized administrators.' 
    }, { status: 401 });
  }

  const chapterId = session.user.chapterId;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await db.$transaction(async (tx: any) => {
      const students = await tx.student.findMany({
        where: { chapterId, status: 'ACTIVE', levelYear: { not: null } },
        select: { id: true, levelYear: true, maxLevel: true }
      });

      let graduated = 0;
      let advanced = 0;

      for (const student of students) {
        const currentLevel = parseInt(student.levelYear);
        const maxLevel = parseInt(student.maxLevel || '400');
        const nextLevel = currentLevel + 100;

        if (nextLevel > maxLevel) {
          await tx.student.update({
            where: { id: student.id },
            data: { status: 'ALUMNI', levelYear: 'Alumni', isLeader: false, position: null }
          });
          graduated++;
        } else {
          await tx.student.update({
            where: { id: student.id },
            data: { levelYear: String(nextLevel) }
          });
          advanced++;
        }
      }

      return { graduated, advanced };
    });

    return NextResponse.json({
      message: `Academic cycle concluded. ${result.graduated} finalists transitioned to Alumni and ${result.advanced} students advanced to the next level.`,
      data: result
    });

  } catch (error) {
    console.error('Academic Promotion Error:', error);
    return NextResponse.json({ 
      error: 'A system error occurred during the academic transition.' 
    }, { status: 500 });
  }
}
