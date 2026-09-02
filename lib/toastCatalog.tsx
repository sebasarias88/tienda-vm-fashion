import toast from 'react-hot-toast'

function truncarNombreProducto(nombre: string, max = 40): string {
  const limpio = nombre.trim()
  if (limpio.length <= max) return limpio
  return `${limpio.slice(0, max - 1).trimEnd()}…`
}

export function toastProductoAgregado(nombre: string) {
  const corto = truncarNombreProducto(nombre)

  toast.success(
    <span className="app-toast-producto">
      <span className="app-toast-producto__nombre" title={nombre.trim()}>
        {corto}
      </span>
      <span className="app-toast-producto__accion">Agregado al carrito</span>
    </span>,
  )
}
