# Proposal

## Why

El flujo de carga (§5 de `docs/decisiones-diseno-mancuernapp.md`) es la pantalla crítica de la app y todavía nadie la tocó con el pulgar en el gym. Antes de construir `mvp-2-carga-sesion` (~25k, con Firestore y offline) conviene probar en el celu un prototipo descartable y decidir lo que §5 deja abierto, sobre todo cómo se ajusta un ejercicio.

## What Changes

- Ruta descartable `/prototipo` con datos falsos en memoria (una rutina de 3 días con los 5 tipos de ejercicio y una "última vez" inventada). No lee ni escribe Firestore y no pide login.
- "Hoy: Día X" con el día sugerido por la rotación y cambiable con un toque.
- Lista del día con los valores de la última vez en gris; ✓ = igual que la última vez.
- "Ajustar" con `−/+` (reps ±1, kg con el salto del ejercicio, segundos ±5, minutos) y teclado numérico al tocar el número, en dos variantes para comparar: **A** la fila se expande en el lugar; **B** se abre una hoja abajo.
- "Terminar sesión" → resumen con volumen, % vs la vez anterior e indicador Bajo/Óptimo/Alto (umbrales de §6).
- Contador de toques en pantalla para medir los ≈6 / ≈15 toques del objetivo.

**Fuera de alcance:** guardar en Firestore u offline, "+ bloque" y desarmar en series, RPE, ejercicio extra, editar o borrar sesiones, historial y gráfico. El prototipo se borra al arrancar `mvp-2-carga-sesion`; no deja specs.

## Impact

- `src/routes/prototipo/` (nuevo, descartable) y una excepción de login para esa ruta en `src/routes/+layout.svelte`.
- Las decisiones de Joa quedan en `traspaso.md` como input del MVP 2.
