import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ProductoDetalle from '@/components/catalog/ProductoDetalle'
import ProductosRelacionados from '@/components/catalog/ProductosRelacionados'
import ProductPageSeo from '@/components/seo/ProductPageSeo'
import { buildProductMetadata } from '@/lib/seo'
import { getSiteConfig } from '@/lib/site-config'
import { getProductPageData } from '@/lib/productPageData'

/**
 * ISR: each product page is rendered on its first visit, then served from cache
 * and refreshed in the background at most once per minute.
 */
export const revalidate = 60

/** Build no pages ahead of time; render each slug on demand and cache it. */
export async function generateStaticParams() {
  return []
}

type PageProps = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const [config, data] = await Promise.all([getSiteConfig(), getProductPageData(slug, 'detal')])

  if (!data) {
    return { title: 'Producto no encontrado', robots: { index: false, follow: false } }
  }

  return buildProductMetadata(config, data.producto, 'detal')
}

export default async function ProductoPage({ params }: PageProps) {
  const { slug } = await params
  const [config, data] = await Promise.all([getSiteConfig(), getProductPageData(slug, 'detal')])

  if (!data) notFound()

  const { producto, relacionados, variaciones, secciones } = data

  return (
    <>
      <ProductPageSeo config={config} producto={producto} variaciones={variaciones} />
      <ProductoDetalle
        producto={producto}
        variaciones={variaciones}
        secciones={secciones}
      />
      {relacionados.length > 0 && (
        <ProductosRelacionados productos={relacionados} />
      )}
    </>
  )
}
