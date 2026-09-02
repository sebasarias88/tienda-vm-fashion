import AnnouncementBar from '@/components/catalog/AnnouncementBar'
import Navbar from '@/components/catalog/Navbar'
import Footer from '@/components/catalog/Footer'
import PageTransition from '@/components/catalog/PageTransition'
import NavigationProgress from '@/components/catalog/NavigationProgress'
import FloatingWhatsApp from '@/components/catalog/FloatingWhatsApp'
import JsonLd from '@/components/seo/JsonLd'
import { organizationJsonLd, websiteJsonLd } from '@/lib/seo'
import { getSiteConfig } from '@/lib/site-config'
import { getCategoriasActivas } from '@/lib/catalog-data'

export const revalidate = 60

export default async function CatalogLayout({
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
      <JsonLd data={[organizationJsonLd(config), websiteJsonLd(config)]} />
      <NavigationProgress />
      <AnnouncementBar />
      <Navbar
        nombreNegocio={config['nombre_negocio'] || 'Tienda VM Fashion'}
        categorias={categorias}
        hasAnnouncement
      />
      <main>
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer
        nombreNegocio={config['nombre_negocio'] || 'Tienda VM Fashion'}
        whatsapp={config['whatsapp_numero'] || '573185867702'}
      />
      <FloatingWhatsApp
        whatsapp={config['whatsapp_numero'] || '573185867702'}
      />
    </div>
  )
}
