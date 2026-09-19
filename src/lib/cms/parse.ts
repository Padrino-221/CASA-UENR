export function parseList<T = Record<string, string>>(value: string | undefined): T[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

export function parseTags(value: string | undefined): string[] {
  return parseList<string>(value).filter((tag): tag is string => typeof tag === 'string');
}

export function parseParagraphs(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export function parseLines(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}
