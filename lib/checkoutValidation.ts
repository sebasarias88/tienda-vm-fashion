/** Validation for the checkout fields the store's e-invoicing system requires. */

/** Cédula or NIT: digits, optionally with dots, spaces or a dash (verification digit). */
export function documentoValido(value: string): boolean {
  const trimmed = value.trim()
  if (!/^[0-9.\-\s]+$/.test(trimmed)) return false
  const digits = trimmed.replace(/\D/g, '')
  return digits.length >= 5 && digits.length <= 15
}

export function correoValido(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim())
}
