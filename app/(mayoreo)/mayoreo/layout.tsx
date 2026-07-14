import { createSupabaseServer } from '@/lib/supabase-server'
import Navbar from '@/components/catalog/Navbar'
import Footer from '@/components/catalog/Footer'
import PageTransition from '@/components/catalog/PageTransition'
import NavigationProgress from '@/components/catalog/NavigationProgress'
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

  const { data: categoriasRaw } = await supabase
    .from('categorias')
    .select('*, subcategorias:categorias!padre_id(*)')
    .is('padre_id', null)
    .eq('activa', true)
    .order('orden')
    .order('orden', { referencedTable: 'subcategorias' })

  const categorias = (categoriasRaw || []).map(raiz => ({
    ...raiz,
    subcategorias: [...(raiz.subcategorias || [])]
      .filter((s: { activa?: boolean }) => s.activa !== false)
      .sort((a: { orden: number }, b: { orden: number }) => a.orden - b.orden),
  }))

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <NavigationProgress />
      <div className="fixed left-0 right-0 top-0 z-40 flex h-9 items-center justify-center gap-1.5 bg-[#B8922A] text-[11px] font-light uppercase tracking-[2px] text-white">
        <span>Compra mínima</span>
        <span className="font-medium">{formatPrecio(MAYOREO_MIN_COMPRA)}</span>
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
    </div>
  )
}
