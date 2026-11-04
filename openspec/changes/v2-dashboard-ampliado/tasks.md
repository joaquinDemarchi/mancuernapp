# Tasks

> Cada tarea: commit local + `[x]` acá + actualizar `traspaso.md`. Costo estimado entre paréntesis.
> Total estimado: ~64k tokens (5 grupos). Push y deploy solo con OK de Joa. Diseño en una sesión aparte del código (grupo 1).

## 1. Diseño (sesión de diseño, ~14k)

- [x] 1.1 Mockups en un Artifact Design (tokens de `design/tokens.css`, 390 px, tema oscuro, datos de ejemplo de "joa") con 2–3 variantes numeradas de `/resumen`: selector de período, volumen y sesiones por semana (con 8 semanas y con "Todo" de un año), racha, mejores marcas, progreso por ejercicio y estado vacío; más el enlace "Resumen" en el inicio; verificar que Joa tiene el link; commit del link en `traspaso.md` (~10k)
- [x] 1.2 Con la elección de Joa, handoff a design.md §8 (pantalla por pantalla, textos y tokens) y cerrar en §7 cómo se ven muchas semanas; si cambia algo de las specs, actualizar los deltas y verificar `openspec validate v2-dashboard-ampliado --strict`; commit (~4k)

## 2. Cálculos (~16k)

- [x] 2.1 En `src/lib/calculos.ts`: `desdePeriodo`, `lunes`, `porSemana` (volumen y sesiones, semanas vacías en 0) y `racha` según design §1–§3, con tests (domingo/lunes, cambio de mes y de año, semana actual sin sesión, racha cortada, período sin sesiones); verificar `npm test` y `npm run check`; commit (~8k)
- [x] 2.2 `mejoresMarcas` y `progreso` según design §4–§5, con tests (empate de kg, primera fecha de la marca, cada tipo, calentamiento afuera, una sola vez, volumen 0 la primera vez, ejercicio borrado del catálogo); verificar `npm test` y `npm run check`; commit (~8k)

## 3. Pantalla `/resumen` (~20k)

- [x] 3.1 Ruta `src/routes/resumen/+page.svelte` con `Cabecera` (vuelve a `/`), selector de período en la URL (design §6), racha, mejores marcas, progreso (fila → `/evolucion?id=…`) y estado vacío según §8; enlace "Resumen" en el inicio (con y sin rutina activa); verificar en dev a 390 px con stores falsos: default, cambiar a "Todo", sin rutina activa, período vacío, tocar un ejercicio y volver con el período intacto; commit (~12k)
- [x] 3.2 `GraficoSemanas.svelte` (design §7) con volumen y sesiones por semana y su lista accesible; verificar en dev con 8 semanas, una semana vacía y "Todo" de un año, en tema oscuro y claro; `npm run check`; commit (~8k)

## 4. Cierre (~6k)

- [ ] 4.1 Verificar offline (sin pedidos de red al abrir `/resumen`); actualizar `openspec/config.yaml` y `docs/decisiones-diseno-mancuernapp.md` (dashboard sale de la lista de v2 pendiente); `npm run check`, `npm test`, `npm run build`; commit (~3k)
- [ ] 4.2 Con OK de Joa, push a `main` y verificar el deploy de Vercel en verde; checklist en el celu de Joa (anotarla en `traspaso.md`): abrir el resumen, cambiar de período, leer volumen y racha, abrir la evolución desde el progreso y volver, en modo avión; commit (~3k)

## 5. Critique, accesibilidad y copy (~8k)

- [ ] 5.1 `design-critique` + `accessibility-review` + `ux-copy` sobre `/resumen` (gráfico legible por lector de pantalla, selector como grupo de radios, touch targets ≥ 48 px, contraste de las barras en ambos temas); aplicar lo que Joa apruebe; verificar en dev; commit (~8k)

## Workflow follow-up

- Archivar el change con `/opsx:archive` cuando Joa dé por cerrado el resumen y verificar `openspec validate --specs`.
