import Navbar from '@/components/catalog/Navbar'
import Footer from '@/components/catalog/Footer'
import PageTransition from '@/components/catalog/PageTransition'
import NavigationProgress from '@/components/catalog/NavigationProgress'
import FloatingWhatsApp from '@/components/catalog/FloatingWhatsApp'
import { formatPrecio, MAYOREO_MIN_COMPRA, MAYOREO_RECOMPRA } from '@/lib/catalog'
import { getSiteConfig } from '@/lib/site-config'
import { getCategoriasActivas } from '@/lib/catalog-data'

export const revalidate = 60

export default async function MayoreoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [config, categorias] = await Promise.all([
    getSiteConfig(),
    getCategoriasActivas().catch(() => []),
  ])

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <NavigationProgress />
      <div className="fixed left-0 right-0 top-0 z-40 flex h-9 items-center justify-center gap-2 bg-[#B8922A] px-3 text-[11px] font-light uppercase tracking-[2px] text-white">
        <span>
          Compra mínima{' '}
          <span className="font-medium">{formatPrecio(MAYOREO_MIN_COMPRA)}</span>
        </span>
        <span className="opacity-70" aria-hidden>
          •
        </span>
        <span>
          Recompra{' '}
          <span className="font-medium">{formatPrecio(MAYOREO_RECOMPRA)}</span>
        </span>
      </div>
      <Navbar
        nombreNegocio={config['nombre_negocio'] || 'Tienda VM Fashion'}
        categorias={categorias}
        catalogType="mayoreo"
      />
      <main>
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer
        nombreNegocio={config['nombre_negocio'] || 'Tienda VM Fashion'}
        whatsapp={config['whatsapp_numero'] || '573185867702'}
        catalogType="mayoreo"
      />
      <FloatingWhatsApp
        whatsapp={config['whatsapp_numero'] || '573185867702'}
        catalogType="mayoreo"
      />
    </div>
  )
}
