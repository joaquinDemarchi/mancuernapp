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

- 2.2 hecha (30/10/2026): componentes en el mismo artifact, HTML + CSS sin framework (clases `ma-*`, solo tokens) en `project/components/bundle.css`, cada uno con `README.md` (guía) y `preview.html` (estados):
  - **Boton** (primario `accent` 56 px / secundario borde `control` 48 px; reposo, presionado, foco, deshabilitado), **BarraAccion** (fija abajo, `surface`, progreso en meta + secundario + primario).
  - **Stepper** (−/+ 56 px, campo editable con coma decimal; estados igual / ajustado en `accent-ink` / mínimo; variante `ma-step--xl` para kg 96 px), **ChipRpe** (radios 6–10, 48 px, elegido en `accent`, tocar de nuevo desmarca).
  - **TarjetaEjercicio** (pendiente en `surface` con previos en `ink-muted` + botones; hecho igual y ajustado en `raised`, lo cambiado en `accent-ink`), **IndicadorSobrecarga** (▼ Bajo / ● Óptimo / ▲ Alto sobre su `-tint`, + versión resumen 120 px).
  - El ✓ es un SVG (`ma-ico`), no el carácter: el inspector de taste lo cuenta como emoji.
  - Verificado con `inspect.mjs --app` de taste sobre una página de prueba local con los tokens (oscuro y claro, 390/768/1440): 0 FAIL. WARN aceptados: números de 96/120 px (decisión de Lio), "crema" (lee el `ink` #F2EEE8 como fondo; es tiza), filas desparejas y h1 32 px (solo de la página de prueba).

- 3.1 hecha (30/10/2026): `design/icon/` con `icon.svg` (fuente), `icon-maskable.svg`, `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`.
  - Mancuernita de mango corto (barra + 2 collarines + 2 discos por lado, radios 4/8), celeste #5CC8F0 plano sobre blanco, rotada −45° (abajo-izq → arriba-der). Primera versión con mango largo parecía barra olímpica: se acortó.
  - Normal a escala 1.2; maskable a 1.05 con la esquina más lejana a 196 px del centro (círculo seguro 80 % = 205). Verificado recortando al círculo.
  - Mostrado a Lio en una hoja de contacto (512 / maskable / maskable recortado / 192).

## Próximo paso
- 4.1: `design/tokens.css` (`:root` oscuro, `[data-theme="light"]` claro) desde `tokens.json` del artifact (valores en la sección 2.1 de arriba); incluir `--font-display`/`--font-text`, `font-stretch: 75%` para condensada y `tabular-nums`.

## Gotchas
- Skill taste = `design-taste-frontend`; para pantallas de app pide `draw.mjs --app --kind <x>` (usé `creator`). Solo 1 de 3 estilos sorteados era oscuro: B y C son adaptaciones.
- El canvas no se pudo verificar visualmente desde el browser del panel (claude.ai pide login); Lio lo revisó a mano.
- Costo real de 1.1 ≈ 30k tokens (estimado en tasks.md: 10k). Recalibrar 2.x hacia arriba.
- Costo real de 2.1 ≈ 25k (estimado 6k; mi estimación previa 15–20k). Lo caro: instrucciones del tipo Design System + verificación de `tnum`. 2.2 probablemente 20k+.
- Design System: no se verificó visualmente el render (claude.ai pide login en el browser del panel); Lio debe abrir el link. Si `tokens.css` generado no expone `--radius`, la portada queda con esquinas rectas (no rompe nada).
- `fontStretch` en los estilos de `tokens.json` puede no ser leído por la página del tipo; la regla está en el README y debe ir explícita en `design/tokens.css` (4.1).
- Costo real de 2.2 ≈ 30k (estimado 5k). Lo caro: leer `format.md` del tipo (16 KB) y la ronda de inspección con capturas.
- Para ver componentes sin login: un script (`build-test.mjs`, quedó en el scratchpad de la sesión, no persiste; ~20 líneas) arma `test/{dark,light}/index.html` con los tokens y `inspect.mjs --app` saca capturas (levantar `python -m http.server` fue bloqueado por permisos).
- Exportar PNG de un SVG: Chrome headless con `--window-size=N,N` deja un viewport más bajo y el SVG sale corrido. Solución: página envoltorio con `<img width=N height=N>`, ventana N×(N+200) y recortar con PIL a N×N. Costo real de 3.1 ≈ 12k.
- Para verificar fuentes: `fonttools` quedó instalado con pip; `curl` a fonts.googleapis.com con UA viejo devuelve TTF.
