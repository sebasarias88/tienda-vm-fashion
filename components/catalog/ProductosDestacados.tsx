'use client'

import ProductosCarousel from '@/components/catalog/ProductosCarousel'
import { Producto } from '@/types'
import { catalogPath, type CatalogType } from '@/lib/catalog'

export default function ProductosDestacados({
  productos,
  catalogType = 'detal',
}: {
  productos: Producto[]
  catalogType?: CatalogType
}) {
  return (
    <ProductosCarousel
      productos={productos}
      catalogType={catalogType}
      eyebrow="Selección"
      title={
        <>
          Productos <span className="text-[var(--gold)]">destacados</span>
        </>
      }
      description="Piezas que enamoran: calidad, acabado y lo más pedido de la tienda"
      verMasHref={catalogPath(catalogType, '/productos')}
      verMasLabel="Ver catálogo"
    />
  )
}
