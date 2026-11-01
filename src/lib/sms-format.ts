/** Ghana local numbers are normalised to international format; other E.164 numbers are retained. */
export function normalisePhone(value: string | null): string | null {
  if (!value) return null;
  let phone = value.trim().replace(/[\s().-]/g, '');
  if (/^0\d{9}$/.test(phone)) phone = `233${phone.slice(1)}`;
  else if (phone.startsWith('00')) phone = phone.slice(2);
  else if (phone.startsWith('+')) phone = phone.slice(1);
  return /^[1-9]\d{7,14}$/.test(phone) ? phone : null;
}

export function smsSegments(message: string) {
  const basic = '@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !"#¤%&\'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà';
  const extended = '^{}\\[~]|€\f';
  let units = 0;
  let unicode = false;
  for (const char of message) {
    if (basic.includes(char)) units++;
    else if (extended.includes(char)) units += 2;
    else { unicode = true; break; }
  }
  if (unicode) units = message.length;
  return { encoding: unicode ? 'Unicode' : 'GSM-7', segments: Math.max(1, units <= (unicode ? 70 : 160) ? 1 : Math.ceil(units / (unicode ? 67 : 153))) };
}

