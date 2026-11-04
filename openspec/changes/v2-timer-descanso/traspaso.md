# Traspaso — v2-timer-descanso

## Dónde quedó

- 04/11/2026: propuesta creada (proposal, specs `descanso` nueva, deltas de `catalogo-ejercicios` e `import-export`, design, tasks). Decisiones de Joa antes de proponer: descanso por ejercicio y opcional (vacío = sin timer); arranca solo al marcar hecho y se puede saltar; pantalla prendida en vez de notificaciones.
- 1.1 hecha (04/11/2026): mockups en el artifact Design https://claude.ai/artifact/UXk1kejcsFnzjhfpgcvsQK (privado; fuente en el scratchpad de la sesión, no en el repo). Cada tablero muestra dos celulares 390 px en oscuro:
  - Timer en `/sesion` (corriendo y terminó): **A** franja en la barra de abajo, arriba de "Terminar sesión" (M:SS 40 px, −15 s / +15 s / Saltar); **B** fila debajo del ejercicio recién marcado; **C** tarjeta grande flotante sobre la barra (M:SS 96 px, barra de progreso, −15 s / +15 s de 56 px). "Terminó" en las tres: fondo `ink` con texto `ground` ("Terminó el descanso", "Cerrar"), sin naranja.
  - Campo descanso en `/ejercicio` (vacío y con valor), después de los saltos: **1** stepper de 15 s ("–" = sin timer, link "Sin descanso" para vaciar); **2** chips (Sin descanso, 0:45, 1:00, 1:30, 2:00, 3:00) + stepper para afinar cuando hay valor.
- 04/11/2026, cambio de rumbo de Joa al ver A/B/C (le gustaron A y B): quiere descansar también **entre series**, así que el timer pasa a ser un flotante que abre con un botón cuando quiere. Decisiones: **solo con el botón** (nunca arranca solo al marcar ✓); arranca con el **descanso del catálogo del primer ejercicio sin hacer** (si no tiene, el último usado), ±15 s; **solo en `/sesion`** (se corta al salir). El campo descanso del catálogo y la columna CSV siguen.
- Fila "2ª ronda" en el mismo canvas (cerrado / corriendo / terminó): **D** botón "⏱ 1:30" en la barra al lado de "Terminar sesión" + franja como A; **E** botón flotante abajo a la derecha + mini timer flotante. Las dos suman "Otra vez" al terminar (repetir el mismo descanso para la próxima serie).
- 1.2 hecha (04/11/2026): Joa eligió timer **E** (botón flotante + mini timer) y campo **2** (chips + stepper). Handoff en design.md §6; §2 reescrito (arranque solo con el botón, duración sugerida, "Otra vez"). Deltas actualizados: `descanso` ("Abrir con el botón" reemplaza "Arranque al marcar hecho"; escenario "Otra vez") y escenarios de `catalogo-ejercicios`. Proposal y tareas 2.1, 3.1 y 5.2 al día. `openspec validate v2-timer-descanso --strict` OK.
- 2.1 hecha (04/11/2026): `DatosEjercicio.descanso?` (segundos); `guardarEjercicio` manda `deleteField()` si no hay descanso y `/ejercicio` no pone la clave al crear sin descanso. `src/lib/descanso.ts` con `restante(fin, ahora)` y `formatearDescanso` (tests). `Stepper` suma `formatear` (muestra M:SS; acepta escribir "1:15") y `sinEtiqueta` (etiqueta visualmente oculta). Campo con `OpcionesChip` y binding getter/setter (valores en texto, "" = sin descanso); al guardar se redondea a múltiplo de 15 (15–300). Verificado en dev con stores falsos (ancho 390 px forzado): ficha nueva con "Sin descanso" marcado, Remo con 1:15 sin chip marcado, + → 1:30 marca el chip, "Sin descanso" saca el stepper, escribir "2:10" desmarca el chip, guardar con y sin descanso (solo errores de permisos del uid falso, ninguno de datos inválidos).
- Próxima tarea: 3.1.

## Gotchas

- Ya no hay arranque automático: no tocar `tocarCheck` ni el `onguardar` de Ajustar para el timer.
- El `Stepper` formatea números con `Intl.NumberFormat`; el descanso tiene que mostrarse en M:SS (decidir en la 2.1 si se suma una prop de formato o se arma aparte).
- Los radios de chips de descanso tienen valores numéricos y "Sin descanso" = vacío; `OpcionesChip` es genérico de `string`: mapear o copiar su estilo.
- El flotante va abajo a la derecha y tapa la columna de ✓: el `main` de `/sesion` necesita `padding-bottom` extra.
- El timer guarda la hora de fin (`Date.now()` + descanso), no un contador: con la pantalla apagada los intervalos se frenan.
- Archivos CSV de 10 columnas (exportados antes) tienen que seguir importándose.
- En el Browser pane, `goto` se importa de `/node_modules/@sveltejs/kit/src/runtime/app/navigation/index.js?v=…` (buscar la URL en `performance.getEntriesByType('resource')`) para navegar sin perder los stores falsos. Los `change` sintéticos necesitan `bubbles: true` (Svelte 5 delega el evento).
- Trucos de verificación con stores falsos: `openspec/changes/archive/2026-11-04-mvp-4-import-export-archivo/traspaso.md` (`localStorage.__setup` y `__importHelpers` en el Browser pane, que puede no emular 390 px: forzar el ancho con `document.body.style.width`).
