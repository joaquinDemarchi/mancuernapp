# Traspaso — mvp-3-metricas-historial

## Dónde quedó

- 02/11/2026: propuesta creada (proposal, specs `metricas`, `historial`, delta de `sesion`, design, tasks) y aprobada por Joa.
- 1.1 hecha: mockups en https://claude.ai/artifact/XiB3ejhR2npTZwMc6bwcLs (privado). Tres filas: al terminar (Resumen A/B, primera vez, % opcional en la sesión), historial (Inicio A/B, Lista A/B, vacío) y evolución (A volumen / B kg máximo, "Ver evolución" en Ajustar).
- 1.2 hecha: Joa eligió resumen A con "Por ejercicio" plegado, sin % en la lista de la sesión, inicio B (fila de la última sesión), lista B (agrupada por día) y evolución A (volumen). Handoff en design.md §6; specs `historial` y `sesion` ajustadas.
- 2.1 hecha: `volumenEjercicio`, `anterior`, `crecimiento`, `UMBRALES`/`indicador`, `formatearPct` y `evolucion` en `calculos.ts`, con tests. `evolucion(sesiones, id, tipo)` recibe el tipo (volumen solo si es peso) y cada vez trae también `rutinaId` (para marcar el cambio de rutina en el gráfico).
- 2.2 hecha: el store `sesiones` lee toda la colección mientras haya sesión (como `rutina.ts`), sin `where`. `sesionDeHoy(sesiones, fecha, rutinaId?)` y `diaSugerido(rutina con id, …)` filtran por rutina; el inicio (`deHoy`, `ultima`, `yaCargada`), `/sesion` y `escribir` pasan la rutina activa. `ultimaVez` y `semana` no cambian (filtran por `diaId`, que es único por rutina; los extras cruzan rutinas a propósito). Verificado en el Browser pane a 390 px con stores falsos y sesiones de otra rutina (también una de hoy): tarjeta Hoy, rotación y "Seguir Día 2" iguales. No probado con el Firestore real de Joa (el pane no tiene su login): revisar en el checklist del 6.2.
- 3.1 hecha: `Indicador.svelte` (`pct`, `chico`, `conPct`; calcula el nivel con `indicador`) y el resumen de `/sesion` con "● Óptimo · +3 %" + "vs 3.500 kg el 29/10", "Primera vez de Día X…" y "Por ejercicio" plegado (`aria-expanded`) con % e indicador chico o "primera vez". Si hay sesión anterior pero con volumen 0, no muestra ni % ni el texto de primera vez. Verificado a 390 px con stores falsos (con anterior, por ejercicio plegado/abierto, primera vez).
- 4.1 hecha: `/historial` agrupado por día de la rutina activa (más nueva arriba), "Otros días" al final y estado vacío; fila de la última sesión de la rutina activa en el inicio (incluye la de hoy si existe). Las filas abren `/sesion?dia=&fecha=&desde=historial`; con `desde=historial`, volver, "Borrar" y "Listo" van a `/historial` (con `goto`, no `history.back()`). Las filas de "Otros días" no son links: `/sesion` resuelve el día con la rutina activa y abriría otra cosa (decidir en MVP 4). Verificado a 390 px con stores falsos: última sesión, sin sesiones, orden, fila, corregir un kg (42,5 → 45 y el historial pasa a 3.600 kg, +11 % Alto), borrar una vieja e historial vacío. Las escrituras de prueba fueron con el uid falso (solo caché local del pane).
- 5.1 hecha: `GraficoEvolucion.svelte` (SVG con viewBox 320×140, puntos equiespaciados, línea punteada y nombre al cambiar de rutina, `role="img"` con `aria-label`) y `/evolucion?id=` (gráfico solo para peso, "Cada vez" de la más nueva a la más vieja). "Ver evolución" (`.texto.sutil`) en la ficha (`Cabecera` con `accion`) y en `HojaAjustar` (nuevo snippet `accion` en `Hoja`). La flecha de `/evolucion` vuelve con `history.back()` (prop `atras` de `Cabecera`; entrando directo, a `/ejercicios`). Solo la rutina activa está en memoria: las otras se muestran como "Otra rutina" (día y marca del gráfico); MVP 4 tendrá los nombres. Verificado con stores falsos a 390 y 360 px: cruzando rutinas (7 puntos), una sola vez (un punto, sin línea), Plancha (tiempo, sin gráfico), desde Ajustar vuelve a la sesión, desde la ficha; `npm run build` con `evolucion.html` e `historial.html` prerenderizadas.
- Gotcha: la ficha `/ejercicio?id=` lee el id una sola vez; navegar de una ficha a otra sin pasar por otra ruta no la remonta (en `/evolucion` el id es `$derived`).
- 6.1 hecha: historial, evolución y resumen salen del store en memoria; recorriéndolos en dev con stores falsos no hubo pedidos de red nuevos (solo el canal de escucha ya abierto y el `updateDoc` de "Terminar", que es de MVP 2 y no espera respuesta). No se pudo cortar la red del Browser pane: el modo avión real va en el checklist del 6.2. `config.yaml` y `docs/decisiones-diseno-mancuernapp.md` §6 anotan el store con todas las sesiones y `UMBRALES`. check, test y build en verde.
- 6.2 en curso: pusheado con OK de Joa (02/11, cd4a649); deploy de Vercel en verde y `/historial` y `/evolucion` responden 200 en https://mancuernapp.vercel.app. Falta que Joa haga el checklist en el celu (abajo); con eso, marcar 6.2 y seguir con el grupo 7.
- 7.1 hecha (02/11): critique + accesibilidad + copy. Contraste y touch targets ya pasaban (indicador 4,6–8,1:1 en ambos temas, filas 64 px, botones 48 px). Joa aprobó los 7 hallazgos: "0 %" sin signo cuando redondea a 0; la fila "Última" del inicio muestra la última sesión antes de hoy (la de hoy ya está en la tarjeta; spec `historial` ajustada); `/evolucion` con título "Ejercicio" de respaldo y "sin cargar todavía"; sin línea de base en el gráfico; "Por ejercicio" con `aria-controls`; el nombre de rutina en el gráfico se omite si el cambio anterior está a < 90 unidades; "Otros días" del historial con la nota "solo para ver". Verificado a 390 px con stores falsos. Sin pushear.
- 6.2 hecha: push de 7.1 con OK de Joa (02/11, 6d98a07), deploy de Vercel OK; Joa hizo el checklist en el celu y dio el MVP 3 por cerrado. Se archiva.
- Decisión de Joa: "Cargar un día anterior" sigue limitado a fechas desde el inicio de la rutina activa (no se edita el "desde" ni se saca el límite).

