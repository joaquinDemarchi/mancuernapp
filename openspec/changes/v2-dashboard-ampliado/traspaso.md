# Traspaso — v2-dashboard-ampliado

## Dónde quedó

- 04/11/2026: propuesta creada (proposal, spec nueva `resumen`, delta de `metricas`, design, tasks). Decisiones de Joa antes de proponer: los cuatro bloques (volumen por semana, sesiones por semana + racha, mejores marcas, progreso por ejercicio); pantalla nueva `/resumen` (el inicio solo suma un enlace); selector de período Rutina activa / 3 meses / Todo; fuera 1RM y aviso de récords, grupos musculares y exportar/compartir. No marcó "solo peso" como fuera: los no-peso entran en sesiones y mejores marcas; volumen y % siguen siendo solo de peso.
- Próxima tarea: 1.1 (mockups, sesión de diseño aparte del código).

## Gotchas

- El progreso usa el indicador Bajo/Óptimo/Alto de siempre (lo eligió Joa), pero sobre varias semanas un buen avance da "Alto": mirarlo en los mockups (design, Risks).
- `/evolucion` vuelve con `history.back()`: el período tiene que estar en la URL de `/resumen` con `replaceState` para sobrevivir la vuelta (design §6).
- Semanas de lunes a domingo con fechas locales; nunca `toISOString()` (corre un día de noche).
- La racha no depende del período; la semana en curso sin sesión no la corta.
- Trucos de verificación con stores falsos: `openspec/changes/archive/2026-11-04-mvp-4-import-export-archivo/traspaso.md` y `openspec/changes/archive/2026-11-04-v2-timer-descanso/traspaso.md` (Browser pane, forzar 390 px con `document.body.style.width`).
