import Link from 'next/link'

export default function ProductoNotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-6">
      <p className="text-[10px] tracking-[4px] uppercase text-[rgba(184,146,42,0.72)] font-light">
        404
      </p>
      <h1 className="text-3xl font-thin tracking-[2px] uppercase text-[#1A1A1A]">
        Producto no encontrado
      </h1>
      <p className="text-[13px] font-light text-[rgba(240,235,228,0.58)]">
        El producto que buscas no existe o fue eliminado.
      </p>
      <Link
        href="/productos"
        className="text-[10px] tracking-[2.5px] uppercase font-light text-[#B8922A] border border-[rgba(184,146,42,0.52)] px-6 py-3 rounded-[2px] hover:bg-[rgba(184,146,42,0.14)] transition-all"
      >
        Ver catálogo
      </Link>
    </div>
  )
}