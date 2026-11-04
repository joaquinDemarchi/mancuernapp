# Tasks

> Cada tarea: commit local + `[x]` acá + actualizar `traspaso.md`. Costo estimado entre paréntesis.
> Total estimado: ~48k tokens (6 grupos). Push y deploy solo con OK de Joa. Diseño en una sesión aparte del código (grupo 1).

## 1. Diseño (sesión de diseño, ~11k)

- [x] 1.1 Mockups en un Artifact Design (tokens de `design/tokens.css`, 390 px, tema oscuro) con 2–3 variantes numeradas de: el timer en `/sesion` (corriendo, con ±15 s y "Saltar", y "terminó") y el campo descanso en la ficha `/ejercicio` (vacío y con valor); verificar que Joa tiene el link; commit del link en `traspaso.md` (~8k)
- [x] 1.2 Con la elección de Joa, handoff a design.md §6 (pantalla por pantalla, textos y tokens); si cambia algo de las specs, actualizar los deltas y verificar `openspec validate v2-timer-descanso --strict`; commit (~3k)

## 2. Descanso en el catálogo (~5k)

- [x] 2.1 `descanso?` en `DatosEjercicio` y el campo en `/ejercicio` según §6 (chips + `Stepper` que muestre M:SS; vacío borra la clave); `formatearDescanso` y `restante` en `src/lib/descanso.ts` con tests; verificar `npm test`, `npm run check` y en dev con stores falsos crear y editar un ejercicio con y sin descanso; commit (~5k)

## 3. Timer en la sesión (~12k)

- [x] 3.1 Timer en `/sesion` según §2 y §6: botón flotante con la duración sugerida (descanso del primer ejercicio sin hacer, última usada o 1:30), mini timer con ±15 s y "Saltar", "terminó" con vibración y "Otra vez", Wake Lock (pedir, soltar y volver a pedir al volver a la pestaña), `padding-bottom` del `main` y corte al salir; verificar en dev a 390 px con stores falsos "Descanso del próximo ejercicio", "Próximo sin descanso", "Marcar no lo toca", "Ajustar", "Saltar", "Otra vez" y "Volver a la app" (fin calculado con el reloj); commit (~12k)

## 4. CSV con Descanso (~7k)

- [x] 4.1 `Descanso` en `columnas`, `validar` (10 u 11 columnas, entero 15–300), `planImport`, `armarImport`, `escribirCsv` y la plantilla; tests: archivo sin la columna, descanso de un ejercicio nuevo, existente conserva el suyo, ida y vuelta con descanso; verificar `npm test` y `npm run check`; commit (~7k)

## 5. Cierre (~7k)

- [x] 5.1 Verificar offline y que sin `wakeLock`/`vibrate` el timer anda igual; actualizar `openspec/config.yaml` y `docs/decisiones-diseno-mancuernapp.md` si cambió algo; `npm run check`, `npm test`, `npm run build`; commit (~4k)
- [ ] 5.2 Con OK de Joa, push a `main` y verificar el deploy de Vercel en verde; checklist en el celu de Joa (anotarla en `traspaso.md`): poner descanso a un ejercicio, abrir el timer en la sesión entre series, ajustar, dejar que termine con la pantalla sin tocar (no se apaga, vibra si el celu puede), "Otra vez", saltar otro; commit (~3k)

## 6. Critique, accesibilidad y copy (~6k)

- [x] 6.1 `design-critique` + `accessibility-review` + `ux-copy` sobre el timer y el campo descanso (tiempo anunciado sin saturar al lector de pantalla, touch targets ≥ 48 px, contraste); aplicar lo que Joa apruebe; verificar en dev; commit (~6k)

## Workflow follow-up

- Archivar el change con `/opsx:archive` cuando Joa dé por cerrado el timer y verificar `openspec validate --specs`.
