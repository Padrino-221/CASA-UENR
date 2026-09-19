import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET(request: Request) {
  const session = await auth();
  if (!session || session.user?.role !== 'NATIONAL_ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const [regions, institutions, students] = await Promise.all([
      db.region.findMany({
        where: { name: { contains: query, mode: 'insensitive' } },
        take: 3,
        select: { id: true, name: true }
      }),
      db.chapter.findMany({
        where: { name: { contains: query, mode: 'insensitive' } },
        take: 5,
        select: { id: true, name: true, university: true, campus: true }
      }),
      db.student.findMany({
        where: { 
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { studentId: { contains: query, mode: 'insensitive' } }
          ]
        },
        take: 10,
        select: { id: true, name: true, studentId: true, levelYear: true, chapter: { select: { name: true } } }
      })
    ]);

    const results = [
      ...regions.map((r: { id: string; name: string }) => ({ type: 'REGION', id: r.id, title: r.name, subtitle: 'Region Secretariat', link: `/regions` })),
      ...institutions.map((i: { id: string; name: string; university: string | null; campus: string | null }) => ({ type: 'BRANCH', id: i.id, title: i.name, subtitle: `${i.university} - ${i.campus || 'Main'}`, link: `/chapters` })),
      ...students.map((s: { id: string; name: string; levelYear: string | null; chapter: { name: string }; studentId: string }) => ({ type: 'MEMBER', id: s.id, title: s.name, subtitle: `${s.levelYear} | ${s.chapter?.name ?? 'Unassigned'} (${s.studentId})`, link: `/students` }))
    ];

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Global search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
