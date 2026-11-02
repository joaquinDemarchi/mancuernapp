# Tasks

> Cada tarea: commit local + `[x]` acá + actualizar `traspaso.md`. Costo estimado entre paréntesis.
> Total estimado: ~95k tokens (7 grupos). Push y deploy solo con OK de Joa. Diseño en una sesión aparte del código (grupo 1).

## 1. Diseño (sesión de diseño, ~20k)

- [ ] 1.1 Mockups en un Artifact Design (tokens de `design/tokens.css`, 390 px, tema oscuro): resumen de "Terminar sesión" con %, indicador y detalle por ejercicio; historial (2–3 variantes de fila y de dónde va "Historial" en el inicio); evolución de un ejercicio con gráfico y lista (variante volumen vs kg máximo); "Ver evolución" en Ajustar y en la ficha; estados vacíos y primera vez; verificar que Joa tiene el link y las variantes numeradas; commit del link en `traspaso.md` (~15k)
- [ ] 1.2 Con la elección de Joa, handoff a design.md §6 (pantalla por pantalla, textos y tokens); si la elección cambia algo de las specs (p. ej. gráfico de kg máximo), actualizar los deltas y verificar `openspec validate mvp-3-metricas-historial --strict`; commit (~5k)

## 2. Cálculos y datos (~18k)

- [ ] 2.1 En `src/lib/calculos.ts`: `volumenEjercicio`, `anterior`, `crecimiento`, `indicador` con `UMBRALES`, `formatearPct` y `evolucion` (design.md §2), con tests en `calculos.test.ts`: 3×10·60 + 1×8·70 = 2.360, +5 %, primera vez sin %, previo 0 sin %, 10 % = óptimo, 0 % = óptimo, −3 % = bajo, 10,5 % = alto, kg 62,5, evolución cruzando dos rutinas en orden; verificar `npm test` y `npm run check` en verde; commit (~10k)
- [ ] 2.2 `src/lib/sesion.ts` lee todas las sesiones del usuario (design.md §1); `sesionDeHoy` y `diaSugerido` filtran por la rutina activa donde corresponde, con tests que mezclan sesiones de otra rutina; verificar `npm test`, y en dev con Joa logueado que la tarjeta Hoy, la rotación y "Seguir Día X" siguen iguales; commit (~8k)

## 3. Resumen con % e indicador (~10k)

- [ ] 3.1 `Indicador.svelte` (design.md §5) y resumen de `/sesion` según §6: volumen, % e indicador de la sesión y de cada ejercicio de peso; primera vez sin %; verificar en dev a 390 px los escenarios "Volumen", "Con vez anterior" y "Primera vez" con stores falsos, y que el indicador se entiende en gris (sin color); commit (~10k)

## 4. Historial (~12k)

- [ ] 4.1 Ruta `/historial` (filas según §6, estado vacío) y acceso "Historial" en el inicio; tocar una fila abre `/sesion?dia=&fecha=`; "Borrar" de una sesión abierta desde el historial vuelve al historial; verificar en dev a 390 px "Orden", "Fila de una sesión", "Sin sesiones", "Corregir un kg viejo" y "Borrar una vieja" (con una sesión de prueba, dejando Firestore como estaba); commit (~12k)

## 5. Evolución por ejercicio (~15k)

- [ ] 5.1 `GraficoEvolucion.svelte` (SVG propio, design.md §3) y ruta `/evolucion?id=` con gráfico (solo peso) y lista de veces; "Ver evolución" en la ficha `/ejercicio?id=` y en `HojaAjustar`; verificar en dev a 360 y 390 px "Cruzando rutinas" (stores falsos), "Una sola vez", un ejercicio de tiempo (sin gráfico), "Desde Ajustar" (vuelve a la sesión) y `npm run build` con la ruta prerenderizada; commit (~15k)

## 6. Cierre (~10k)

- [ ] 6.1 Verificar offline en dev (Network offline): historial, evolución y resumen con % funcionan sin señal; actualizar `openspec/config.yaml` y `docs/decisiones-diseno-mancuernapp.md` §6 si cambió algo (store de todas las sesiones, umbrales); `npm run check`, `npm test`, `npm run build`; commit (~4k)
- [ ] 6.2 Con OK de Joa, push a `main` y verificar el deploy de Vercel en verde; checklist en el celu de Joa (anotarla en `traspaso.md`): terminar una sesión real y ver %/indicador, abrir el historial, corregir una sesión vieja, ver la evolución desde Ajustar y desde el catálogo; commit (~6k)

## 7. Critique, accesibilidad y copy (~10k)

- [ ] 7.1 `design-critique` + `accessibility-review` + `ux-copy` sobre resumen, historial y evolución (contraste del gráfico y del indicador, touch targets ≥ 48 px, `aria-label` del gráfico, textos de estados vacíos); aplicar lo que Joa apruebe; verificar en dev a 390 px; commit (~10k)

## Workflow follow-up

- Archivar el change con `/opsx:archive` cuando Joa dé por cerrado el MVP 3 y verificar `openspec validate --specs`.
