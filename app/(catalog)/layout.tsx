import { createSupabaseServer } from '@/lib/supabase-server'
import Navbar from '@/components/catalog/Navbar'
import Footer from '@/components/catalog/Footer'
import PageTransition from '@/components/catalog/PageTransition'
import JsonLd from '@/components/seo/JsonLd'
import { organizationJsonLd, websiteJsonLd } from '@/lib/seo'

export default async function CatalogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createSupabaseServer()

  const { data: configData } = await supabase
    .from('configuracion')
    .select('clave, valor')

  const config: Record<string, string> = {}
  configData?.forEach(row => { config[row.clave] = row.valor })

  const { data: categorias } = await supabase
    .from('categorias')
    .select('*')
    .eq('activa', true)
    .order('orden')

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <JsonLd data={[organizationJsonLd(config), websiteJsonLd(config)]} />
      <Navbar
        nombreNegocio={config['nombre_negocio'] || 'Tienda VM Fashion'}
        categorias={categorias || []}
      />
      <main>
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer
        nombreNegocio={config['nombre_negocio'] || 'Tienda VM Fashion'}
        whatsapp={config['whatsapp_numero'] || '573185867702'}
      />
    </div>
  )
}