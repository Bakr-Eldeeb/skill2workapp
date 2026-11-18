export function safeUrl(value: string | undefined): string {
  if (!value?.trim()) return '';
  try {
    const u = new URL(value.trim());
    return u.protocol === 'https:' && !u.username && !u.password ? u.href : '';
  } catch {
    return '';
  }
}
export function validateLinks(values: (string | undefined)[]) {
  if (values.some((v) => v?.trim() && !safeUrl(v)))
    throw Error('Use a complete https:// link without embedded credentials.');
}
export const validEmail = (v: string) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