## Checklist en el celu (6.2)
Recargar o reinstalar la PWA para tomar el service worker nuevo.
- [x] La tarjeta Hoy sugiere el mismo día que antes y "Seguir/Ver sesión" funciona (store con todas las sesiones).
- [x] Terminar una sesión real: volumen, % e indicador vs la vez anterior; "Por ejercicio" abre el detalle.
- [x] Fila "Última: Día X" bajo la tarjeta Hoy abre el historial.
- [x] Historial: grupos por día, de la más nueva a la más vieja.
- [x] Corregir un kg de una sesión vieja desde el historial y ver el volumen nuevo al volver.
- [x] Ver evolución desde Ajustar (vuelve a la sesión) y desde la ficha del catálogo.
- [x] Modo avión: abrir historial, evolución y terminar una sesión; todo se ve sin señal.

## Gotchas

- Verificación con stores falsos: el script de datos (rutina r1 con 3 días, sesiones de otra rutina r0 y una de hoy) quedó en `localStorage.__setup` del Browser pane; después de cada recarga: `await eval(localStorage.__setup)` en `/` (deja `window.__s` = módulo `sesion.ts`). Cada Edit de un `.svelte` suele recargar la página entera y se pierden los stores.

- Trucos de verificación (stores falsos en el Browser pane a 390 px, Vite que sirve CSS viejo): `openspec/changes/archive/2026-11-02-mvp-2-carga-sesion/traspaso.md`.
- El canvas usa clases propias en `project/mvp3.css` (`.ej`, `.hist`, `.graf`, `.ma-ind--s`, `.sutil`) sobre `mvp1.css`/`mvp2.css` copiados del canvas del MVP 2: referencia visual; en la app cada componente lleva sus estilos con tokens.
- Los datos del canvas son de ejemplo (la "rutina anterior" del gráfico no existe en Firestore).
- Al leer todas las sesiones (tarea 2.2), revisar cada uso de `sesiones` que asumía "solo la rutina activa".
