import { VariacionTipo } from '@/types'

/** Solo tipos con al menos una opción disponible, ordenados. */
export function normalizarVariacionesProducto(
  tipos: VariacionTipo[] | null | undefined,
): VariacionTipo[] {
  if (!tipos?.length) return []

  return tipos
    .map(tipo => ({
      ...tipo,
      opciones: [...(tipo.opciones || [])]
        .filter(o => o.disponible)
        .sort((a, b) => a.orden - b.orden),
    }))
    .filter(tipo => (tipo.opciones?.length ?? 0) > 0)
    .sort((a, b) => a.orden - b.orden)
}

export function buildVariacionesSeleccionadas(
  variaciones: VariacionTipo[],
  selectedByTipoId: Record<string, string>,
): Record<string, string> | undefined {
  const result: Record<string, string> = {}

  for (const tipo of variaciones) {
    const opcionId = selectedByTipoId[tipo.id]
    const opcion = tipo.opciones?.find(o => o.id === opcionId)
    if (opcion) result[tipo.nombre] = opcion.nombre
  }

  return Object.keys(result).length > 0 ? result : undefined
}

export function resumenVariacionesTexto(
  variaciones: VariacionTipo[],
  selectedByTipoId: Record<string, string>,
): string {
  const parts = variaciones
    .map(tipo => {
      const opcionId = selectedByTipoId[tipo.id]
      const opcion = tipo.opciones?.find(o => o.id === opcionId)
      if (!opcion) return null
      return `${tipo.nombre} — ${opcion.nombre}`
    })
    .filter(Boolean)

  return parts.join(', ')
}
