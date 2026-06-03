# Paleta de colores — Tienda VM Fashion

## Tema activo: oscuro

El catálogo usa fondo negro con texto crema y acentos dorados. Las variables viven en `app/globals.css`.

| Token | Valor | Uso |
|-------|-------|-----|
| `--bg-base` | `#0a0a0a` | Fondo general |
| `--bg-card` | `#111111` | Cards, drawers |
| `--bg-surface` | `#141414` | Superficies secundarias |
| `--text-primary` | `#f0ebe4` | Títulos, texto principal |
| `--text-muted` | `rgba(240,235,228,0.72)` | Párrafos, nav inactivo |
| `--text-faint` | `rgba(240,235,228,0.4)` | Placeholders, hints |
| `--gold` | `#C9A84C` | Acentos, botones, logo |
| `--gold-light` | `#D4AF37` | Hover dorado |
| `--border` | `rgba(201,168,76,0.28)` | Bordes dorados |
| `--border-input` | `rgba(240,235,228,0.2)` | Inputs, líneas de búsqueda |
| `--placeholder` | `rgba(240,235,228,0.42)` | Placeholders, iconos de búsqueda |
| `--navbar-bg` | `rgba(10,10,10,0.97)` | Navbar al hacer scroll |

En componentes, preferir `var(--text-primary)`, `var(--gold)`, etc. en lugar de hex sueltos.

---

## Tema claro (experimental — no activo)

Probamos migrar a fondo blanco porque el diseño original era oscuro. Resumen de lo iterado en el **hero / navbar**:

### Paleta propuesta (cliente)

| Token | Valor |
|-------|-------|
| `--background` | `#FFFFFF` |
| `--surface` | `#FAFAFA` |
| `--text-primary` | `#111827` → `#1F2937` |
| `--text-secondary` | `#374151` (gris carbón) |
| `--text-muted` | `#4B5563` |
| `--gold` | `#C9A55C` |
| `--gold-dark` | `#A8833D` |
| `--border` | `#D1D5DB` |
| `--border-input` | `#6B7280` |
| `--placeholder` | `#4B5563` |

### Ajustes de contraste que probamos

1. **Sustituir opacidades claras** (`rgba(44,40,36,0.5)`) por grises sólidos sobre blanco.
2. **Dorado más oscuro** en textos (`#A8833D`) — el `#C9A84C` se veía lavado sobre blanco.
3. **Peso tipográfico**: `font-light` → `font-normal` / `font-medium` en labels, tabs e input.
4. **Bordes**: de `1px #E5E7EB` a `2px #6B7280` en búsqueda y tabs de categorías.

### Por qué volvimos al oscuro

- El layout, cards y overlays (categorías con gradiente, badges) estaban pensados para **fondo negro + texto crema**.
- Sobre blanco hacía falta rehacer casi todos los contrastes; el resultado no convenció del todo.
- El tema oscuro ya tenía buena legibilidad con `rgba(240,235,228,…)` y dorado `#C9A84C`.

### Cómo reactivar el tema claro (futuro)

1. Duplicar variables en `:root[data-theme="light"]` en `globals.css`.
2. Añadir toggle o clase en `<html data-theme="light">`.
3. Revisar componentes que usan hex fijos (`#ffffff`, `#1c1917`) y migrarlos a variables.

Referencia de commits / conversación: iteraciones en hero, navbar, `ProductCard`, `globals.css`.
