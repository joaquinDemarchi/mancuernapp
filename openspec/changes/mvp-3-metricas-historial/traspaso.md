# Traspaso — mvp-3-metricas-historial

## Dónde quedó

- 02/11/2026: propuesta creada (proposal, specs `metricas`, `historial`, delta de `sesion`, design, tasks) y aprobada por Joa.
- 1.1 hecha: mockups en https://claude.ai/artifact/XiB3ejhR2npTZwMc6bwcLs (privado). Tres filas: al terminar (Resumen A/B, primera vez, % opcional en la sesión), historial (Inicio A/B, Lista A/B, vacío) y evolución (A volumen / B kg máximo, "Ver evolución" en Ajustar).
- 1.2 hecha: Joa eligió resumen A con "Por ejercicio" plegado, sin % en la lista de la sesión, inicio B (fila de la última sesión), lista B (agrupada por día) y evolución A (volumen). Handoff en design.md §6; specs `historial` y `sesion` ajustadas.
- 2.1 hecha: `volumenEjercicio`, `anterior`, `crecimiento`, `UMBRALES`/`indicador`, `formatearPct` y `evolucion` en `calculos.ts`, con tests. `evolucion(sesiones, id, tipo)` recibe el tipo (volumen solo si es peso) y cada vez trae también `rutinaId` (para marcar el cambio de rutina en el gráfico).
- 2.2 hecha: el store `sesiones` lee toda la colección mientras haya sesión (como `rutina.ts`), sin `where`. `sesionDeHoy(sesiones, fecha, rutinaId?)` y `diaSugerido(rutina con id, …)` filtran por rutina; el inicio (`deHoy`, `ultima`, `yaCargada`), `/sesion` y `escribir` pasan la rutina activa. `ultimaVez` y `semana` no cambian (filtran por `diaId`, que es único por rutina; los extras cruzan rutinas a propósito). Verificado en el Browser pane a 390 px con stores falsos y sesiones de otra rutina (también una de hoy): tarjeta Hoy, rotación y "Seguir Día 2" iguales. No probado con el Firestore real de Joa (el pane no tiene su login): revisar en el checklist del 6.2.
- 3.1 hecha: `Indicador.svelte` (`pct`, `chico`, `conPct`; calcula el nivel con `indicador`) y el resumen de `/sesion` con "● Óptimo · +3 %" + "vs 3.500 kg el 29/10", "Primera vez de Día X…" y "Por ejercicio" plegado (`aria-expanded`) con % e indicador chico o "primera vez". Si hay sesión anterior pero con volumen 0, no muestra ni % ni el texto de primera vez. Verificado a 390 px con stores falsos (con anterior, por ejercicio plegado/abierto, primera vez).
- 4.1 hecha: `/historial` agrupado por día de la rutina activa (más nueva arriba), "Otros días" al final y estado vacío; fila de la última sesión de la rutina activa en el inicio (incluye la de hoy si existe). Las filas abren `/sesion?dia=&fecha=&desde=historial`; con `desde=historial`, volver, "Borrar" y "Listo" van a `/historial` (con `goto`, no `history.back()`). Las filas de "Otros días" no son links: `/sesion` resuelve el día con la rutina activa y abriría otra cosa (decidir en MVP 4). Verificado a 390 px con stores falsos: última sesión, sin sesiones, orden, fila, corregir un kg (42,5 → 45 y el historial pasa a 3.600 kg, +11 % Alto), borrar una vieja e historial vacío. Las escrituras de prueba fueron con el uid falso (solo caché local del pane).
- Próxima tarea: 5.1 (evolución).

## Gotchas

- Verificación con stores falsos: el script de datos (rutina r1 con 3 días, sesiones de otra rutina r0 y una de hoy) quedó en `localStorage.__setup` del Browser pane; después de cada recarga: `await eval(localStorage.__setup)` en `/` (deja `window.__s` = módulo `sesion.ts`). Cada Edit de un `.svelte` suele recargar la página entera y se pierden los stores.

- Trucos de verificación (stores falsos en el Browser pane a 390 px, Vite que sirve CSS viejo): `openspec/changes/archive/2026-11-02-mvp-2-carga-sesion/traspaso.md`.
- El canvas usa clases propias en `project/mvp3.css` (`.ej`, `.hist`, `.graf`, `.ma-ind--s`, `.sutil`) sobre `mvp1.css`/`mvp2.css` copiados del canvas del MVP 2: referencia visual; en la app cada componente lleva sus estilos con tokens.
- Los datos del canvas son de ejemplo (la "rutina anterior" del gráfico no existe en Firestore).
- Al leer todas las sesiones (tarea 2.2), revisar cada uso de `sesiones` que asumía "solo la rutina activa".
