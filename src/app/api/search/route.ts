import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { auth } from '@/auth';
import { isLocalScope } from '@/lib/roles';

export async function GET(request: Request) {
  const session = await auth();
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const role = session.user?.role;
  const regionId = session.user?.regionId;
  const chapterId = session.user?.chapterId;

  try {
    const results: { type: string; title: string; subtitle: string; url: string; id: string }[] = [];

    // 1. Search Students (Available for all roles, but scoped)
    const students = await db.student.findMany({
      where: {
        AND: [
          {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { studentId: { contains: query, mode: 'insensitive' } },
              { email: { contains: query, mode: 'insensitive' } },
            ]
          },
          isLocalScope(role) ? { chapterId: chapterId || 'none' } : {},
          role === 'REGIONAL_ADMIN' ? { chapter: { regionId: regionId || 'none' } } : {},
        ]
      },
      include: { chapter: true },
      take: 6
    });
    
    students.forEach((s: { name: string; studentId: string; chapter: { name: string }; id: string }) => results.push({
      type: 'Member',
      title: s.name,
      subtitle: `${s.studentId} • ${s.chapter?.name ?? 'Unassigned'}`,
      url: `/students?search=${s.studentId}`,
      id: s.id
    }));

    // 2. Search Chapters (National and Regional only)
    if (role === 'NATIONAL_ADMIN' || role === 'REGIONAL_ADMIN') {
      const institutions = await db.chapter.findMany({
        where: {
          AND: [
            { name: { contains: query, mode: 'insensitive' } },
            role === 'REGIONAL_ADMIN' ? { regionId: regionId || 'none' } : {},
          ]
        },
        include: { region: true },
        take: 4
      });
      
      institutions.forEach((i: { name: string; region: { name: string }; id: string }) => results.push({
        type: 'Branch',
        title: i.name,
        subtitle: `Campus in ${i.region.name}`,
        url: `/chapters?search=${i.name}`,
        id: i.id
      }));
    }

    // 3. Search Regions (National only)
    if (role === 'NATIONAL_ADMIN') {
      const regions = await db.region.findMany({
        where: { name: { contains: query, mode: 'insensitive' } },
        take: 3
      });
      
      regions.forEach((r: { name: string; id: string }) => results.push({
        type: 'Region',
        title: r.name,
        subtitle: 'National Territory',
        url: `/regions?search=${r.name}`,
        id: r.id
      }));
    }

    return NextResponse.json({ results });

  } catch (error) {
    console.error('External Search Error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
