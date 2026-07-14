# Tema — Tienda VM Fashion

## Tema activo: claro (único)

La tienda usa únicamente el tema claro: fondo crema cálido, texto carbón y acentos dorados. Las variables viven en `app/globals.css` bajo `:root`.

| Token | Valor | Uso |
|-------|-------|-----|
| `--bg-base` | `#FAF8F5` | Fondo general |
| `--bg-card` | `#FFFFFF` | Cards, drawer |
| `--bg-muted` | `#F5F2EC` | Superficies secundarias |
| `--text-primary` | `#1E1E1E` | Títulos, texto principal |
| `--text-muted` | `#6E6E6E` | Párrafos, nav inactivo |
| `--gold` | `#C9A84C` | Acentos, links activos |
| `--gold-light` | `#F5ECD8` | Botones, fondos suaves |
| `--border` | `#EDE7DD` | Bordes |

En componentes, preferir `var(--text-primary)`, `var(--gold)`, etc. en lugar de hex sueltos.

No hay toggle de tema ni modo oscuro.
