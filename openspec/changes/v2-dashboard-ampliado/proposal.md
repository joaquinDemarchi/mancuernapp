# Proposal

## Why

Hoy Joa ve su progreso de a una sesión (% vs la vez anterior) o de a un ejercicio (`/evolucion`), pero no tiene una vista de conjunto: cuánto entrenó por semana, si viene siendo constante, cuáles son sus mejores marcas y qué ejercicios avanzan o se estancaron. Era lo que intentaba el Dashboard del Excel (roto por fórmulas corridas) y es el ítem de v2 elegido después del timer.

## What Changes

- Pantalla nueva **`/resumen`** ("Resumen"), con un acceso desde el inicio. El inicio no cambia de forma (sigue priorizando cargar rápido).
- **Selector de período**: Rutina activa (default; desde su inicio), 3 meses y Todo. Todos los bloques usan el período elegido, salvo la racha.
- **Volumen por semana**: gráfico de barras con el volumen total (solo tipo peso) de cada semana del período, semanas sin sesiones en 0.
- **Sesiones por semana y racha**: cuántas sesiones hubo cada semana y la racha actual de semanas seguidas con al menos una sesión.
- **Mejores marcas**: por ejercicio, el mejor valor del período con su fecha (peso: mayor kg y mayor volumen de una vez; reps: más reps en una serie; tiempo: más segundos; cardio: más minutos). Calentamiento no tiene marca.
- **Progreso por ejercicio**: para cada ejercicio de peso hecho al menos 2 veces en el período, % del volumen de la última vez vs la primera, con indicador; tocarlo abre su evolución.
- Todo se calcula en el cliente desde el store de sesiones (anda offline); nada nuevo en Firestore.

**Decisiones de Joa (04/11/2026):** los cuatro bloques (volumen por semana, sesiones por semana, mejores marcas, progreso por ejercicio); pantalla nueva, no el inicio; selector de período en vez de un rango fijo; los ejercicios que no son de peso entran en sesiones y mejores marcas (volumen y % siguen siendo solo de peso).

**Fuera de alcance:** 1RM estimado y aviso de récord durante la sesión (sigue en v2 aparte); volumen por grupo muscular (pediría un campo nuevo en el catálogo); exportar o compartir el resumen (imagen, PDF); objetivos o metas semanales; comparar dos períodos entre sí; períodos a medida (fechas elegidas a mano); guardar métricas en Firestore; cambios en el inicio más allá del acceso.

## Capabilities

### New Capabilities
- `resumen`: pantalla de resumen con selector de período, volumen y sesiones por semana, racha, mejores marcas y progreso por ejercicio.

### Modified Capabilities
- `metricas`: la evolución de un ejercicio también se abre desde el progreso del resumen.

## Impact

- Código: funciones puras nuevas en `src/lib/calculos.ts` (semana de una fecha, filtro por período, volumen/sesiones por semana, racha, mejores marcas, progreso) con tests; ruta nueva `src/routes/resumen/+page.svelte`; un gráfico de barras (componente nuevo o reutilizando el estilo de `GraficoEvolucion.svelte`); el enlace en `src/routes/+page.svelte`.
- Sin dependencias nuevas ni cambios de datos, reglas de Firestore ni CSV.
