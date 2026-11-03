# Traspaso — mvp-4-import-export-archivo

## Dónde quedó

- 02/11/2026: propuesta creada (proposal, specs `import-export`, deltas de `rutina` e `historial`, design, tasks). Decisiones de Joa antes de proponer: solo CSV; el import trae rutina y sesiones viejas; la nueva rutina arranca copiando la anterior; las archivadas se ven en el historial.
- 02/11/2026: 1.1 hecha. Mockups en el canvas https://claude.ai/artifact/68rdozFVjMZ2SRW6vSFFhw (privado, tokens Pizarra, 390 px, oscuro): 1A pantalla «Importar y exportar» / 1B hoja desde «Ver rutina» (botón «Datos»); revisión 2A todo a la vista / 2B solo lo que hay que decidir, más errores por fila y con rutina activa A (radios en la revisión) / B (hoja al tocar «Importar»); terminar 3A hoja / 3B «tocá de nuevo»; inicio sin activa A centrado / B tarjeta; historial 4A archivadas desplegadas / 4B plegadas, confirmación de «Volver a esta rutina»; sesión archivada A lista sin controles / B como el resumen con %.
- Próxima tarea: 1.2 (handoff a design.md §7 con lo que elija Joa).

## Gotchas

- Supuestos sin confirmar con Joa (revisar en el mockup): "Volver a esta rutina" vive en el grupo de la archivada en el historial (no hay pantalla de Ajustes); con rutina activa, importar una rutina sin fechas ofrece terminar la activa o guardarla archivada; las sesiones de rutinas archivadas no se editan.
- Copiar la rutina genera ids de día nuevos: las sesiones viejas quedan en los ids viejos (semana N y rotación arrancan de cero).
- Al pasar `rutinaActiva` a derivada de `rutinas`, revisar `crearRutina` y todo lo que usa `rutinaActiva === undefined` / `null` (carga vs sin rutina).
- Trucos de verificación con stores falsos: `openspec/changes/archive/2026-11-02-mvp-3-metricas-historial/traspaso.md` (`localStorage.__setup` en el Browser pane; habrá que sumar `rutinas`).
- `npm run dev` bloquea mover carpetas en `openspec/changes` (Windows): parar el server antes de archivar.
