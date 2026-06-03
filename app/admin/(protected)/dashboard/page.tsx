import Link from 'next/link'
import { createSupabaseServer } from '@/lib/supabase-server'
import {
  Package,
  Tag,
  TrendingUp,
  AlertCircle,
  Star,
  Plus,
  Settings,
  ExternalLink,
  ArrowRight,
  ImageIcon,
} from 'lucide-react'

function formatPrecio(precio: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(precio)
}

function formatFecha(iso: string) {
  return new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(iso))
}

export default async function DashboardPage() {
  const supabase = await createSupabaseServer()

  const [
    { count: totalProductos },
    { count: totalCategorias },
    { count: agotados },
    { count: destacados },
    { data: productosRecientes },
    { data: productosAgotados },
  ] = await Promise.all([
    supabase.from('productos').select('*', { count: 'exact', head: true }),
    supabase.from('categorias').select('*', { count: 'exact', head: true }).eq('activa', true),
    supabase.from('productos').select('*', { count: 'exact', head: true }).eq('disponible', false),
    supabase.from('productos').select('*', { count: 'exact', head: true }).eq('destacado', true),
    supabase
      .from('productos')
      .select('id, nombre, slug, precio, disponible, imagenes, created_at, categoria:categorias(nombre)')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('productos')
      .select('id, nombre, slug, imagenes')
      .eq('disponible', false)
      .order('updated_at', { ascending: false })
      .limit(4),
  ])

  const disponibles = (totalProductos ?? 0) - (agotados ?? 0)
  const hoy = formatFecha(new Date().toISOString())

  const stats = [
    {
      label: 'Total productos',
      value: totalProductos ?? 0,
      hint: 'En catálogo',
      icon: Package,
      accent: '#B8922A',
      bg: 'rgba(184,146,42,0.18)',
    },
    {
      label: 'Categorías activas',
      value: totalCategorias ?? 0,
      hint: 'Visibles en tienda',
      icon: Tag,
      accent: '#9A7820',
      bg: 'rgba(212,175,55,0.08)',
    },
    {
      label: 'Disponibles',
      value: disponibles,
      hint: 'Listos para vender',
      icon: TrendingUp,
      accent: '#4ade80',
      bg: 'rgba(74,222,128,0.08)',
    },
    {
      label: 'Agotados',
      value: agotados ?? 0,
      hint: 'Requieren atención',
      icon: AlertCircle,
      accent: '#f87171',
      bg: 'rgba(248,113,113,0.08)',
    },
  ]

  const acciones = [
    {
      href: '/admin/productos',
      label: 'Nuevo producto',
      desc: 'Agregar al catálogo',
      icon: Plus,
    },
    {
      href: '/admin/categorias',
      label: 'Nueva categoría',
      desc: 'Organizar la tienda',
      icon: Tag,
    },
    {
      href: '/admin/configuracion',
      label: 'Configuración',
      desc: 'Textos y ajustes',
      icon: Settings,
    },
  ]

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="mb-2 text-[10px] font-light uppercase tracking-[3px] text-[rgba(184,146,42,0.82)]">
            Panel
          </p>
          <h1 className="text-3xl font-thin uppercase tracking-[2px] text-[#1A1A1A]">
            Dashboard
          </h1>
          <p className="mt-2 text-[12px] font-light text-[rgba(240,235,228,0.65)]">{hoy}</p>
        </div>
        <Link
          href="/"
          target="_blank"
          className="inline-flex shrink-0 items-center gap-2 rounded-[2px] border border-[rgba(184,146,42,0.52)] px-4 py-2 text-[11px] font-light uppercase tracking-[1.5px] text-[#B8922A] transition-colors hover:bg-[rgba(184,146,42,0.18)]"
        >
          <ExternalLink size={13} />
          Ver tienda
        </Link>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map(({ label, value, hint, icon: Icon, accent, bg }) => (
            <div
              key={label}
              className="rounded-[2px] border border-[rgba(184,146,42,0.26)] bg-[#111111] p-5 transition-colors hover:border-[rgba(184,146,42,0.38)]"
            >
              <div className="mb-4 flex items-start justify-between">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-[2px]"
                  style={{ backgroundColor: bg }}
                >
                  <Icon size={18} style={{ color: accent }} />
                </div>
                {label === 'Agotados' && value > 0 && (
                  <span className="rounded-[2px] bg-[rgba(248,113,113,0.12)] px-2 py-0.5 text-[9px] font-light uppercase tracking-[1px] text-red-400">
                    Alerta
                  </span>
                )}
              </div>
              <p className="mb-1 text-3xl font-light leading-none" style={{ color: accent }}>
                {value}
              </p>
              <p className="text-[12px] font-light uppercase tracking-[1px] text-[rgba(240,235,228,0.92)]">
                {label}
              </p>
              <p className="mt-1 text-[11px] font-light text-[rgba(240,235,228,0.6)]">{hint}</p>
            </div>
          ))}
        </div>

        {/* Destacados pill */}
        {(destacados ?? 0) > 0 && (
          <div className="mb-8 flex items-center gap-3 rounded-[2px] border border-[rgba(184,146,42,0.3)] bg-[rgba(184,146,42,0.26)] px-4 py-3">
            <Star size={15} className="shrink-0 text-[#B8922A]" />
            <p className="text-[13px] font-light text-[rgba(240,235,228,0.9)]">
              <span className="text-[#B8922A]">{destacados}</span>{' '}
              producto{destacados !== 1 ? 's' : ''} destacado{destacados !== 1 ? 's' : ''} en la página de inicio
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5 lg:items-stretch lg:gap-8">

          {/* Accesos rápidos */}
          <div className="flex flex-1 flex-col lg:col-span-2">
            <h2 className="mb-4 shrink-0 text-[11px] font-light uppercase tracking-[2.5px] text-[rgba(184,146,42,0.92)]">
              Accesos rápidos
            </h2>
            <div className="flex flex-1 flex-col gap-3">
              {acciones.map(({ href, label, desc, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="group flex flex-1 items-center gap-4 rounded-[2px] border border-[rgba(184,146,42,0.26)] bg-[#111111] p-4 transition-all hover:border-[rgba(184,146,42,0.52)] hover:bg-[rgba(184,146,42,0.26)]"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[2px] bg-[rgba(184,146,42,0.18)] transition-colors group-hover:bg-[rgba(184,146,42,0.28)]">
                    <Icon size={18} className="text-[#B8922A]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-light uppercase tracking-[1px] text-[#1A1A1A] group-hover:text-[#B8922A] transition-colors">
                      {label}
                    </p>
                    <p className="mt-0.5 text-[12px] font-light text-[rgba(240,235,228,0.65)]">{desc}</p>
                  </div>
                  <ArrowRight
                    size={16}
                    className="shrink-0 text-[rgba(184,146,42,0.5)] transition-all group-hover:translate-x-0.5 group-hover:text-[#B8922A]"
                  />
                </Link>
              ))}
            </div>
          </div>

          {/* Agotados / estado */}
          <div className="flex flex-1 flex-col lg:col-span-3">
            <div className="mb-4 flex min-h-[20px] shrink-0 items-center justify-between">
              <h2 className="text-[11px] font-light uppercase tracking-[2.5px] text-[rgba(184,146,42,0.92)]">
                {(agotados ?? 0) > 0 ? 'Productos agotados' : 'Estado del inventario'}
              </h2>
              {(agotados ?? 0) > 0 ? (
                <Link
                  href="/admin/productos"
                  className="text-[11px] font-light uppercase tracking-[1px] text-[#B8922A] hover:text-[#9A7820] transition-colors"
                >
                  Ver todos
                </Link>
              ) : (
                <span className="w-0" aria-hidden />
              )}
            </div>

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[2px] border border-[rgba(184,146,42,0.26)] bg-[#111111]">
              {(productosAgotados?.length ?? 0) > 0 ? (
                <ul className="flex flex-1 flex-col divide-y divide-[rgba(184,146,42,0.18)]">
                  {productosAgotados!.map(p => (
                    <li key={p.id}>
                      <Link
                        href="/admin/productos"
                        className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-[rgba(184,146,42,0.26)]"
                      >
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-[2px] bg-[#141414]">
                          {p.imagenes?.[0] ? (
                            <img src={p.imagenes[0]} alt="" className="h-full w-full object-cover opacity-70" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <ImageIcon size={14} className="text-[rgba(184,146,42,0.36)]" />
                            </div>
                          )}
                        </div>
                        <span className="min-w-0 flex-1 truncate text-[13px] font-light text-[rgba(240,235,228,0.92)]">
                          {p.nombre}
                        </span>
                        <span className="shrink-0 rounded-[2px] bg-[rgba(248,113,113,0.1)] px-2 py-1 text-[9px] font-light uppercase tracking-[1px] text-red-400">
                          Agotado
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center px-6 py-8 text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-[2px] bg-[rgba(74,222,128,0.08)]">
                    <TrendingUp size={20} className="text-[#4ade80]" />
                  </div>
                  <p className="text-[14px] font-light text-[rgba(240,235,228,0.9)]">
                    Todo el inventario está disponible
                  </p>
                  <p className="mt-1 text-[12px] font-light text-[rgba(240,235,228,0.6)]">
                    No hay productos agotados en este momento
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Productos recientes */}
        {(productosRecientes?.length ?? 0) > 0 && (
          <div className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[11px] font-light uppercase tracking-[2.5px] text-[rgba(184,146,42,0.92)]">
                Agregados recientemente
              </h2>
              <Link
                href="/admin/productos"
                className="text-[11px] font-light uppercase tracking-[1px] text-[#B8922A] hover:text-[#9A7820] transition-colors"
              >
                Gestionar productos
              </Link>
            </div>

            <div className="overflow-hidden rounded-[2px] border border-[rgba(184,146,42,0.26)] bg-[#111111]">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[540px]">
                  <thead>
                    <tr className="border-b border-[rgba(184,146,42,0.22)] bg-[rgba(184,146,42,0.25)]">
                      <th className="px-4 py-3 text-left text-[10px] font-light uppercase tracking-[1.5px] text-[rgba(240,235,228,0.72)]">
                        Producto
                      </th>
                      <th className="px-4 py-3 text-left text-[10px] font-light uppercase tracking-[1.5px] text-[rgba(240,235,228,0.72)]">
                        Categoría
                      </th>
                      <th className="px-4 py-3 text-left text-[10px] font-light uppercase tracking-[1.5px] text-[rgba(240,235,228,0.72)]">
                        Precio
                      </th>
                      <th className="px-4 py-3 text-left text-[10px] font-light uppercase tracking-[1.5px] text-[rgba(240,235,228,0.72)]">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgba(184,146,42,0.14)]">
                    {productosRecientes!.map(p => {
                      const rawCat = p.categoria as { nombre: string } | { nombre: string }[] | null
                      const cat = Array.isArray(rawCat) ? rawCat[0] : rawCat
                      return (
                        <tr key={p.id} className="transition-colors hover:bg-[rgba(184,146,42,0.25)]">
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 shrink-0 overflow-hidden rounded-[2px] bg-[#141414]">
                                {p.imagenes?.[0] ? (
                                  <img src={p.imagenes[0]} alt="" className="h-full w-full object-cover" />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center">
                                    <ImageIcon size={12} className="text-[rgba(184,146,42,0.36)]" />
                                  </div>
                                )}
                              </div>
                              <span className="max-w-[200px] truncate text-[13px] font-light text-[rgba(240,235,228,0.92)]">
                                {p.nombre}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-[12px] font-light text-[rgba(240,235,228,0.78)]">
                            {cat?.nombre ?? '—'}
                          </td>
                          <td className="px-4 py-3.5 text-[13px] font-light text-[#B8922A]">
                            {formatPrecio(p.precio)}
                          </td>
                          <td className="px-4 py-3.5">
                            <span
                              className={`inline-block rounded-[2px] px-2 py-1 text-[9px] font-light uppercase tracking-[1px] ${
                                p.disponible
                                  ? 'bg-[rgba(74,222,128,0.1)] text-[#4ade80]'
                                  : 'bg-[rgba(248,113,113,0.1)] text-red-400'
                              }`}
                            >
                              {p.disponible ? 'Disponible' : 'Agotado'}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
    </div>
  )
}
