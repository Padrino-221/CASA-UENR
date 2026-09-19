import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { auth } from '@/auth';

// Helper to check ownership / authorization
async function checkEventAuth(eventId: string, session: { user?: { role?: string; regionId?: string | null; chapterId?: string | null } }) {
  if (!session?.user) return null;
  
  const role = session.user.role;
  const event = await db.event.findUnique({ where: { id: eventId } });
  
  if (!event) return null;
  
  if (role === 'NATIONAL_ADMIN') return event;
  if (role === 'REGIONAL_ADMIN' && event.regionId === session.user.regionId) return event;
  if (role === 'LOCAL_ADMIN' && event.chapterId === session.user.chapterId) return event;
  
  return null;
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const resolvedParams = await params;
    const eventId = resolvedParams?.id;
    
    console.log('Event PUT handler invoked for eventId:', eventId, 'by user:', session.user.email);

    if (!eventId) {
      return NextResponse.json({ error: 'Missing event ID' }, { status: 400 });
    }

    const authorizedEvent = await checkEventAuth(eventId, session);
    if (!authorizedEvent) {
      console.warn(`Unauthorized edit attempt for eventId ${eventId} by user ${session.user.email}`);
      return NextResponse.json({ error: 'Unauthorized or Event not found' }, { status: 403 });
    }

    const { title, description, date, endDate, venue, category } = await request.json();

    const updatedEvent = await db.event.update({
      where: { id: eventId },
      data: {
        title,
        description,
        date: new Date(date),
        endDate: endDate ? new Date(endDate) : null,
        venue,
        category
      }
    });

    return NextResponse.json(updatedEvent);
  } catch (err) {
    console.error('Event edit error detailed:', err);
    return NextResponse.json({ error: 'Failed to update event', details: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const resolvedParams = await params;
    const eventId = resolvedParams?.id;

    console.log('Event DELETE handler invoked for eventId:', eventId, 'by user:', session.user.email);

    if (!eventId) {
      return NextResponse.json({ error: 'Missing event ID' }, { status: 400 });
    }

    const authorizedEvent = await checkEventAuth(eventId, session);
    if (!authorizedEvent) {
      console.warn(`Unauthorized delete attempt for eventId ${eventId} by user ${session.user.email}`);
      return NextResponse.json({ error: 'Unauthorized or Event not found' }, { status: 403 });
    }

    await db.event.delete({
      where: { id: eventId }
    });
    return NextResponse.json({ success: true, message: 'Event successfully deleted' });
  } catch (err) {
    console.error('Event delete error detailed:', err);
    return NextResponse.json({ error: 'Failed to delete event', details: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
  }
}
