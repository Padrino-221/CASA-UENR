// Leave room for multipart headers below the hosting platform's request limit.
export const MAX_UPLOAD_PAYLOAD = 3_800_000;

export async function prepareImageUpload(file: File): Promise<File> {
  if (!file.size) throw new Error('The selected image is empty.');
  if (file.size > 100 * 1024 * 1024) throw new Error('This image exceeds the 100 MB upload limit.');
  if (file.size <= MAX_UPLOAD_PAYLOAD) return file;

  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    const scale = Math.min(1, 1600 / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Image processing unavailable.');
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    for (const quality of [0.85, 0.7, 0.5]) {
      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/webp', quality));
      if (blob && blob.size <= MAX_UPLOAD_PAYLOAD) {
        return new File([blob], `${file.name.replace(/\.[^.]+$/, '')}.${blob.type === 'image/webp' ? 'webp' : 'png'}`, { type: blob.type });
      }
    }
    throw new Error('Image remains too large.');
  } catch {
    throw new Error('Could not optimise this large image. Export it as JPG, PNG or WebP and try again.');
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function uploadCmsImage(file: File) {
  const prepared = await prepareImageUpload(file);
  const form = new FormData();
  form.append('file', prepared);
  const response = await fetch('/api/content/upload', { method: 'POST', body: form });
  if (response.status === 413) throw new Error('The server rejected the image size. Choose a smaller image and try again.');
  if (response.status === 401 || response.redirected) throw new Error('Your session has expired. Sign in again, then retry the upload.');
  const data = await response.json().catch(() => null);
  if (!response.ok || !data?.url) throw new Error(data?.error || 'Upload failed. Please try again.');
  return data;
}
