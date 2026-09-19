import React from 'react';
import { db } from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import StudentList from '@/components/students/StudentList';
import { Student } from '@/types/models';
import { isLocalScope } from '@/lib/roles';

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ 
    search?: string; 
    regionId?: string; 
    chapterId?: string; 
    status?: string; 
    level?: string; 
    dept?: string;
  }>;
}) {
  const session = await auth();
  if (!session) redirect('/login');

  const { search, regionId: filterRegionId, chapterId: filterChapterId, status: filterStatus, level: filterLevel, dept: filterDept } = await searchParams;
  const role = session.user?.role;
  const userRegionId = session.user?.regionId ?? undefined;
  const userChapterId = session.user?.chapterId ?? undefined;

  // Build prisma query based on role and search
  const where: Record<string, unknown> = {};
  
  if (role === 'REGIONAL_ADMIN' && userRegionId) {
    where.chapter = { regionId: userRegionId };
  } else if (isLocalScope(role) && userChapterId) {
    where.chapterId = userChapterId;
  }

  // Apply filters from searchParams
  if (filterRegionId && role === 'NATIONAL_ADMIN') {
    where.chapter = { ...(where.chapter as Record<string, unknown>), regionId: filterRegionId };
  }
  
  if (filterChapterId) {
    where.chapterId = filterChapterId;
  }

  if (filterStatus) {
    where.status = filterStatus;
  }

  if (filterLevel) {
    const isNumeric = /^\d+$/.test(filterLevel);
    const levelAlts = [
      filterLevel,
      isNumeric ? `Level ${filterLevel}` : filterLevel.replace('Level ', '')
    ];
    where.levelYear = { in: levelAlts };
  }

  if (filterDept) {
    where.department = { contains: filterDept, mode: 'insensitive' };
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { studentId: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } }
    ];
  }

  let students, institutions, regions;
  try {
    [students, institutions, regions] = await Promise.all([
      db.student.findMany({
        where,
        include: {
          chapter: {
            include: { region: true }
          }
        },
        orderBy: { enrollmentDate: 'desc' }
      }),
      db.chapter.findMany({
          where: role === 'REGIONAL_ADMIN' ? { regionId: userRegionId } : (isLocalScope(role) ? { id: userChapterId } : (filterRegionId ? { regionId: filterRegionId } : {})),
          select: { id: true, name: true }
      }),
      role === 'NATIONAL_ADMIN' ? db.region.findMany({ select: { id: true, name: true } }) : Promise.resolve([])
    ]);
  } catch (error) {
    console.error('Students Page Data Fetch Error:', error);
    return (
      <div className="p-20 text-center">
        <h2 className="text-2xl font-bold text-red-600">Connection Error</h2>
        <p className="text-slate-500 mt-2">Could not connect to the database. Try restarting the server.</p>
        <pre className="mt-4 p-4 bg-slate-100 text-xs text-left overflow-auto max-w-xl mx-auto">
          {error instanceof Error ? error.message : String(error)}
        </pre>
      </div>
    );
  }

  return (
    <div className="w-full">
      <StudentList 
        initialStudents={students as unknown as Student[]} 
        chapters={institutions} 
        regions={regions}
        role={role || 'NATIONAL_ADMIN'} 
      />
    </div>
  );
}
