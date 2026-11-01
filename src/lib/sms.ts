export { normalisePhone, smsSegments } from './sms-format';

export function smsConfiguration() {
  const sender = process.env.ARKESEL_SENDER_ID?.trim() || '';
  return { sender, configured: Boolean(process.env.ARKESEL_API_KEY && /^[a-zA-Z0-9 ]{1,11}$/.test(sender)) };
}

export async function sendArkeselSms(sender: string, message: string, recipients: string[]) {
  const response = await fetch('https://sms.arkesel.com/api/v2/sms/send', {
    method: 'POST',
    headers: { 'api-key': process.env.ARKESEL_API_KEY || '', 'Content-Type': 'application/json' },
    body: JSON.stringify({ sender, message, recipients }),
    signal: AbortSignal.timeout(20000),
    cache: 'no-store',
  });
  const data = await response.json().catch(() => null);
  // An ambiguous gateway response must not trigger an automatic resend.
  if (!response.ok) return { accepted: false, data, definite: response.status >= 400 && response.status < 500 };
  return { accepted: data?.status === 'success', data, definite: Boolean(data?.status === 'error') };
}
