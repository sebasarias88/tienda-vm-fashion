/**
 * Copies every image referenced in the database from Supabase Storage to Cloudflare R2.
 * It NEVER deletes anything from Supabase and NEVER updates the database.
 *
 * Output (gitignored): scripts/output/
 *   - r2-url-map.json   old URL → new URL
 *   - r2-url-map.sql    INSERTs for private.image_url_map (run in SQL Editor, then the switch SQL)
 *
 * Heavy images (PNG/JPEG over 300KB, or anything over 600KB) are re-encoded to WebP (max 1600px).
 * Re-running is safe: objects already in R2 are skipped.
 *
 * Usage:
 *   npx tsx --env-file=.env scripts/migrate-images-to-r2.ts --dry-run
 *   npx tsx --env-file=.env scripts/migrate-images-to-r2.ts
 *
 * Required env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
 *   R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_PUBLIC_BASE_URL
 */
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { HeadObjectCommand } from '@aws-sdk/client-s3'
import { createClient } from '@supabase/supabase-js'
import { getSupabaseUrl } from '../lib/env'
import { optimizeImageBuffer } from '../lib/optimizeImageServer'
import { getR2Bucket, getR2Client, publicUrlForKey, putImageObject } from '../lib/r2'

const DRY_RUN = process.argv.includes('--dry-run')
const CONCURRENCY = 4
const OPTIMIZE_PNG_JPEG_OVER = 300 * 1024
const OPTIMIZE_ANY_OVER = 600 * 1024
const STORAGE_MARKER = '/storage/v1/object/public/'
const OUTPUT_DIR = path.join(process.cwd(), 'scripts', 'output')

type Job = { oldUrl: string; storagePath: string }
type Result = {
  oldUrl: string
  newUrl: string
  originalBytes: number
  finalBytes: number
  converted: boolean
  skipped: boolean
}

const CONTENT_TYPE_BY_EXT: Record<string, string> = {
  webp: 'image/webp',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
}

function storagePathFromUrl(url: string): string | null {
  const idx = url.indexOf(STORAGE_MARKER)
  if (idx === -1) return null
  return decodeURIComponent(url.slice(idx + STORAGE_MARKER.length).split('?')[0])
}

function extensionOf(p: string): string {
  return p.split('.').pop()?.toLowerCase() ?? ''
}

async function existsInR2(key: string): Promise<boolean> {
  try {
    await getR2Client().send(new HeadObjectCommand({ Bucket: getR2Bucket(), Key: key }))
    return true
  } catch {
    return false
  }
}

async function collectJobs(): Promise<Job[]> {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY')
  const supabase = createClient(getSupabaseUrl(), serviceKey, { auth: { persistSession: false } })

  const urls = new Set<string>()
  const add = (u: string | null | undefined) => {
    if (u && u.includes(STORAGE_MARKER)) urls.add(u)
  }

  const { data: productos, error: e1 } = await supabase.from('productos').select('imagenes')
  if (e1) throw e1
  productos?.forEach(p => (p.imagenes as string[] | null)?.forEach(add))

  for (const table of ['categorias', 'banners', 'promociones'] as const) {
    const { data, error } = await supabase.from(table).select('imagen_url')
    if (error) throw error
    data?.forEach(row => add(row.imagen_url as string | null))
  }

  return Array.from(urls).flatMap(oldUrl => {
    const storagePath = storagePathFromUrl(oldUrl)
    return storagePath ? [{ oldUrl, storagePath }] : []
  })
}

async function processJob(job: Job): Promise<Result> {
  const ext = extensionOf(job.storagePath)
  const response = await fetch(job.oldUrl)
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const original = Buffer.from(await response.arrayBuffer())

  const shouldConvert =
    original.length > OPTIMIZE_ANY_OVER ||
    (['png', 'jpg', 'jpeg'].includes(ext) && original.length > OPTIMIZE_PNG_JPEG_OVER)

  let body: Buffer = original
  let key = job.storagePath
  let contentType = CONTENT_TYPE_BY_EXT[ext] ?? 'application/octet-stream'

  if (shouldConvert) {
    const webp = await optimizeImageBuffer(original)
    if (webp.length < original.length) {
      body = webp
      key = job.storagePath.replace(/\.[^./]+$/, '') + '.webp'
      contentType = 'image/webp'
    }
  }

  const newUrl = publicUrlForKey(key)
  const base = {
    oldUrl: job.oldUrl,
    newUrl,
    originalBytes: original.length,
    finalBytes: body.length,
    converted: key !== job.storagePath,
  }

  if (DRY_RUN) return { ...base, skipped: false }
  if (await existsInR2(key)) return { ...base, skipped: true }

  await putImageObject({ key, body, contentType })
  return { ...base, skipped: false }
}

function sqlLiteral(value: string): string {
  return `'${value.replace(/'/g, "''")}'`
}

async function main() {
  const jobs = await collectJobs()
  console.log(`${DRY_RUN ? '[DRY RUN] ' : ''}Images referenced in DB: ${jobs.length}`)

  const results: Result[] = []
  const failures: { url: string; error: string }[] = []
  let cursor = 0

  async function worker() {
    while (cursor < jobs.length) {
      const job = jobs[cursor++]
      try {
        results.push(await processJob(job))
      } catch (error) {
        failures.push({ url: job.oldUrl, error: error instanceof Error ? error.message : String(error) })
      }
      const done = results.length + failures.length
      if (done % 50 === 0 || done === jobs.length) console.log(`  ${done}/${jobs.length}`)
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker))

  const mb = (b: number) => (b / 1048576).toFixed(1)
  const before = results.reduce((s, r) => s + r.originalBytes, 0)
  const after = results.reduce((s, r) => s + r.finalBytes, 0)
  console.log(`\nOK: ${results.length} | converted to WebP: ${results.filter(r => r.converted).length} | already in R2: ${results.filter(r => r.skipped).length} | failed: ${failures.length}`)
  console.log(`Size: ${mb(before)} MB → ${mb(after)} MB`)
  failures.forEach(f => console.log(`  FAIL ${f.url} → ${f.error}`))

  await mkdir(OUTPUT_DIR, { recursive: true })
  const sorted = [...results].sort((a, b) => a.oldUrl.localeCompare(b.oldUrl))
  await writeFile(
    path.join(OUTPUT_DIR, DRY_RUN ? 'r2-url-map.dry-run.json' : 'r2-url-map.json'),
    JSON.stringify(sorted.map(({ oldUrl, newUrl }) => ({ oldUrl, newUrl })), null, 2),
  )

  if (!DRY_RUN) {
    const values = sorted.map(r => `  (${sqlLiteral(r.oldUrl)}, ${sqlLiteral(r.newUrl)})`).join(',\n')
    const sql = `-- Generated by scripts/migrate-images-to-r2.ts — ${new Date().toISOString()}
-- Only fills the mapping table. It does NOT change any product/category/banner/promo yet.
begin;
create table if not exists private.image_url_map (
  old_url text primary key,
  new_url text not null,
  created_at timestamptz not null default now()
);
revoke all on private.image_url_map from public, anon, authenticated;
insert into private.image_url_map (old_url, new_url) values
${values}
on conflict (old_url) do update set new_url = excluded.new_url;
commit;
select count(*) as mapped from private.image_url_map;
`
    await writeFile(path.join(OUTPUT_DIR, 'r2-url-map.sql'), sql)
    console.log(`\nWrote scripts/output/r2-url-map.sql (${sorted.length} rows)`)
  }

  if (failures.length) process.exitCode = 1
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
