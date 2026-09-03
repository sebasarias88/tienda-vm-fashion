'use client'

import { useState } from 'react'
import { ImageIcon } from 'lucide-react'

type CatalogImageProps = {
  src: string | null | undefined
  alt: string
  /** Clases del contenedor (debe ser relative + tamaño). */
  className?: string
  /** Clases del Image (object-cover, etc.). */
  imageClassName?: string
  sizes?: string
  /** Prioridad LCP (hero / primera card). */
  priority?: boolean
  /** Calidad — ignorada (ya no se optimiza en el edge). */
  quality?: number
}

/**
 * Imagen de catálogo servida directamente desde Supabase Storage CDN.
 * Las imágenes ya están optimizadas (WebP ~200KB) al subirlas vía ImageUploader.
 */
export default function CatalogImage({
  src,
  alt,
  className = '',
  imageClassName = 'object-cover',
  priority = false,
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
      <img
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : undefined}
        className={`absolute inset-0 h-full w-full ${imageClassName}`}
        onError={() => setFailed(true)}
      />
    </div>
  )
}
