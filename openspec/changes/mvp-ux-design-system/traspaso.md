# Notas de traspaso — mvp-ux-design-system

## Estado
- 1.1 hecha (30/10/2026): artifact **Design** con 3 direcciones, cada una con Hoy / Ajustar / Resumen en oscuro (390×844):
  https://claude.ai/artifact/9pXs4KnzeSYmDHSbgnCfKf (privado; fuente en el scratchpad de la sesión, no en el repo)
  - **A · Negro puro** (`true-black-flat` de taste): fondo #000, elevación solo por luminosidad (#111/#2a2a2a), primario blanco invertido en píldora, celeste #5CC8F0 solo en marcas/datos. Inter Tight. Steppers horizontales −/valor/+.
  - **B · Escalera celeste** (`accent-ladder` adaptado a oscuro): fondo azul noche #0B1520, celeste lleno en ✓/primario/RPE activo y sus tintes en áreas (tarjetas hechas). Manrope. Steppers verticales en 3 columnas (series/reps/kg), radios 16–20.
  - **C · Pizarra** (`editorial-greeting` adaptado): grafito cálido #141311, esquinas 4 px, Barlow Condensed para números grandes (kg 96 px en Ajustar, % 120 px en Resumen), acento naranja disco #FF7A3D, carga visible en cada fila de Hoy.
- Indicador en las 3: etiqueta + forma (▼ Bajo / ● Óptimo / ▲ Alto), no solo color.
- Datos de ejemplo coherentes: volumen 2.980 kg vs 2.928 kg (+1,8 % Óptimo); banca +2,1 %, inclinado −8,3 %, laterales +25 %.
- 1.2 hecha (30/10/2026): **Lio eligió C · Pizarra con Saira Condensed** (display/números) + **Saira** (texto). Resto de C sin cambios: grafito #141311, esquinas 4 px, acento naranja #FF7A3D, kg 96 px en Ajustar, % grande en Resumen. Comparativa de fuentes en el tablero "C · Alternativas de fuente" del canvas.

- 2.1 hecha (30/10/2026): artifact **Design System** "MancuernApp" (privado): https://claude.ai/artifact/GB9FbyJPzAdy3jsURqYKhP
  - Archivos: `project/tokens.json`, `project/README.md` (brand book), `project/components/Cover/preview.html`, `project/design-system.json`. Copia de trabajo en el scratchpad de la sesión (no en el repo).
  - Color (oscuro por defecto / claro): `ground` #141311/#F3F2EF, `surface` #1E1C19/#FFF, `raised` #2A2723/#E9E7E3, `control` #6E675D/#8F887E, `ink` #F2EEE8/#141311, `ink-muted` #B5AEA4/#57524B, `ink-faint` #968F85/#665F56, `accent` #FF7A3D (ambos), `on-accent` #141311, `accent-ink` #FF7A3D/#B4440E, indicador `bajo` #5CC8F0/#0B6E99 (celeste del ícono), `optimo` #4CC38A/#1F7A4D, `alto` #F2667A/#B42339 (+ `-tint` de fondo), `scrim`. Todos los pares de texto ≥ 4.5:1 (tabla en el README); `control` ≥ 3:1.
  - **Cambio de fuente (misma apariencia):** Saira Condensed estática **no tiene `tnum`** (dígitos proporcionales). Se usa **Saira con eje `wdth`**: `font-stretch: 75%` para números/títulos (= Saira Condensed) y 100 % para texto; ambas con `tnum` verificado en el archivo. Una sola familia.
  - Escala: num-hero 120 · num-xl 96 · num-l 40 · title 28 · heading 20 (condensada) · body/label 16 · meta 13. Espaciado base 4 (4…48), `touch-min` 48, `touch-primary` 56. Radios: `radius` 4 y `radius-none` 0. Elevación: solo `elevation-float` para hojas/diálogos; en reposo, escalón de tono.
  - Decisión offline: **autoalojar** Saira variable woff2 (latin, wdth 75–100, wght 400–700) en `mvp-0-base`, cacheada por el service worker.

## Próximo paso
- 2.2: componentes base con estados en el mismo artifact (`project/components/<Comp>/README.md` + `preview.html`; leer `artifact-type/reference/format.md` del artifact antes). Al terminar, commit.

## Gotchas
- Skill taste = `design-taste-frontend`; para pantallas de app pide `draw.mjs --app --kind <x>` (usé `creator`). Solo 1 de 3 estilos sorteados era oscuro: B y C son adaptaciones.
- El canvas no se pudo verificar visualmente desde el browser del panel (claude.ai pide login); Lio lo revisó a mano.
- Costo real de 1.1 ≈ 30k tokens (estimado en tasks.md: 10k). Recalibrar 2.x hacia arriba.
- Costo real de 2.1 ≈ 25k (estimado 6k; mi estimación previa 15–20k). Lo caro: instrucciones del tipo Design System + verificación de `tnum`. 2.2 probablemente 20k+.
- Design System: no se verificó visualmente el render (claude.ai pide login en el browser del panel); Lio debe abrir el link. Si `tokens.css` generado no expone `--radius`, la portada queda con esquinas rectas (no rompe nada).
- `fontStretch` en los estilos de `tokens.json` puede no ser leído por la página del tipo; la regla está en el README y debe ir explícita en `design/tokens.css` (4.1).
- Para verificar fuentes: `fonttools` quedó instalado con pip; `curl` a fonts.googleapis.com con UA viejo devuelve TTF.
