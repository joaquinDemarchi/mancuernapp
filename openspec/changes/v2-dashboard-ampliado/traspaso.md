# Traspaso — v2-dashboard-ampliado

## Dónde quedó

- 04/11/2026: propuesta creada (proposal, spec nueva `resumen`, delta de `metricas`, design, tasks). Decisiones de Joa antes de proponer: los cuatro bloques (volumen por semana, sesiones por semana + racha, mejores marcas, progreso por ejercicio); pantalla nueva `/resumen` (el inicio solo suma un enlace); selector de período Rutina activa / 3 meses / Todo; fuera 1RM y aviso de récords, grupos musculares y exportar/compartir. No marcó "solo peso" como fuera: los no-peso entran en sesiones y mejores marcas; volumen y % siguen siendo solo de peso.
- 1.1 hecha (04/11/2026): mockups en el artifact Design https://claude.ai/artifact/Pm8cYCQe51qkh1nFvNNMkx (privado; fuente en el scratchpad de la sesión, no en el repo). Teléfonos de 390 px en tema oscuro, con datos de ejemplo de joa (rutina activa desde el 08/09, 9 semanas, una semana sin ir, la actual en curso):
  - **A** tarjetas apiladas: período con chips, racha y promedio en una tarjeta, barras verticales de volumen con las sesiones como número abajo, progreso (fila → evolución) y mejores marcas (con el mayor volumen como detalle).
  - **B** racha grande arriba (120 px, naranja), período como pestañas subrayadas, barras con un punto por sesión, y Progreso / Mejores marcas en pestañas (interactivo).
  - **C** chips + dos tiles (racha, sesiones totales y promedio), semanas en filas con barra horizontal, kg y sesiones (la más nueva arriba: si gana, la spec "Volumen por semana" cambia el orden), y una sola lista "Ejercicios" que junta marca y %.
  - Tablero "Todo (un año)": **1** una barra por semana (52, finas) vs **2** una barra por mes solo con "Todo" (para design §7).
  - Tablero "Enlace y período vacío": enlace en el inicio como **1** link sutil junto a los de siempre o **2** fila propia debajo de la última sesión; y el estado vacío (la racha se sigue viendo).
- 1.2 hecha (04/11/2026): Joa eligió **A** ("a"; tomé también lo del botón propuesto: barras por semana con "Todo" y enlace 1, link sutil en el inicio). Handoff en design.md §7 (barras con `div`, modo angosto con > 13 semanas) y §8 (pantalla por pantalla). Specs sin cambios; `openspec validate v2-dashboard-ampliado --strict` OK.
- Próxima tarea: 2.1 (cálculos, en una sesión de código aparte).

## Gotchas

- El progreso usa el indicador Bajo/Óptimo/Alto de siempre (lo eligió Joa), pero sobre varias semanas un buen avance da "Alto": mirarlo en los mockups (design, Risks).
- `/evolucion` vuelve con `history.back()`: el período tiene que estar en la URL de `/resumen` con `replaceState` para sobrevivir la vuelta (design §6).
- Semanas de lunes a domingo con fechas locales; nunca `toISOString()` (corre un día de noche).
- La racha no depende del período; la semana en curso sin sesión no la corta.
- Trucos de verificación con stores falsos: `openspec/changes/archive/2026-11-04-mvp-4-import-export-archivo/traspaso.md` y `openspec/changes/archive/2026-11-04-v2-timer-descanso/traspaso.md` (Browser pane, forzar 390 px con `document.body.style.width`).
