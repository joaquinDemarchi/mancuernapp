# Traspaso — mvp-3-metricas-historial

## Dónde quedó

- 02/11/2026: propuesta creada (proposal, specs `metricas`, `historial`, delta de `sesion`, design, tasks) y aprobada por Joa.
- 1.1 hecha: mockups en https://claude.ai/artifact/XiB3ejhR2npTZwMc6bwcLs (privado). Tres filas: al terminar (Resumen A/B, primera vez, % opcional en la sesión), historial (Inicio A/B, Lista A/B, vacío) y evolución (A volumen / B kg máximo, "Ver evolución" en Ajustar).
- Próxima tarea: 1.2 (handoff a design.md §6) cuando Joa elija.

## Decisiones pendientes con Joa (en el mockup)

- Dónde va "Historial" en el inicio y cómo se ve cada fila.
- Gráfico de volumen (propuesto) o de kg máximo.
- % e indicador por ejercicio: solo en el resumen o también en la pantalla de sesión.

## Gotchas

- Trucos de verificación (stores falsos en el Browser pane a 390 px, Vite que sirve CSS viejo): `openspec/changes/archive/2026-11-02-mvp-2-carga-sesion/traspaso.md`.
- El canvas usa clases propias en `project/mvp3.css` (`.ej`, `.hist`, `.graf`, `.ma-ind--s`, `.sutil`) sobre `mvp1.css`/`mvp2.css` copiados del canvas del MVP 2: referencia visual; en la app cada componente lleva sus estilos con tokens.
- Los datos del canvas son de ejemplo (la "rutina anterior" del gráfico no existe en Firestore).
- Al leer todas las sesiones (tarea 2.2), revisar cada uso de `sesiones` que asumía "solo la rutina activa".
