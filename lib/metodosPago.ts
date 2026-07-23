import { MetodoPagoConfig } from '@/types'

export function calcularCargoMetodoPago(
  subtotal: number,
  config: MetodoPagoConfig | null,
): {
  cargoAdicional: number
  porcentajeAplicado: number
  montoFijoAplicado: number
  descripcion: string | null
} {
  if (!config || (!config.porcentaje_adicional && !config.monto_adicional_fijo)) {
    return {
      cargoAdicional: 0,
      porcentajeAplicado: 0,
      montoFijoAplicado: 0,
      descripcion: null,
    }
  }

  const cargoPorcentaje =
    config.porcentaje_adicional > 0
      ? Math.round(subtotal * (config.porcentaje_adicional / 100))
      : 0

  const cargoFijo = config.monto_adicional_fijo || 0
  const cargoTotal = cargoPorcentaje + cargoFijo

  return {
    cargoAdicional: cargoTotal,
    porcentajeAplicado: config.porcentaje_adicional,
    montoFijoAplicado: cargoFijo,
    descripcion: config.descripcion_cliente,
  }
}

export function formatCargoLabel(config: MetodoPagoConfig): string {
  const partes: string[] = []
  if (config.porcentaje_adicional > 0) {
    partes.push(`+${config.porcentaje_adicional}%`)
  }
  if (config.monto_adicional_fijo > 0) {
    partes.push(`+$${config.monto_adicional_fijo.toLocaleString('es-CO')}`)
  }
  return partes.length > 0 ? partes.join(' ') : 'Sin cargo adicional'
}
