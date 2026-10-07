export const IMAGE_WARNING_BYTES = 2 * 1024 * 1024;
export function readImage(file: File): Promise<string> {
  if (
    ![
      'image/png',
      'image/jpeg',
      'image/webp',
      'image/gif',
      'image/avif',
    ].includes(file.type)
  )
    return Promise.reject(
      new Error('PNG・JPEG・WebP・GIF・AVIFの画像を選択してください。'),
    );
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('画像を読み込めませんでした。'));
    reader.readAsDataURL(file);
  });
}
