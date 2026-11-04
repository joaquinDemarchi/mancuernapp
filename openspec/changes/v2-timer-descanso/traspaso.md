# Traspaso — v2-timer-descanso

## Dónde quedó

- 04/11/2026: propuesta creada (proposal, specs `descanso` nueva, deltas de `catalogo-ejercicios` e `import-export`, design, tasks). Decisiones de Joa antes de proponer: descanso por ejercicio y opcional (vacío = sin timer); arranca solo al marcar hecho y se puede saltar; pantalla prendida en vez de notificaciones.
- 1.1 hecha (04/11/2026): mockups en el artifact Design https://claude.ai/artifact/UXk1kejcsFnzjhfpgcvsQK (privado; fuente en el scratchpad de la sesión, no en el repo). Cada tablero muestra dos celulares 390 px en oscuro:
  - Timer en `/sesion` (corriendo y terminó): **A** franja en la barra de abajo, arriba de "Terminar sesión" (M:SS 40 px, −15 s / +15 s / Saltar); **B** fila debajo del ejercicio recién marcado; **C** tarjeta grande flotante sobre la barra (M:SS 96 px, barra de progreso, −15 s / +15 s de 56 px). "Terminó" en las tres: fondo `ink` con texto `ground` ("Terminó el descanso", "Cerrar"), sin naranja.
  - Campo descanso en `/ejercicio` (vacío y con valor), después de los saltos: **1** stepper de 15 s ("–" = sin timer, link "Sin descanso" para vaciar); **2** chips (Sin descanso, 0:45, 1:00, 1:30, 2:00, 3:00) + stepper para afinar cuando hay valor.
- Próxima tarea: 1.2, cuando Joa elija variante de timer (A/B/C) y de campo (1/2).

## Gotchas

- Supuesto sin confirmar con Joa: "Guardar" en Ajustar también arranca el timer (el ✓ de un ejercicio sin última vez abre Ajustar).
- El timer guarda la hora de fin (`Date.now()` + descanso), no un contador: con la pantalla apagada los intervalos se frenan.
- Archivos CSV de 10 columnas (exportados antes) tienen que seguir importándose.
- Trucos de verificación con stores falsos: `openspec/changes/archive/2026-11-04-mvp-4-import-export-archivo/traspaso.md` (`localStorage.__setup` y `__importHelpers` en el Browser pane, que puede no emular 390 px: forzar el ancho con `document.body.style.width`).
