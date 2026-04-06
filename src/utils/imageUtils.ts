import { MAX_IMAGE_WIDTH_PX, MAX_UPLOAD_SIZE_MB } from '@/constants/workoutDefaults';

export function validateImageFile(file: File): string | null {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowed.includes(file.type)) {
    return 'Only JPEG, PNG, and WebP images are supported.';
  }
  if (file.size > MAX_UPLOAD_SIZE_MB * 1024 * 1024) {
    return `Image must be smaller than ${MAX_UPLOAD_SIZE_MB} MB.`;
  }
  return null;
}

export async function resizeAndEncodeBase64(
  file: File
): Promise<{ base64: string; mimeType: 'image/jpeg' | 'image/png' | 'image/webp' }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      const scale = Math.min(1, MAX_IMAGE_WIDTH_PX / img.width);
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas not supported'));
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      const base64 = dataUrl.split(',')[1];
      resolve({ base64, mimeType: 'image/jpeg' });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}
