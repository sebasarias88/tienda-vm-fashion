# Tienda VM Fashion

Catálogo de belleza y cuidado capilar (detal y mayorista) con pedidos por WhatsApp.
Producción: https://www.tiendavmfashion.com

## Stack
- Next.js 16 (App Router, ISR) + React 19 + Tailwind 4 — hosted on Vercel
- Supabase (Postgres + Auth) — data, admin login, RLS
- Cloudflare R2 (`img.tiendavmfashion.com`) — images, thumbnails and videos
- Cloudflare DNS — domain registered at GoDaddy

## Development
```bash
npm install
cp .env.example .env   # fill in the values (never commit .env)
npm run dev
```
Checks before committing:
```bash
./node_modules/.bin/tsc --noEmit -p .
./node_modules/.bin/eslint .
```

## Branches
Feature branches from `develop` → PR to `develop` (Vercel preview) → `develop` → `main` (production).

## More
Architecture, security rules and conventions: see [AGENTS.md](./AGENTS.md).
SQL used for the R2 migration and its rollback: `docs/r2-migration/`.
