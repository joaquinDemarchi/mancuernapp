# Traspaso — mvp-4-import-export-archivo

## Dónde quedó

- 02/11/2026: propuesta creada (proposal, specs `import-export`, deltas de `rutina` e `historial`, design, tasks). Decisiones de Joa antes de proponer: solo CSV; el import trae rutina y sesiones viejas; la nueva rutina arranca copiando la anterior; las archivadas se ven en el historial.
- Próxima tarea: 1.1 (mockups), en una sesión de diseño aparte.

## Gotchas

- Supuestos sin confirmar con Joa (revisar en el mockup): "Volver a esta rutina" vive en el grupo de la archivada en el historial (no hay pantalla de Ajustes); con rutina activa, importar una rutina sin fechas ofrece terminar la activa o guardarla archivada; las sesiones de rutinas archivadas no se editan.
- Copiar la rutina genera ids de día nuevos: las sesiones viejas quedan en los ids viejos (semana N y rotación arrancan de cero).
- Al pasar `rutinaActiva` a derivada de `rutinas`, revisar `crearRutina` y todo lo que usa `rutinaActiva === undefined` / `null` (carga vs sin rutina).
- Trucos de verificación con stores falsos: `openspec/changes/archive/2026-11-02-mvp-3-metricas-historial/traspaso.md` (`localStorage.__setup` en el Browser pane; habrá que sumar `rutinas`).
- `npm run dev` bloquea mover carpetas en `openspec/changes` (Windows): parar el server antes de archivar.
