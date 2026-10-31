# design/ — Sistema de diseño Pizarra

Copia operativa del sistema de diseño de MancuernApp. Lo que está acá es lo que importa la app; los artifacts de claude.ai son la referencia viva (vistas previas, guías largas).

| Qué | Dónde |
| --- | --- |
| Tokens (colores, tipografía, espaciado, radios) | [`tokens.css`](tokens.css) |
| Ícono (fuente + PNG para el manifest) | [`icon/`](icon/) |
| Design System (tokens, componentes con vistas previas, brand book) | https://claude.ai/artifact/GB9FbyJPzAdy3jsURqYKhP (privado) |
| Direcciones visuales evaluadas (A, B, C; se eligió C · Pizarra) | https://claude.ai/artifact/9pXs4KnzeSYmDHSbgnCfKf (privado) |

Si un valor cambia, se cambia primero en el Design System y después en `tokens.css`. Fuera de eso, `tokens.css` es la única fuente: ninguna pantalla usa un color, tamaño o radio escrito a mano que exista como token.

## Cómo se usa

```css
@import "design/tokens.css"; /* en el layout raíz */
body { background: var(--ground); color: var(--ink); font-family: var(--font-text); }
```

- **Tema:** oscuro por defecto (`:root`). El claro se activa con `data-theme="light"` en `<html>`; lo elige el usuario en Ajustes. El bloque claro redefine todos los colores.
- **Números** (kg, reps, %, series): `font-family: var(--font-display); font-stretch: var(--stretch-condensed); font-variant-numeric: tabular-nums;`. Decimales con coma.
- **Fuente:** Saira (OFL) con eje de ancho: al 75 % es la condensada de números y títulos, al 100 % el texto. No se usa la familia "Saira Condensed" porque no trae cifras tabulares. En `mvp-0-base` se autoaloja (woff2 variable, latín, `wdth` 75–100, `wght` 400–700) y la cachea el service worker; `tokens.css` solo nombra la familia.

## Reglas

1. **Una mano.** La acción principal de cada pantalla va en la mitad inferior, en la barra de acción (`BarraAccion`). Nada importante arriba que obligue a estirar el pulgar.
2. **≥ 48 px.** Todo control tocable mide al menos `--touch-min` (48 × 48 px). Acción primaria y botones −/+ del stepper: `--touch-primary` (56 px).
3. **Indicador no solo por color.** Bajo / Óptimo / Alto siempre llevan forma y palabra: ▼ Bajo, ● Óptimo, ▲ Alto, más el % con signo.
4. **Un solo naranja.** `--accent` solo en la acción primaria y en la selección activa (chip RPE). Como texto se usa `--accent-ink`; en claro el naranja nunca va como texto.
5. **Pizarra.** Radio único `--radius` (4 px); barras a todo el ancho con `--radius-none`. Sin gradientes, sin sombras en reposo, sin bordes decorativos: las capas se separan por tono `--ground` → `--surface` → `--raised`. `--elevation-float` solo para hojas y diálogos.
6. **Check como ícono.** El "hecho" es un SVG (trazo 2,5, puntas rectas, `currentColor`), no el carácter ✓.

## Componentes

Documentados con estados y vista previa en el Design System; los estilos de referencia están ahí en `components/bundle.css` (clases `ma-*`, solo tokens de este archivo).

| Componente | Para qué | Estados |
| --- | --- | --- |
| Boton | Acción primaria (`--accent` + `--on-accent`) o secundaria (borde `--control`) | reposo, presionado, foco, deshabilitado |
| Stepper | −/valor/+ con valor editable; kg en 96 px en Ajustar | igual al anterior, ajustado (`--accent-ink`), en el mínimo, foco |
| ChipRpe | RPE 6–10, opcional, selección única | sin elegir, elegido (`--accent`), foco; tocar el elegido lo desmarca |
| TarjetaEjercicio | Un ejercicio en "Hoy: Día X" | pendiente (previos en `--ink-muted`), hecho igual, ajustado |
| IndicadorSobrecarga | Bajo < 0 % · Óptimo 0–10 % · Alto > 10 % | pastilla sobre su `-tint`; versión grande (120 px) en el resumen |
| BarraAccion | Barra fija abajo con progreso y la acción de la pantalla | una por pantalla |

## Contraste verificado

Ratio WCAG calculado desde los valores de `tokens.css` (mínimo: 4,5 texto; 3 componentes y texto grande).

| Par | Mín. | Oscuro | Claro |
| --- | --- | --- | --- |
| `ink` / `ground` | 4,5 | 16,1 | 16,6 |
| `ink` / `raised` | 4,5 | 12,9 | 15,0 |
| `ink-muted` / `surface` (valores de la vez anterior) | 4,5 | 7,7 | 7,7 |
| `ink-muted` / `raised` | 4,5 | 6,8 | 6,3 |
| `ink-faint` / `raised` (peor caso de meta) | 4,5 | 4,6 | 5,1 |
| `on-accent` / `accent` (botón primario) | 4,5 | 7,2 | 7,2 |
| `accent-ink` / `surface` | 4,5 | 6,6 | 5,6 |
| `accent-ink` / `raised` (valor ajustado en tarjeta hecha) | 4,5 | 5,7 | 4,5 |
| `control` / `surface` (borde de control) | 3 | 3,0 | 3,5 |
| `control` / `ground` | 3 | 3,3 | 3,1 |
| `focus` / `ground` (anillo de foco) | 3 | 7,2 | 5,0 |
| `bajo` / `bajo-tint` | 4,5 | 8,1 | 4,9 |
| `optimo` / `optimo-tint` | 4,5 | 7,1 | 4,6 |
| `alto` / `alto-tint` | 4,5 | 5,5 | 5,4 |

Límite conocido: `--accent` sobre `--ground` en claro da 2,3:1. Por eso el primario se reconoce por su etiqueta (7,2:1) y su lugar, y el naranja no se usa solo para marcar un estado.

## Ícono

`icon/icon.svg` es la fuente: mancuernita de mango corto, negro `--ground` #141311 plano, en diagonal sobre `--accent` #FF7A3D (los colores de la interfaz). Exportados: `icon-192.png`, `icon-512.png` e `icon-maskable-512.png` (de `icon-maskable.svg`, con toda la figura dentro del círculo seguro del 80 %). El manifest y `config/app.ts` los referencian desde acá; el nombre de la app es "MancuernApp".
