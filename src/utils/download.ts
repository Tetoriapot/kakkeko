export function downloadBlob(data: Blob, filename: string) {
  const url = URL.createObjectURL(data);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}
export function downloadText(
  content: string,
  filename: string,
  type = 'application/json',
) {
  downloadBlob(
    new Blob([content], { type: `${type};charset=utf-8` }),
    filename,
  );
}
export const safeFilename = (value: string) =>
  value
    // Control characters are forbidden in Windows filenames.
    // eslint-disable-next-line no-control-regex
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, '_')
    .replace(/[. ]+$/g, '')
    .slice(0, 80) || 'kakkeko';
