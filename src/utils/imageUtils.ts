/**
 * Client-side Image Processing and Validation Utilities
 * Converts uploaded image files to optimized, high-fidelity Base64 Data URIs
 * with strict MIME-type and size validation.
 */

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
}

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
  'image/svg+xml',
];

const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15 Megabytes

/**
 * Validates file MIME type and maximum size
 */
export function validateImageFile(file: File): ImageValidationResult {
  if (!file) {
    return { valid: false, error: 'No file selected.' };
  }

  const isTypeAllowed =
    ALLOWED_MIME_TYPES.includes(file.type.toLowerCase()) ||
    /\.(jpe?g|png|webp|avif|gif|svg)$/i.test(file.name);

  if (!isTypeAllowed) {
    return {
      valid: false,
      error: 'Invalid file format. Please upload a JPG, PNG, WebP, AVIF, or GIF image.',
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File size (${sizeInMb}MB) exceeds the 15MB limit. Please choose a smaller photo.`,
    };
  }

  return { valid: true };
}

/**
 * Reads a File as a raw Data URI fallback
 */
export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read image as data URL'));
      }
    };
    reader.onerror = () => reject(reader.error || new Error('FileReader error'));
    reader.readAsDataURL(file);
  });
}

/**
 * Converts an image file into an optimized, high-fidelity Base64 Data URI.
 * Dynamically scales down ultra-high-resolution images (e.g. 6000x4000 camera raws)
 * to a crisp 1920px max dimension, preventing browser localStorage quota exhaustion
 * while maintaining pristine visual fidelity for luxury furniture rendering.
 */
export async function convertFileToDataUri(
  file: File,
  options?: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
  }
): Promise<string> {
  // SVGs and GIFs are read directly to preserve animation and vector scalability
  if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
    return readFileAsDataUrl(file);
  }

  const maxWidth = options?.maxWidth || 1920;
  const maxHeight = options?.maxHeight || 1920;
  const quality = options?.quality || 0.85;

  try {
    const rawDataUrl = await readFileAsDataUrl(file);

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        // If dimensions are within bounds and file is reasonably small, use raw
        if (width <= maxWidth && height <= maxHeight && file.size < 600 * 1024) {
          resolve(rawDataUrl);
          return;
        }

        // Calculate aspect-ratio preserved dimensions
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve(rawDataUrl);
          return;
        }

        // High quality bicubic smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Try modern WebP output first, then fallback to JPEG
        try {
          const webpData = canvas.toDataURL('image/webp', quality);
          if (webpData.startsWith('data:image/webp')) {
            resolve(webpData);
            return;
          }
        } catch (e) {
          // WebP not supported in current environment context
        }

        const jpegData = canvas.toDataURL('image/jpeg', quality);
        resolve(jpegData);
      };

      img.onerror = () => {
        // Fallback to raw data url if image construction fails
        resolve(rawDataUrl);
      };

      img.src = rawDataUrl;
    });
  } catch (err) {
    return readFileAsDataUrl(file);
  }
}

/**
 * Appends a cache-busting timestamp to external or relative image URLs to ensure immediate reflection
 * after an admin update, while preserving base64 Data URIs and blob URLs unchanged.
 */
export function getCacheBustedUrl(url?: string, timestamp?: number | string): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }
  const t = timestamp || Date.now();
  // If already contains t= param, replace it with fresh timestamp
  if (trimmed.includes('t=')) {
    return trimmed.replace(/([?&])t=[^&]*/, `$1t=${t}`);
  }
  const separator = trimmed.includes('?') ? '&' : '?';
  return `${trimmed}${separator}t=${t}`;
}
