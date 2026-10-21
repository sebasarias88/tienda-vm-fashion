import { NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { getAdminUser } from '@/lib/adminAuth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Data-cache tags used by the public catalog (see lib/site-config.ts, lib/catalog-data.ts). */
const CATALOG_TAGS = ['site-config', 'categorias', 'productos'] as const

/**
 * Called by the admin panel right after saving anything, so the public store
 * shows the change immediately instead of waiting for the 60s ISR window.
 * Admin-only. Pages regenerate lazily on their next visit.
 */
export async function POST(request: Request) {
  const origin = request.headers.get('origin')
  if (origin && new URL(origin).host !== new URL(request.url).host) {
    return NextResponse.json({ error: 'Origen no permitido' }, { status: 403 })
  }

  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  for (const tag of CATALOG_TAGS) revalidateTag(tag, { expire: 0 })
  revalidatePath('/', 'layout')

  return NextResponse.json({ revalidated: true })
}
