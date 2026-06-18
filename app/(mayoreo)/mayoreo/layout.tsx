import { createSupabaseServer } from '@/lib/supabase-server'
import Navbar from '@/components/catalog/Navbar'
import Footer from '@/components/catalog/Footer'
import PageTransition from '@/components/catalog/PageTransition'
import { formatPrecio, MAYOREO_MIN_COMPRA } from '@/lib/catalog'

export default async function MayoreoLayout({
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
      <div className="fixed left-0 right-0 top-0 z-40 flex h-9 items-center justify-center gap-2 bg-[#B8922A] text-[11px] font-light uppercase tracking-[2px] text-white">
        <span>Catálogo al por mayor</span>
        <span aria-hidden className="opacity-50">·</span>
        <span className="font-medium">
          Compra mínima {formatPrecio(MAYOREO_MIN_COMPRA)}
        </span>
      </div>
      <Navbar
        nombreNegocio={config['nombre_negocio'] || 'Tienda VM Fashion'}
        categorias={categorias || []}
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
    </div>
  )
}
