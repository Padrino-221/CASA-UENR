import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { auth } from '@/auth';
import bcrypt from 'bcryptjs';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const role = session.user?.role;
  if (role !== 'REGIONAL_ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { name, university, type, regionId, adminId, adminName, adminEmail, adminPassword } = body;
    const chapterType = university || type;
    
    if (role === 'REGIONAL_ADMIN' && regionId && regionId !== session.user?.regionId) {
       return NextResponse.json({ error: 'Forbidden: Cannot move chapter to another region' }, { status: 403 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await db.$transaction(async (tx: any) => {
      const updated = await tx.chapter.update({
        where: { id },
        data: { name, university: chapterType, regionId }
      });

      if (adminId) {
        const updateData: Record<string, unknown> = {};
        if (adminName) updateData.name = adminName;
        if (adminEmail) updateData.email = adminEmail;
        if (adminPassword) updateData.password = await bcrypt.hash(adminPassword, 10);

        if (Object.keys(updateData).length > 0) {
          await tx.user.update({
            where: { id: adminId },
            data: updateData
          });
        }
      } else if (adminName && adminEmail && adminPassword) {
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        await tx.user.create({
          data: {
            name: adminName,
            email: adminEmail,
            password: hashedPassword,
            role: 'LOCAL_ADMIN',
            chapterId: id
          }
        });
      }

      return updated;
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error('Chapter update error:', err);
    return NextResponse.json({ error: 'Failed to update chapter' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const role = session.user?.role;
  if (role !== 'REGIONAL_ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const ch = await db.chapter.findUnique({ where: { id } });
    if (role === 'REGIONAL_ADMIN' && ch?.regionId !== session.user?.regionId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await db.chapter.delete({ where: { id } });
    return NextResponse.json({ message: 'Chapter deleted' });
  } catch {
    return NextResponse.json({ error: 'Failed to delete chapter' }, { status: 500 });
  }
}
