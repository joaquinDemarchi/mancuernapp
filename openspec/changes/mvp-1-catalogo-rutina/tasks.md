# Tasks

> Cada tarea: commit local + `[x]` acá + actualizar `traspaso.md`. Costo estimado entre paréntesis.
> Total estimado: ~99k tokens (5 grupos). Push y deploy solo con OK de Joa. Diseño de referencia: design.md §6 y el canvas https://claude.ai/artifact/KYywsntvDXEY7ECdUYUzVT.

## 1. Base: funciones puras, rutas y layout (~14k)

- [x] 1.1 Instalar `vitest` (devDependency, script `npm test`); crear `src/lib/texto.ts` (`normalizar`, `coincide`, `parecidos`, `esDuplicado`) y `src/lib/orden.ts` (`mover`) con sus tests (`elongacion` encuentra "Elongación", "press inclinado" es parecido a "Press inclinado con mancuerna", "press banca" es duplicado de "Press Banca", `mover` sube/baja/extremos); verificar `npm test` en verde y `npm run check` sin errores; commit (~6k)
- [x] 1.2 Pasar el login a `src/lib/componentes/Login.svelte` y la decisión cargando/login/app a `+layout.svelte`; crear las rutas vacías `/ejercicios`, `/ejercicio`, `/rutina` (prerender) con cabecera y volver; inicio sin rutina según design.md §6 ("Salir" arriba, "Ejercicios" + "Crear rutina" abajo, todavía sin acción en "Crear rutina"); verificar en `npm run dev` a 390 px: login → inicio, "Ejercicios" navega y vuelve, "Salir" vuelve al login, `npm run build` genera las 4 páginas; commit (~8k)

## 2. Componentes compartidos (~12k)

- [ ] 2.1 Crear `Stepper.svelte` (de `.ma-step`: 56 px, valor editable con `inputmode`, `paso`/`min`/`max`/`decimales`, coma decimal, `−` deshabilitado en el mínimo, estado vacío "–") y `OpcionesChip.svelte` (radios con forma de chip, wrap, elegido en `--accent`); verificar en una página de prueba temporal en dev que el stepper de kg va 2,5 → 0,5 de a 0,5 y se frena, que escribir "1,5" lo toma, que los chips se recorren con flechas, y medir ≥ 48 px; borrar la página de prueba; commit (~7k)
- [ ] 2.2 Crear `Hoja.svelte` (`<dialog>` con `showModal`, abajo, `--surface`, `--scrim`, `--elevation-float`, manija visual, cierra con `Esc`, tocando el fondo o con su botón X, título por prop); verificar en dev que el foco queda adentro y vuelve al botón que la abrió al cerrar; commit (~5k)

## 3. Catálogo de ejercicios (~17k)

- [ ] 3.1 Crear `src/lib/catalogo.ts` (store `ejercicios` con `onSnapshot` de `users/{uid}/ejercicios`, orden alfabético `es`, alta/baja de la suscripción con la sesión; `crearEjercicio` con saltos por defecto, `guardarEjercicio`, `porId`) y la pantalla `/ejercicios` (buscador con `coincide`, filas con tipo y saltos, cantidad, estado vacío y sin resultados, "Nuevo ejercicio"); verificar en dev creando un doc a mano en la consola de Firestore que aparece en la lista sin recargar y que "elongacion" lo encuentra; commit (~8k)
- [ ] 3.2 Crear `/ejercicio` (variante A: nombre, tipo en `OpcionesChip`, saltos según tipo con `Stepper`, notas, "Guardar" deshabilitado sin nombre, error "Ya existe «X»" con `esDuplicado`, `?id=` para editar); verificar en dev los escenarios de `catalogo-ejercicios` (saltos según tipo, mancuernas a 1 kg, duplicado, renombrar se ve en la lista) y en Firestore que el doc tiene `{ nombre, tipo, saltoKg, saltoReps, saltoSeg, notas }`; commit (~9k)

## 4. Rutina (~48k)

- [ ] 4.1 Crear `src/lib/rutina.ts` (store `rutinaActiva`, `crearRutina` con "Rutina 1", fecha de hoy y "Día 1" con `id`; operaciones de nombre, días e items que reescriben `dias[]`), conectar "Crear rutina" y armar el inicio con rutina (nombre, "desde", días con cantidad, "Editar rutina"); verificar en dev: crear rutina abre `/rutina`, el doc en Firestore tiene la forma de design.md §2, volver muestra el inicio con rutina y ya no se ofrece "Crear rutina"; commit (~9k)
- [ ] 4.2 Editor `/rutina` (variante B): nombre con guardado al salir del campo, pestañas de días con `+`, `?dia=`, "Renombrar" en hoja con "Borrar día" (confirmación si tiene ejercicios, oculto con un día), lista del día con objetivo formateado y estado vacío, "Agregar ejercicio" en la barra (todavía sin hoja); verificar en dev los escenarios "Agregar día", "Borrar día con ejercicios", "Borrar el único día" y que cada cambio queda en Firestore sin botón guardar; commit (~10k)
- [ ] 4.3 Hoja "Agregar a Día N": buscador con foco, resultados con `coincide` (parecidos primero), "ya está en este día", fila "Crear «X»" con "¿No es el mismo que «Y»?", subhoja "Nuevo ejercicio" (nombre + tipo + "Crear y agregar"); verificar en dev los escenarios "Elegir del catálogo", "Crear al vuelo", "Ya está en el día" y "Nombre parecido"; commit (~9k)
- [ ] 4.4 Hoja Objetivo: steppers según tipo (vacíos hasta el primer toque), guardado instantáneo, "Quitar del día" y "Listo"; verificar en dev "Fijar objetivo" (la fila muestra `4×10`, `3×40 s`, `15 min`), calentamiento sin steppers y "Quitar del día" deja el ejercicio en el catálogo; commit (~6k)
- [ ] 4.5 Crear `ListaOrdenable.svelte` (Pointer Events desde la manija, `touch-action: none` solo ahí, hueco punteado, fila elevada, intercambio a mitad de la vecina, una escritura al soltar, teclado con flechas + `aria-live`, eje `x`/`y`, reduced-motion) y usarlo en los ejercicios del día y en las pestañas (mantener apretado ~300 ms); verificar en dev con emulación táctil los escenarios "Arrastrar ejercicio" y "Scroll sin arrastrar" y el reorden con teclado; commit (~14k)

## 5. Cierre (~8k)

- [ ] 5.1 Actualizar el modelo en `openspec/config.yaml` y `docs/decisiones-diseno-mancuernapp.md §4` (día con `id`, orden = posición en el array, `objetivo` sin kg); con OK de Joa, push a `main` y verificar el deploy de Vercel en verde; checklist en el celu de Joa (anotada en `traspaso.md`): crear 3–4 ejercicios de distintos tipos, crear rutina con 2 días, agregar con búsqueda y al vuelo, objetivo, arrastrar ejercicios y días con el pulgar, renombrar y borrar un día, "Salir"; commit (~8k)

## Workflow follow-up

- Critique + accesibilidad + copy de las pantallas nuevas (ciclo de diseño) antes de archivar.
- Archivar el change con `/opsx:archive` cuando Joa confirme la verificación en el celu.
