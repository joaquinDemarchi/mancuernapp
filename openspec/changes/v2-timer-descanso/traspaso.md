# Traspaso — v2-timer-descanso

## Dónde quedó

- 04/11/2026: propuesta creada (proposal, specs `descanso` nueva, deltas de `catalogo-ejercicios` e `import-export`, design, tasks). Decisiones de Joa antes de proponer: descanso por ejercicio y opcional (vacío = sin timer); arranca solo al marcar hecho y se puede saltar; pantalla prendida en vez de notificaciones.
- Próxima tarea: 1.1 (sesión de diseño aparte).

## Gotchas

- Supuesto sin confirmar con Joa: "Guardar" en Ajustar también arranca el timer (el ✓ de un ejercicio sin última vez abre Ajustar).
- El timer guarda la hora de fin (`Date.now()` + descanso), no un contador: con la pantalla apagada los intervalos se frenan.
- Archivos CSV de 10 columnas (exportados antes) tienen que seguir importándose.
- Trucos de verificación con stores falsos: `openspec/changes/archive/2026-11-04-mvp-4-import-export-archivo/traspaso.md` (`localStorage.__setup` y `__importHelpers` en el Browser pane, que puede no emular 390 px: forzar el ancho con `document.body.style.width`).
