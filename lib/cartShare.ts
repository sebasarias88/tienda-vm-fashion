import type { ItemCarrito } from '@/types'

/**
 * Compact, shareable cart link: /carrito?c=<base64url>
 * Only ids, quantities and selected options travel in the link — prices and
 * product data are always re-read from the database when the link is opened.
 */
type SharedEntry = [id: string, qty: number, options?: Record<string, string>]

const MAX_ITEMS = 50
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text)
  let binary = ''
  bytes.forEach(b => (binary += String.fromCharCode(b)))
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(value: string): string {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(base64 + '='.repeat((4 - (base64.length % 4)) % 4))
  return new TextDecoder().decode(Uint8Array.from(binary, c => c.charCodeAt(0)))
}

export function encodeCart(items: ItemCarrito[]): string {
  const entries: SharedEntry[] = items.slice(0, MAX_ITEMS).map(item => {
    const options = item.variacionesSeleccionadas
    return options && Object.keys(options).length
      ? [item.producto.id, item.cantidad, options]
      : [item.producto.id, item.cantidad]
  })
  return toBase64Url(JSON.stringify(entries))
}

export type DecodedCartEntry = { id: string; qty: number; options?: Record<string, string> }

/** Defensive decoding: anything malformed is ignored. */
export function decodeCart(value: string): DecodedCartEntry[] {
  try {
    const parsed: unknown = JSON.parse(fromBase64Url(value))
    if (!Array.isArray(parsed)) return []
    return parsed
      .slice(0, MAX_ITEMS)
      .flatMap(entry => {
        if (!Array.isArray(entry)) return []
        const [id, qty, options] = entry as unknown[]
        if (typeof id !== 'string' || !UUID.test(id)) return []
        const quantity = Math.min(99, Math.max(1, Math.floor(Number(qty) || 1)))
        const cleanOptions =
          options && typeof options === 'object' && !Array.isArray(options)
            ? Object.fromEntries(
                Object.entries(options as Record<string, unknown>)
                  .filter(([k, v]) => typeof v === 'string' && k.length <= 60 && v.length <= 60)
                  .slice(0, 10) as [string, string][],
              )
            : undefined
        return [{ id, qty: quantity, options: cleanOptions && Object.keys(cleanOptions).length ? cleanOptions : undefined }]
      })
  } catch {
    return []
  }
}

/** Instagram / Facebook / TikTok in-app browsers can lose site data when closed. */
export function isInAppBrowser(userAgent: string): boolean {
  return /Instagram|FBAN|FBAV|FB_IAB|FBIOS|TikTok|musical_ly|BytedanceWebview|Line\//i.test(userAgent)
}

export function inAppBrowserName(userAgent: string): string {
  if (/Instagram/i.test(userAgent)) return 'Instagram'
  if (/FBAN|FBAV|FB_IAB|FBIOS/i.test(userAgent)) return 'Facebook'
  if (/TikTok|musical_ly|Bytedance/i.test(userAgent)) return 'TikTok'
  return 'esta aplicación'
}
