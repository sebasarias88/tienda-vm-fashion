/**
 * Finds files in R2 that NO product, category, banner or promotion uses anymore
 * (test uploads, images removed from a form without saving, etc.).
 *
 * SAFE BY DEFAULT: without --delete it only prints a report.
 * Never touches: files referenced in the database (and their thumbnails),
 * or anything uploaded in the last 72 hours (forms that may still be open).
 *
 * Usage:
 *   npx tsx --env-file=.env scripts/cleanup-r2-orphans.ts            # report only
 *   npx tsx --env-file=.env scripts/cleanup-r2-orphans.ts --delete   # delete the orphans listed
 */
import { DeleteObjectsCommand, ListObjectsV2Command, type _Object } from '@aws-sdk/client-s3'
import { createClient } from '@supabase/supabase-js'
import { getSupabaseUrl } from '../lib/env'
import { thumbKeyFor } from '../lib/imageVariants'
import { getR2Bucket, getR2Client, getR2PublicBaseUrl } from '../lib/r2'

const DELETE = process.argv.includes('--delete')
const GRACE_HOURS = 72

async function referencedKeys(): Promise<Set<string>> {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY')
  const supabase = createClient(getSupabaseUrl(), serviceKey, { auth: { persistSession: false } })
  const base = `${getR2PublicBaseUrl()}/`
  const keys = new Set<string>()
  const add = (url: unknown) => {
    if (typeof url !== 'string' || !url.startsWith(base)) return
    const key = decodeURIComponent(url.slice(base.length))
    keys.add(key)
    keys.add(thumbKeyFor(key))
  }

  const { data: productos, error } = await supabase
    .from('productos')
    .select('imagenes, video_url, videos')
  if (error) throw error
  for (const p of productos ?? []) {
    ;(p.imagenes as string[] | null)?.forEach(add)
    add(p.video_url)
    ;((p.videos as { url?: string }[] | null) ?? []).forEach(v => add(v?.url))
  }
  for (const table of ['categorias', 'banners', 'promociones'] as const) {
    const { data, error: tableError } = await supabase.from(table).select('imagen_url')
    if (tableError) throw tableError
    data?.forEach(row => add(row.imagen_url))
  }
  // Store config values may contain image URLs too (logos, etc.)
  const { data: config, error: configError } = await supabase.from('configuracion').select('valor')
  if (configError) throw configError
  config?.forEach(row => add(row.valor))
  return keys
}

async function listAll(): Promise<_Object[]> {
  const objects: _Object[] = []
  let token: string | undefined
  do {
    const page = await getR2Client().send(
      new ListObjectsV2Command({ Bucket: getR2Bucket(), ContinuationToken: token }),
    )
    objects.push(...(page.Contents ?? []))
    token = page.IsTruncated ? page.NextContinuationToken : undefined
  } while (token)
  return objects
}

async function main() {
  const [used, objects] = await Promise.all([referencedKeys(), listAll()])
  const cutoff = Date.now() - GRACE_HOURS * 3600 * 1000

  const orphans = objects.filter(
    o => o.Key && !used.has(o.Key) && (o.LastModified?.getTime() ?? Date.now()) < cutoff,
  )
  const recent = objects.filter(
    o => o.Key && !used.has(o.Key) && (o.LastModified?.getTime() ?? Date.now()) >= cutoff,
  )
  const mb = (bytes: number) => (bytes / 1048576).toFixed(1)
  const totalBytes = objects.reduce((s, o) => s + (o.Size ?? 0), 0)
  const orphanBytes = orphans.reduce((s, o) => s + (o.Size ?? 0), 0)

  console.log(`Files in R2: ${objects.length} (${mb(totalBytes)} MB)`)
  console.log(`In use (incl. thumbnails): ${objects.length - orphans.length - recent.length}`)
  console.log(`Unused but recent (<${GRACE_HOURS}h, kept for safety): ${recent.length}`)
  console.log(`Orphans: ${orphans.length} (${mb(orphanBytes)} MB)`)
  orphans.slice(0, 50).forEach(o => console.log(`  - ${o.Key} (${Math.round((o.Size ?? 0) / 1024)} KB)`))
  if (orphans.length > 50) console.log(`  … and ${orphans.length - 50} more`)

  if (!DELETE) {
    console.log('\nReport only. Run again with --delete to remove the orphans listed above.')
    return
  }
  for (let i = 0; i < orphans.length; i += 1000) {
    const batch = orphans.slice(i, i + 1000)
    await getR2Client().send(
      new DeleteObjectsCommand({
        Bucket: getR2Bucket(),
        Delete: { Objects: batch.map(o => ({ Key: o.Key! })), Quiet: true },
      }),
    )
  }
  console.log(`\nDeleted ${orphans.length} orphan files (${mb(orphanBytes)} MB).`)
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
