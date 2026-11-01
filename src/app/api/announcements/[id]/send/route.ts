import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { getSecretarySession } from '@/lib/secretary';
import { sendArkeselSms, smsConfiguration } from '@/lib/sms';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSecretarySession();
  if (!session) return NextResponse.json({ error: 'Secretary access required' }, { status: 403 });
  const body = await request.json().catch(() => null);
  if (body?.confirm !== true) return NextResponse.json({ error: 'Review and confirm the announcement first.' }, { status: 400 });
  const { id } = await params;
  const draft = await db.announcement.findFirst({ where: { id, chapterId: session.user.chapterId! } });
  if (!draft) return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });
  const config = smsConfiguration();
  if (!config.configured) return NextResponse.json({ error: 'Arkesel is not configured. Set ARKESEL_API_KEY and ARKESEL_SENDER_ID on the server.' }, { status: 503 });
  if (draft.sender !== config.sender) return NextResponse.json({ error: 'The sender has changed. Create a fresh preview before sending.' }, { status: 409 });
  const claim = await db.announcement.updateMany({ where: { id, chapterId: session.user.chapterId!, status: 'DRAFT' }, data: { status: 'SENDING' } });
  if (!claim.count) return NextResponse.json({ error: 'This announcement has already been submitted. Check its status before sending another.' }, { status: 409 });
  try {
    const result = await sendArkeselSms(draft.sender, draft.message, draft.recipients as string[]);
    const status = result.accepted ? 'ACCEPTED' : result.definite ? 'FAILED' : 'UNKNOWN';
    const error = result.accepted ? null : result.definite ? 'Arkesel rejected the request. Check your API key, sender approval, and SMS balance.' : 'Submission could not be confirmed. Check your Arkesel dashboard before sending again.';
    await db.announcement.update({ where: { id }, data: { status, providerResponse: result.data ?? undefined, error, sentAt: result.accepted ? new Date() : null } });
    return NextResponse.json({ status, ...(error ? { error } : { message: 'Accepted by Arkesel. Final handset delivery is not yet confirmed.' }) }, { status: result.accepted ? 200 : 502 });
  } catch {
    await db.announcement.update({ where: { id }, data: { status: 'UNKNOWN', error: 'Submission could not be confirmed. Check your Arkesel dashboard before sending again.' } });
    return NextResponse.json({ error: 'Could not confirm submission. Check Arkesel before sending again.', status: 'UNKNOWN' }, { status: 502 });
  }
}
