/**
 * Creates the lightweight thumbnail (max 640px WebP) for every catalog image already in R2:
 *   <base>/<key>  →  <base>/thumbs/<key without extension>.webp
 * Never deletes or modifies originals, never touches the database. Safe to re-run
 * (existing thumbnails are skipped).
 *
 * Usage:
 *   npx tsx --env-file=.env scripts/generate-thumbnails.ts --dry-run
 *   npx tsx --env-file=.env scripts/generate-thumbnails.ts
 */
import { HeadObjectCommand } from '@aws-sdk/client-s3'
import { createClient } from '@supabase/supabase-js'
import sharp from 'sharp'
import { getSupabaseUrl } from '../lib/env'
import { THUMB_MAX_EDGE_PX, THUMB_WEBP_QUALITY, thumbKeyFor } from '../lib/imageVariants'
import { getR2Bucket, getR2Client, getR2PublicBaseUrl, putImageObject } from '../lib/r2'

const DRY_RUN = process.argv.includes('--dry-run')
const CONCURRENCY = 4
const MAX_ATTEMPTS = 4
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

async function download(url: string): Promise<Buffer> {
  for (let attempt = 1; ; attempt++) {
    const response = await fetch(url)
    if (response.ok) return Buffer.from(await response.arrayBuffer())
    const retryable = response.status === 429 || response.status >= 500
    if (!retryable || attempt >= MAX_ATTEMPTS) throw new Error(`HTTP ${response.status}`)
    await sleep(2000 * 2 ** (attempt - 1))
  }
}

async function exists(key: string): Promise<boolean> {
  try {
    await getR2Client().send(new HeadObjectCommand({ Bucket: getR2Bucket(), Key: key }))
    return true
  } catch {
    return false
  }
}

async function collectKeys(): Promise<string[]> {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY')
  const supabase = createClient(getSupabaseUrl(), serviceKey, { auth: { persistSession: false } })
  const base = `${getR2PublicBaseUrl()}/`
  const keys = new Set<string>()
  const add = (url: string | null | undefined) => {
    if (url?.startsWith(base)) keys.add(decodeURIComponent(url.slice(base.length)))
  }

  const { data: productos, error } = await supabase.from('productos').select('imagenes')
  if (error) throw error
  productos?.forEach(p => (p.imagenes as string[] | null)?.forEach(add))
  for (const table of ['categorias', 'banners', 'promociones'] as const) {
    const { data, error: tableError } = await supabase.from(table).select('imagen_url')
    if (tableError) throw tableError
    data?.forEach(row => add(row.imagen_url as string | null))
  }
  return [...keys].filter(key => !key.startsWith('thumbs/'))
}

async function main() {
  const keys = await collectKeys()
  console.log(`${DRY_RUN ? '[DRY RUN] ' : ''}Images in DB served from R2: ${keys.length}`)

  let created = 0
  let skipped = 0
  let originalBytes = 0
  let thumbBytes = 0
  const failures: string[] = []
  let cursor = 0

  async function worker() {
    while (cursor < keys.length) {
      const key = keys[cursor++]
      const thumbKey = thumbKeyFor(key)
      try {
        if (await exists(thumbKey)) {
          skipped++
        } else {
          const original = await download(`${getR2PublicBaseUrl()}/${key}`)
          const thumb = await sharp(original)
            .rotate()
            .resize({ width: THUMB_MAX_EDGE_PX, height: THUMB_MAX_EDGE_PX, fit: 'inside', withoutEnlargement: true })
            .webp({ quality: Math.round(THUMB_WEBP_QUALITY * 100) })
            .toBuffer()
          originalBytes += original.length
          thumbBytes += thumb.length
          if (!DRY_RUN) await putImageObject({ key: thumbKey, body: thumb, contentType: 'image/webp' })
          created++
        }
      } catch (error) {
        failures.push(`${key} → ${error instanceof Error ? error.message : String(error)}`)
      }
      const done = created + skipped + failures.length
      if (done % 100 === 0 || done === keys.length) console.log(`  ${done}/${keys.length}`)
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker))

  const mb = (b: number) => (b / 1048576).toFixed(1)
  console.log(`\nThumbnails ${DRY_RUN ? 'to create' : 'created'}: ${created} | already existed: ${skipped} | failed: ${failures.length}`)
  if (created) console.log(`Weight of those images: ${mb(originalBytes)} MB originals → ${mb(thumbBytes)} MB thumbnails`)
  failures.forEach(f => console.log(`  FAIL ${f}`))
  if (failures.length) process.exitCode = 1
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
