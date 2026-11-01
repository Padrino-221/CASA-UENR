import sharp from 'sharp';

export const MAX_IMAGE_UPLOAD_BYTES = 100 * 1024 * 1024;

/** Decode actual image bytes, auto-orient, preserve animation, and cap both dimensions. */
export async function compressMediaImage(bytes: Uint8Array): Promise<Buffer> {
  return sharp(bytes, { animated: true, limitInputPixels: 100_000_000 })
    .rotate()
    .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 80, effort: 4 })
    .toBuffer();
}
