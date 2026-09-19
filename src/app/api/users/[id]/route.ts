import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { auth } from '@/auth';
import bcrypt from 'bcryptjs';

/**
 * Verifies a REGIONAL_ADMIN has jurisdiction over a LOCAL_ADMIN.
 * LOCAL_ADMINs do not carry regionId directly — it is resolved through their chapter.
 */
async function regionalAdminHasJurisdiction(
  operatorRegionId: string | null | undefined,
  targetUser: { role: string; chapterId: string | null }
): Promise<boolean> {
  if (targetUser.role !== 'LOCAL_ADMIN' || !targetUser.chapterId || !operatorRegionId) return false;
  const chapter = await db.chapter.findUnique({
    where: { id: targetUser.chapterId },
    select: { regionId: true }
  });
  return !!chapter && chapter.regionId === operatorRegionId;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const currentRole = session.user?.role;

  try {
    const userToUpdate = await db.user.findUnique({ where: { id } });
    if (!userToUpdate) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Permissions:
    // National can edit anyone.
    // Regional can edit Local Admins within their own region (resolved via chapter).
    if (currentRole === 'REGIONAL_ADMIN') {
      const hasJurisdiction = await regionalAdminHasJurisdiction(session.user?.regionId, userToUpdate);
      if (!hasJurisdiction) {
        return NextResponse.json({ error: 'Forbidden: You can only manage local admins in your jurisdiction.' }, { status: 403 });
      }
    } else if (currentRole !== 'NATIONAL_ADMIN') {
       return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { name, email, password, role, chapterId, regionId } = body;

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role;
    if (chapterId !== undefined && chapterId !== '') updateData.chapterId = chapterId;
    if (regionId !== undefined && regionId !== '') updateData.regionId = regionId;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await db.user.update({
      where: { id },
      data: updateData,
      include: {
        region: { select: { name: true } },
        chapter: { select: { name: true } },
      }
    });

    return NextResponse.json({ ...updatedUser, password: undefined });
  } catch (err) {
    console.error('User update error:', err);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const currentRole = session.user?.role;

  try {
    const userToDelete = await db.user.findUnique({ where: { id } });
    if (!userToDelete) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Protection for root (Optional but good)
    if (userToDelete.email === 'national@uchms.org') {
       return NextResponse.json({ error: 'Protected account cannot be decommissioned.' }, { status: 403 });
    }

    if (currentRole === 'REGIONAL_ADMIN') {
      const hasJurisdiction = await regionalAdminHasJurisdiction(session.user?.regionId, userToDelete);
      if (!hasJurisdiction) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    } else if (currentRole !== 'NATIONAL_ADMIN') {
       return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await db.user.delete({ where: { id } });
    return NextResponse.json({ message: 'Administrative account decommissioned successfully.' });
  } catch (err) {
    console.error('User delete error:', err);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
