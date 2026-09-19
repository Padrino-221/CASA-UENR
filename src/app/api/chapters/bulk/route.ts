import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { auth } from '@/auth';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  const session = await auth();
  if (!session || (session.user?.role !== 'REGIONAL_ADMIN' && session.user?.role !== 'NATIONAL_ADMIN')) {
    return NextResponse.json({ error: 'Forbidden: Only Regional or National Administrators can perform bulk chapter onboarding.' }, { status: 403 });
  }

  try {
    const { chapters, targetRegionId } = await request.json();
    
    const regionId = session.user?.role === 'NATIONAL_ADMIN' ? targetRegionId : session.user?.regionId;

    if (!regionId) {
      return NextResponse.json({ error: 'Constraint Error: Your account is not currently assigned to a valid Region.' }, { status: 400 });
    }

    if (!chapters || !Array.isArray(chapters)) {
      return NextResponse.json({ error: 'Validation: Invalid data format. Please upload a valid CSV roster.' }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results = await db.$transaction(async (tx: any) => {
      const createdChapters = [];
      const createdAdmins = [];

      for (const item of chapters) {
        const { institutionName, institutionType, adminName, adminEmail, adminPassword } = item;

        if (!institutionName || !adminName || !adminEmail || !adminPassword) {
          throw new Error(`Validation: Missing mandatory details for chapter: ${institutionName || 'Unknown Name'}`);
        }

        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        const chapter = await tx.chapter.create({
          data: { 
            name: institutionName,
            university: institutionType || 'University',
            regionId: regionId
          }
        });

        const admin = await tx.user.create({
          data: {
            name: adminName,
            email: adminEmail,
            password: hashedPassword,
            role: 'LOCAL_ADMIN',
            regionId: regionId,
            chapterId: chapter.id
          }
        });

        createdChapters.push(chapter);
        createdAdmins.push(admin);
      }

      return { chapters: createdChapters, admins: createdAdmins };
    });

    return NextResponse.json({ 
      message: `Successfully created ${results.chapters.length} chapters and local administrators.`,
      count: results.chapters.length 
    });

  } catch (err) {
    console.error('Chapter Bulk Import Error:', err);
    const error = err as { code?: string; message?: string };
    if (error.code === 'P2002') {
      return NextResponse.json({ 
        error: 'Conflict: One or more Chapter names or Admin Emails already exist in the system.' 
      }, { status: 400 });
    }

    if (error.code === 'P2003') {
      return NextResponse.json({ 
        error: 'Constraint Error: The target Region ID does not exist. Please ensure a region is created before onboarding chapters.' 
      }, { status: 400 });
    }

    if (error.message && error.message.startsWith('Validation:')) {
      return NextResponse.json({ error: error.message.replace('Validation:', '').trim() }, { status: 400 });
    }

    return NextResponse.json({ 
      error: 'An internal error occurred during chapter provisioning. Please verify your CSV format.' 
    }, { status: 500 });
  }
}
