export function safeImageUrl(value: string | undefined): string | undefined {
  if (!value) return undefined;
  if (
    /^data:image\/(png|jpeg|gif|webp|avif);base64,[A-Za-z0-9+/=\s]+$/i.test(
      value,
    )
  )
    return value;
  try {
    const url = new URL(value);
    if (url.protocol === 'https:' || url.protocol === 'http:') return url.href;
  } catch {
    /* Invalid input is not rendered. */
  }
  return undefined;
}
export function safeLink(value: string | undefined): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol) ? url.href : undefined;
  } catch {
    return undefined;
  }
}
export function errorMessage(error: unknown): string {
  if (error instanceof DOMException && error.name === 'QuotaExceededError')
    return '保存容量が不足しています。JSONバックアップを取得し、不要な作品や画像を減らしてください。';
  return error instanceof Error
    ? error.message
    : '処理に失敗しました。もう一度お試しください。';
}
