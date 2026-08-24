import type { Producto, VariacionTipo } from '@/types'
import type { CatalogType } from '@/lib/catalog'
import { catalogPath } from '@/lib/catalog'
import {
  breadcrumbJsonLd,
  productJsonLd,
} from '@/lib/seo'
import { getSiteName, type SiteConfigMap } from '@/lib/site-config'
import JsonLd from '@/components/seo/JsonLd'

type ProductPageSeoProps = {
  config: SiteConfigMap
  producto: Producto
  catalogType?: CatalogType
  variaciones?: VariacionTipo[]
}

export default function ProductPageSeo({
  config,
  producto,
  catalogType = 'detal',
  variaciones,
}: ProductPageSeoProps) {
  const siteName = getSiteName(config)
  const productosPath = catalogPath(catalogType, '/productos')
  const productPath = catalogPath(catalogType, `/productos/${producto.slug}`)

  return (
    <JsonLd
      data={[
        productJsonLd(config, producto, catalogType, variaciones),
        breadcrumbJsonLd([
          { name: 'Inicio', path: catalogPath(catalogType, '/') },
          { name: 'Productos', path: productosPath },
          ...(producto.categoria
            ? [{ name: producto.categoria.nombre, path: `${productosPath}?categoria=${producto.categoria.slug}` }]
            : []),
          { name: producto.nombre, path: productPath },
        ]),
        {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: producto.nombre,
          description: producto.descripcion || producto.nombre,
          url: productPath,
          isPartOf: { '@type': 'WebSite', name: siteName },
        },
      ]}
    />
  )
}
