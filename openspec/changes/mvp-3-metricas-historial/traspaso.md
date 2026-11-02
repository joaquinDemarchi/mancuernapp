# Traspaso — mvp-3-metricas-historial

## Dónde quedó

- 02/11/2026: propuesta creada (proposal, specs `metricas`, `historial`, delta de `sesion`, design, tasks) y aprobada por Joa.
- 1.1 hecha: mockups en https://claude.ai/artifact/XiB3ejhR2npTZwMc6bwcLs (privado). Tres filas: al terminar (Resumen A/B, primera vez, % opcional en la sesión), historial (Inicio A/B, Lista A/B, vacío) y evolución (A volumen / B kg máximo, "Ver evolución" en Ajustar).
- 1.2 hecha: Joa eligió resumen A con "Por ejercicio" plegado, sin % en la lista de la sesión, inicio B (fila de la última sesión), lista B (agrupada por día) y evolución A (volumen). Handoff en design.md §6; specs `historial` y `sesion` ajustadas.
- Próxima tarea: 2.1 (cálculos), en una sesión de código aparte.

## Gotchas

- Trucos de verificación (stores falsos en el Browser pane a 390 px, Vite que sirve CSS viejo): `openspec/changes/archive/2026-11-02-mvp-2-carga-sesion/traspaso.md`.
- El canvas usa clases propias en `project/mvp3.css` (`.ej`, `.hist`, `.graf`, `.ma-ind--s`, `.sutil`) sobre `mvp1.css`/`mvp2.css` copiados del canvas del MVP 2: referencia visual; en la app cada componente lleva sus estilos con tokens.
- Los datos del canvas son de ejemplo (la "rutina anterior" del gráfico no existe en Firestore).
- Al leer todas las sesiones (tarea 2.2), revisar cada uso de `sesiones` que asumía "solo la rutina activa".
