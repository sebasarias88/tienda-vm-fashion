<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Tienda VM Fashion — rules for AI agents

This store is **in production with real customers and data**. Read this before doing anything.

## How to work with Sebastian
- **Always answer in Spanish.** All code, file names, identifiers and commit messages in **English**.
- Explain the *why* of security, database and infrastructure changes (he is learning).
- He calls the browser developer tools **"la consola"** (Cmd+Option+I on his Mac).
- **Never `git push`, never merge, never open PRs.** Local commits are fine. He pushes.
- Before code changes, suggest a branch name. Branch from `develop`:
  `feat/…`, `fix/…`, `perf/…`, `chore/…` → PR to **`develop`** → preview → `develop` → `main` at night (low traffic).
- Always say which branch you left the work on (he may have a terminal open on another branch).
- Run `./node_modules/.bin/tsc --noEmit -p .` and `./node_modules/.bin/eslint .` before committing (0 errors).

## Production database (Supabase) — hard rules
- **Never delete or overwrite production data.** No `DROP TABLE`, `TRUNCATE`, mass `DELETE/UPDATE` without explicit approval.
- Schema changes must be **additive and backward compatible** (the live site keeps working before and after).
- Before risky changes: snapshot what you will touch (copy table / save old values) and prepare the rollback SQL.
- Test permissions with a transaction that ends in `rollback`, impersonating roles:
  `set local role authenticated; select set_config('request.jwt.claims', '{"sub":"<uuid>","role":"authenticated"}', true);`
- Run Supabase **security and performance advisors** after DDL changes.

## Security model
- Public catalog: `anon` can only **read**. Anon key is public by design; RLS is the real lock.
- Writes require an **admin**: `private.admin_users` + `private.is_admin()` (schema `private` is not exposed by the API).
  Policies: `<table>_select_public` (anon, authenticated) and `<table>_insert/update/delete_admin` (authenticated + `(select private.is_admin())`).
- `public.is_admin()` is a tiny RPC (authenticated only) used by server routes to check the caller.
- Public sign-ups are **disabled** in Supabase Auth. New admins: create the user in the dashboard and insert its id in `private.admin_users`.
- Server-only secrets (R2 keys, service role) never get the `NEXT_PUBLIC_` prefix.

## Images and videos (Cloudflare R2 — not Supabase Storage)
- Public domain `https://img.tiendavmfashion.com` (bucket `vmfashion-images`). R2 has **no egress fees**; Supabase Storage egress caused a service restriction before. Do not serve catalog media from Supabase.
- Keys: `productos/…`, `categorias/…`, `banners/…`, `promociones/…`, `videos/…`; thumbnails at `thumbs/<key without ext>.webp` (640px).
- Uploads: `lib/catalogImages.ts` → `POST /api/admin/images` (admin-only). Images are converted to WebP with a weight budget (`IMAGE_SIZE_TARGET_BYTES`, products ≤150KB).
- Videos: `lib/videoOptimize.ts` converts to MP4 H.264 in the browser (mediabunny), then a signed URL from `POST /api/admin/videos` uploads straight to R2. Up to 5 per product in `productos.videos` (jsonb); `video_url`/`video_tipo` mirror the first one (legacy).
- Cards/lists use `<CatalogImage variant="thumb">` (falls back to the full image).
- Scripts (run on Sebastian's Mac, they need network): `scripts/migrate-images-to-r2.ts`, `scripts/generate-thumbnails.ts`, `scripts/cleanup-r2-orphans.ts`.

## Caching and performance
- Public pages use the cookie-less client (`createSupabasePublic`) + ISR (`revalidate = 60`). Never call `cookies()` / `createSupabaseServer()` in public catalog pages (it disables caching).
- Data loaders must **throw on DB errors** (ISR then keeps serving the last good page); return null only for "not found".
- The admin triggers `POST /api/admin/revalidate` automatically after any write (see `lib/storefrontRefresh.ts`).
- Service worker `public/sw.js`: bump `VERSION` when changing it. It never touches `/admin` or `/api`.
- `MAINTENANCE_MODE=true` (Vercel env + redeploy) shows a maintenance screen with WhatsApp; admin keeps working.

## SEO
- `SITE_URL` must be `https://www.tiendavmfashion.com` in Vercel.
- Wholesale (`/mayorista`) product pages canonicalize to retail when the product is visible in retail.
- Clean category URLs `/productos?categoria=<slug>` are indexable; searches/filters/pages 2+ are `noindex`.
