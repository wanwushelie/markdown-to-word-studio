import sharp from 'sharp';
import fs from 'fs/promises';
import { ImageProcessingError } from '../core/errors.js';

export interface ImageMetadata {
  width: number;
  height: number;
  buffer: Buffer;
  extension: string;
}

export async function readImage(src: string): Promise<ImageMetadata> {
  try {
    let buffer: Buffer;

    if (src.startsWith('http://') || src.startsWith('https://')) {
      const response = await fetch(src);
      if (!response.ok) {
        throw new ImageProcessingError(`Failed to fetch image: ${response.statusText}`, src);
      }
      const arrayBuffer = await response.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    } else {
      buffer = await fs.readFile(src);
    }

    const metadata = await sharp(buffer).metadata();
    const width = metadata.width ?? 100;
    const height = metadata.height ?? 100;
    const extension = metadata.format ?? 'png';

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
