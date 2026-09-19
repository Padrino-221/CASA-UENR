import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { auth } from '@/auth';

export async function POST(request: Request) {
  const session = await auth();
  if (!session || session.user?.role !== 'LOCAL_ADMIN') {
    return NextResponse.json({ error: 'Unauthorized: Only local administrators can perform bulk registration.' }, { status: 401 });
  }

  try {
    const { students } = await request.json();
    const chapterId = session.user.chapterId as string;

    if (!students || !Array.isArray(students)) {
      return NextResponse.json({ error: 'Invalid payload: Expected an array of students.' }, { status: 400 });
    }

    // Process students to ensure they are bound to the right chapter
    const studentsData = students.map((s: { studentId?: string; name?: string; status?: string; email?: string; phone?: string; department?: string; levelYear?: string; maxLevel?: string; nextOfKinName?: string; nextOfKinPhone?: string; enrollmentDate?: string | Date; isLeader?: string | boolean; position?: string }) => {
      let eDate = new Date();
      if (s.enrollmentDate) {
        const parsed = new Date(s.enrollmentDate);
        if (!isNaN(parsed.getTime())) eDate = parsed;
      }
      
      return {
        studentId: String(s.studentId || ''),
        name: String(s.name || 'Unknown Member'),
        status: s.status ? String(s.status) : 'ACTIVE',
        email: s.email ? String(s.email) : null,
        phone: s.phone ? String(s.phone) : null,
        department: s.department ? String(s.department) : null,
        levelYear: s.levelYear ? String(s.levelYear) : null,
        maxLevel: s.maxLevel ? String(s.maxLevel) : '400',
        nextOfKinName: s.nextOfKinName ? String(s.nextOfKinName) : null,
        nextOfKinPhone: s.nextOfKinPhone ? String(s.nextOfKinPhone) : null,
        enrollmentDate: eDate,
        chapterId: chapterId,
        isLeader: s.isLeader === 'true' || s.isLeader === true,
        position: s.position ? String(s.position) : null,
      };
    }).filter((s: { studentId: string }) => s.studentId);

    // Manually filter out existing student IDs as SQLite does not support skipDuplicates in createMany
    const studentIdsToCreate = studentsData.map((s: { studentId: string }) => s.studentId);
    const existingStudents = await db.student.findMany({
      where: {
        studentId: { in: studentIdsToCreate }
      },
      select: { studentId: true }
    });

    const existingIdsSet = new Set(existingStudents.map((s: { studentId: string }) => s.studentId));
    const uniqueStudentsData = studentsData.filter((s: { studentId: string }) => !existingIdsSet.has(s.studentId));

    if (uniqueStudentsData.length === 0) {
      return NextResponse.json({
        message: 'No new student records were created. All provided IDs already exist.',
        count: 0,
      });
    }

    // Bulk creation
    const created = await db.student.createMany({
      data: uniqueStudentsData,
    });

    return NextResponse.json({
      message: `Successfully initialized ${created.count} record(s).`,
      count: created.count,
    });
  } catch (error) {
    console.error('Bulk registration error:', error);
    return NextResponse.json({ error: 'Failed to process bulk registration.' }, { status: 500 });
  }
}
