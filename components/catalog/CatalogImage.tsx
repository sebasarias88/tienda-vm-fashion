'use client'

import { useEffect, useRef, useState } from 'react'
import { ImageIcon } from 'lucide-react'
import { thumbUrl } from '@/lib/imageVariants'

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
  /**
   * 'thumb' loads the lightweight thumbnail (cards, lists, cart). If the thumbnail
   * doesn't exist it falls back to the full image automatically.
   */
  variant?: 'full' | 'thumb'
}

/**
 * Catalog image served directly from the R2 CDN (img.tiendavmfashion.com).
 * Images are optimized to WebP on upload; `variant="thumb"` uses the 640px thumbnail.
 */
export default function CatalogImage({
  src,
  alt,
  className = '',
  imageClassName = 'object-cover',
  priority = false,
  variant = 'full',
}: CatalogImageProps) {
  const preferred = variant === 'thumb' ? thumbUrl(src) : src
  // 0 = preferred (thumb or full), 1 = full image fallback, 2 = placeholder
  const [attempt, setAttempt] = useState(0)
  // Reset the fallback chain when the image changes (e.g. gallery or cart updates).
  const [lastSrc, setLastSrc] = useState(src)
  if (src !== lastSrc) {
    setLastSrc(src)
    setAttempt(0)
  }
  const currentSrc = attempt === 0 ? preferred : attempt === 1 ? src : null

  const handleError = () => {
    setAttempt(prev => (prev === 0 && preferred !== src ? 1 : 2))
  }

  // An image that fails before React hydrates never fires onError: detect it on mount.
  const imgRef = useRef<HTMLImageElement>(null)
  useEffect(() => {
    const img = imgRef.current
    if (img && img.complete && img.naturalWidth === 0 && img.currentSrc) handleError()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only on mount / when the source changes
  }, [currentSrc])

  if (!currentSrc) {
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
        ref={imgRef}
        src={currentSrc}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : undefined}
        className={`absolute inset-0 h-full w-full ${imageClassName}`}
        onError={handleError}
      />
    </div>
  )
}
