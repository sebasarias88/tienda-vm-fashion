'use client'

import Image from 'next/image'
import { useState } from 'react'
import { ImageIcon } from 'lucide-react'

type CatalogImageProps = {
  src: string | null | undefined
  alt: string
  /** Clases del contenedor (debe ser relative + tamaño). */
  className?: string
  /** Clases del Image (object-cover, etc.). */
  imageClassName?: string
  sizes: string
  /** Prioridad LCP (hero / primera card). */
  priority?: boolean
  /** Calidad 1–100. Default 75. */
  quality?: number
}

/**
 * Imagen de catálogo vía next/image (WebP/AVIF + resize en el edge).
 * Reduce Cached Egress de Storage al no servir el original en cards.
 */
export default function CatalogImage({
  src,
  alt,
  className = '',
  imageClassName = 'object-cover',
  sizes,
  priority = false,
  quality = 75,
}: CatalogImageProps) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return (
      <div
        className={`flex items-center justify-center bg-[var(--bg-surface)] ${className}`}
      >
        <ImageIcon size={28} className="text-[var(--text-faint)]" />
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        quality={quality}
        priority={priority}
        loading={priority ? 'eager' : 'lazy'}
        className={imageClassName}
        onError={() => setFailed(true)}
      />
    </div>
  )
}
