import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const region = await db.region.findUnique({
      where: { id },
      include: {
        _count: {
          select: { chapters: true, events: true }
        },
        chapters: {
          include: {
            _count: {
              select: { students: true }
            }
          }
        }
      }
    });

    if (!region) {
      return NextResponse.json({ error: 'Region not found' }, { status: 404 });
    }

    return NextResponse.json(region);
  } catch (error) {
    console.error('Region fetch error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}


export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session || session.user?.role !== 'NATIONAL_ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { name } = await request.json();
    const updated = await db.region.update({
      where: { id },
      data: { name }
    });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Failed to update region' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session || session.user?.role !== 'NATIONAL_ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Note: Due to lack of cascade in schema, we might need manual cleanup 
    // or rely on Prisma if we update schema later. 
    // For now, simple delete.
    await db.region.delete({
      where: { id }
    });
    return NextResponse.json({ message: 'Region deleted' });
  } catch {
    return NextResponse.json({ error: 'Failed to delete region. Ensure all chapters are removed first.' }, { status: 500 });
  }
}
