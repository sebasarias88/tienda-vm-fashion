# Paleta de colores — Tienda VM Fashion

## Tema activo: claro (catálogo)

El catálogo usa fondo crema cálido con texto carbón y acentos dorados. Las variables viven en `app/globals.css` bajo `:root`.

| Token | Valor (light) | Uso |
|-------|---------------|-----|
| `--bg-base` | `#FAF8F5` | Fondo general |
| `--bg-card` | `#FFFFFF` | Cards, drawer |
| `--bg-surface` | `#F3F0EB` | Superficies secundarias |
| `--bg-footer` | `#F0EDE8` | Footer |
| `--text-primary` | `#1A1612` | Títulos, texto principal |
| `--text-muted` | `#5C5650` | Párrafos, nav inactivo |
| `--text-subtle` | `#7A736B` | Labels, hints |
| `--gold` | `#9A7330` | Acentos, links activos (contraste sobre blanco) |
| `--gold-light` | `#C9A84C` | Botones, precios |
| `--gold-bright` | `#D4AF37` | Hover dorado |
| `--text-on-gold` | `#FFFCF7` | Texto sobre botones dorados |
| `--border` | `rgba(154,115,48,0.32)` | Bordes dorados |
| `--border-input` | `rgba(26,22,18,0.2)` | Inputs, tabs |
| `--navbar-bg` | `rgba(250,248,245,0.94)` | Navbar al hacer scroll |

En componentes del catálogo, preferir `var(--text-primary)`, `var(--gold)`, etc. en lugar de hex sueltos.

### Toggle de tema

- Botón en el **navbar** del catálogo (icono luna / sol).
- Preferencia guardada en `localStorage` (`vm-fashion-theme`).
- Por defecto: **light**.
- El admin fuerza **dark** al entrar a `/admin`; al volver al catálogo se restaura la preferencia del usuario.
- Script anti-flash en `app/layout.tsx` vía `ThemeScript`.


---

## Cómo extender

1. Añadir tokens nuevos en `:root` y en `[data-theme="dark"]`.
2. Usar `var(--token)` en JSX; evitar hex fijos en componentes compartidos.
3. Utilidades globales: `.gold-shimmer`, `.gold-border-glow`, `.bg-overlay-image`.
