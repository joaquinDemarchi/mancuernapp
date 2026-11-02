# Proposal

## Why

Desde el MVP 2 Joa carga cada sesión en el gym, pero la app todavía no le devuelve nada de esos datos: solo el volumen al terminar. Lo que el Excel prometía y nunca funcionó (crecimiento vs la vez anterior, indicador de sobrecarga, gráficos, historial) es lo que hace que valga la pena cargar; ahora que hay datos reales, toca mostrarlos.

## What Changes

- Resumen de "Terminar sesión": además del volumen, % vs la vez anterior de ese día e indicador de sobrecarga (Bajo / Óptimo / Alto, con forma y palabra); el % e indicador de cada ejercicio de peso, plegados detrás de "Por ejercicio".
- Historial (`/historial`), al que se llega desde una fila con la última sesión bajo la tarjeta Hoy: sesiones agrupadas por día de la rutina, de la más nueva a la más vieja, con fecha, semana, volumen e indicador; tocar una la abre en la pantalla de sesión para verla, editarla o borrarla.
- Evolución por ejercicio (`/evolucion?id=`): gráfico del volumen de cada vez que se hizo, cruzando rutinas gracias al catálogo, y la lista de esas veces. Se abre desde la ficha del ejercicio en el catálogo y desde Ajustar.
- Umbrales del indicador fijos en una constante (Bajo < 0 %, Óptimo 0–10 %, Alto > 10 %).
- El store de sesiones pasa a leer todas las sesiones del usuario (no solo las de la rutina activa), para que historial y gráfico crucen rutinas.

**Elegido por Joa en el mockup** (design.md §6): resumen A con el detalle plegado, sin % en la lista de la sesión, inicio B, historial agrupado por día y gráfico de volumen.

**Fuera de alcance:** archivar rutina, ver rutinas archivadas y nueva rutina, import/export (MVP 4); gráfico para ejercicios que no son de peso (reps, tiempo, cardio: solo la lista de veces); umbrales configurables, sugerir progresión, 1RM/récords, dashboard ampliado (v2); filtros o búsqueda en el historial; comparar sesiones de distinto día.

## Capabilities

### New Capabilities
- `metricas`: volumen por ejercicio y sesión, % vs la vez anterior, indicador de sobrecarga y evolución por ejercicio con gráfico.
- `historial`: lista de sesiones pasadas y acceso a cada una para verla, editarla o borrarla.

### Modified Capabilities
- `sesion`: "Terminar con volumen" suma % e indicador; "Sesión de hoy editable y borrable" permite abrir sesiones anteriores también desde el historial.

## Impact

- Código: `src/lib/calculos.ts` suma funciones puras (volumen por ejercicio, vez anterior, crecimiento, indicador, puntos del gráfico) con tests; `src/lib/sesion.ts` lee todas las sesiones del usuario; rutas nuevas `/historial` y `/evolucion`; resumen de `/sesion`, inicio, ficha de ejercicio y `HojaAjustar` con accesos nuevos; componente nuevo de indicador y gráfico SVG propio (sin dependencias).
- Firestore: sin cambios de modelo ni de reglas (todo se calcula en el cliente).
- Diseño: mockups nuevos en un Artifact Design antes del código; tokens `--bajo`, `--optimo`, `--alto` ya existen en `design/tokens.css`.
