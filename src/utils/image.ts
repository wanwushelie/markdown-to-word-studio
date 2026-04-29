import { ImageProcessingError } from '../core/errors.js';

export interface ImageMetadata {
  width: number;
  height: number;
  buffer: Uint8Array;
  extension: string;
}

function isBrowserRuntime(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

function detectExtension(src: string, contentType?: string | null): string {
  const fromContentType = contentType?.split('/')[1]?.split(';')[0]?.toLowerCase();
  if (fromContentType) {
    return fromContentType === 'svg+xml' ? 'svg' : fromContentType;
  }
  const clean = src.split('?')[0].split('#')[0];
  const ext = clean.includes('.') ? clean.split('.').pop()?.toLowerCase() : undefined;
  if (ext && ['png', 'jpg', 'jpeg', 'gif', 'bmp'].includes(ext)) return ext;
  return 'png';
}

async function getBrowserImageSize(bytes: Uint8Array, extension: string): Promise<{ width: number; height: number }> {
  const arrayBuffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(arrayBuffer).set(bytes);
  const blob = new Blob([arrayBuffer], { type: `image/${extension === 'jpg' ? 'jpeg' : extension}` });
  const url = URL.createObjectURL(blob);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to decode image in browser'));
      img.src = url;
    });
    return {
      width: image.naturalWidth || 100,
      height: image.naturalHeight || 100,
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function getNodeImageSize(bytes: Uint8Array): Promise<{ width: number; height: number; extension: string }> {
  const sharpModule = await import('sharp');
  const sharp = sharpModule.default;
  const metadata = await sharp(bytes).metadata();
  return {
    width: metadata.width ?? 100,
    height: metadata.height ?? 100,
    extension: metadata.format ?? 'png',
  };
}

export async function readImage(src: string): Promise<ImageMetadata> {
  try {
    let buffer: Uint8Array;
    let extension = detectExtension(src);

    if (src.startsWith('http://') || src.startsWith('https://')) {
      const response = await fetch(src);
      if (!response.ok) {
        throw new ImageProcessingError(`Failed to fetch image: ${response.statusText}`, src);
      }
      const arrayBuffer = await response.arrayBuffer();
      buffer = new Uint8Array(arrayBuffer);
      extension = detectExtension(src, response.headers.get('content-type'));
    } else {
      if (isBrowserRuntime()) {
        throw new ImageProcessingError('Local image paths are not available in the browser. Use an uploaded or remote image.', src);
      }
      const fs = await import('node:fs/promises');
      buffer = await fs.readFile(src);
    }

    let width = 100;
    let height = 100;
    if (isBrowserRuntime()) {
      const size = await getBrowserImageSize(buffer, extension);
      width = size.width;
      height = size.height;
    } else {
      const size = await getNodeImageSize(buffer);
      width = size.width;
      height = size.height;
      extension = size.extension;
    }

    return {
      width,
      height,
      buffer,
      extension,
    };
  } catch (error) {
    if (error instanceof ImageProcessingError) throw error;
    throw new ImageProcessingError(`Failed to process image: ${(error as Error).message}`, src, error);
  }
}

export function calculateScaledDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidthPx: number
): { width: number; height: number } {
  if (originalWidth <= maxWidthPx) {
    return { width: originalWidth, height: originalHeight };
  }
  const ratio = maxWidthPx / originalWidth;
  return {
    width: Math.round(maxWidthPx),
    height: Math.round(originalHeight * ratio),
  };
}
