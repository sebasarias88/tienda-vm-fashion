export type Categoria = {
  id: string
  nombre: string
  slug: string
  imagen_url: string | null
  orden: number
  activa: boolean
  padre_id: string | null
  subcategorias?: Categoria[]
  created_at: string
}

export type VariacionOpcion = {
  id: string
  tipo_id: string
  nombre: string
  valor_color: string | null
  disponible: boolean
  orden: number
}

export type VariacionTipo = {
  id: string
  producto_id: string
  nombre: string
  orden: number
  opciones?: VariacionOpcion[]
}

export type Producto = {
  id: string
  nombre: string
  slug: string
  descripcion: string | null
  precio: number
  precio_antes: number | null
  precio_mayoreo: number | null
  precio_antes_mayoreo: number | null
  disponible: boolean
  destacado: boolean
  categoria_id: string | null
  categoria?: Categoria
  imagenes: string[]
  sku: string | null
  orden: number
  created_at: string
  updated_at: string
}

export type Configuracion = {
  id: string
  clave: string
  valor: string
  descripcion: string | null
}

export type ItemCarrito = {
  producto: Producto
  cantidad: number
  /** tipo nombre → opción nombre */
  variacionesSeleccionadas?: Record<string, string>
  lineKey?: string
}

export type DatosCliente = {
  nombre: string
  celular: string
  direccion: string
  ciudad: string
  metodoPago: string
  notas: string
}
