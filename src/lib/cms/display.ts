export function cmsText(value: string | undefined): string { return (value || '').replace(/\*([^*]+)\*/g, '$1'); }
export function sectionVisible(content: Record<string,string>, key: string): boolean { return content[`${key}.enabled`] !== 'false'; }
export function safeHref(value: string | undefined, fallback = '/contact'): string {
  const url = (value || '').trim();
  if (/^\/(?![\/\\])/.test(url) && !/[\\\u0000-\u001f]/.test(url)) return url;
  if (/^#[a-zA-Z0-9_-]+$/.test(url)) return url;
  try { const parsed = new URL(url); if (['https:','mailto:','tel:'].includes(parsed.protocol)) return url; } catch { /* invalid editor input uses a safe destination */ }
  return fallback;
}

export function jsonLd(value: unknown): string { return JSON.stringify(value).replace(/</g, String.fromCharCode(92) + 'u003c'); }
