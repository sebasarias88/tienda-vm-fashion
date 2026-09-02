'use client'

import CatalogImage from '@/components/catalog/CatalogImage'

type CatalogDetailImageProps = {
  src: string
  alt: string
  className?: string
  imageClassName?: string
  sizes: string
  priority?: boolean
  quality?: number
}

/** Imagen principal de PDP — wrapper sobre CatalogImage con defaults de detalle. */
export default function CatalogDetailImage({
  src,
  alt,
  className = 'h-full w-full',
  imageClassName = 'object-cover',
  sizes,
  priority = true,
  quality = 80,
}: CatalogDetailImageProps) {
  return (
    <CatalogImage
      src={src}
      alt={alt}
      className={className}
      imageClassName={imageClassName}
      sizes={sizes}
      priority={priority}
      quality={quality}
    />
  )
}
