import sharp from 'sharp'
import {
  MAX_IMAGE_EDGE_PX,
  WEBP_QUALITY,
} from '@/lib/optimizeImage'

export const BACKFILL_MIN_BYTES = 500 * 1024

export function isAlreadyOptimized(sizeBytes: number, path: string): boolean {
  const lower = path.toLowerCase()
  return lower.endsWith('.webp') && sizeBytes < BACKFILL_MIN_BYTES
}

/**
 * Comprime y redimensiona un buffer de imagen (Node/sharp).
 * Misma lógica que optimizeImageFile en el navegador.
 */
export async function optimizeImageBuffer(
  input: Buffer,
  options?: { maxEdge?: number; quality?: number },
): Promise<Buffer> {
  const maxEdge = options?.maxEdge ?? MAX_IMAGE_EDGE_PX
  const quality = options?.quality ?? WEBP_QUALITY

  return sharp(input)
    .rotate()
    .resize({
      width: maxEdge,
      height: maxEdge,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: Math.round(quality * 100) })
    .toBuffer()
}
