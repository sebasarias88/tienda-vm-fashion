/** Límite duro antes de optimizar (bytes). */
export const MAX_IMAGE_UPLOAD_BYTES = 5 * 1024 * 1024

/** Lado máximo del lado más largo tras redimensionar. */
export const MAX_IMAGE_EDGE_PX = 1600

/** Calidad WebP (0–1). */
export const WEBP_QUALITY = 0.82

/**
 * Comprime y redimensiona una imagen en el navegador (canvas → WebP).
 * Reduce drásticamente el peso en Storage / Cached Egress.
 */
export async function optimizeImageFile(
  file: File,
  options?: {
    maxBytes?: number
    maxEdge?: number
    quality?: number
  },
): Promise<File> {
  const maxBytes = options?.maxBytes ?? MAX_IMAGE_UPLOAD_BYTES
  const maxEdge = options?.maxEdge ?? MAX_IMAGE_EDGE_PX
  const quality = options?.quality ?? WEBP_QUALITY

  if (!file.type.startsWith('image/')) {
    throw new Error('El archivo no es una imagen')
  }

  if (file.size > maxBytes) {
    throw new Error(`La imagen supera ${Math.round(maxBytes / (1024 * 1024))}MB`)
  }

  // SVG / GIF animados: no pasar por canvas
  if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
    return file
  }

  const bitmap = await createImageBitmap(file)
  try {
    const { width, height } = bitmap
    const scale = Math.min(1, maxEdge / Math.max(width, height))
    const targetW = Math.max(1, Math.round(width * scale))
    const targetH = Math.max(1, Math.round(height * scale))

    const canvas = document.createElement('canvas')
    canvas.width = targetW
    canvas.height = targetH
    const ctx = canvas.getContext('2d')
    if (!ctx) return file

    ctx.drawImage(bitmap, 0, 0, targetW, targetH)

    const blob = await new Promise<Blob | null>(resolve => {
      canvas.toBlob(resolve, 'image/webp', quality)
    })

    if (!blob) return file

    // Si WebP no mejora, conservar original
    if (blob.size >= file.size && scale === 1) {
      return file
    }

    const base = file.name.replace(/\.[^.]+$/, '') || 'imagen'
    return new File([blob], `${base}.webp`, { type: 'image/webp' })
  } finally {
    bitmap.close()
  }
}
