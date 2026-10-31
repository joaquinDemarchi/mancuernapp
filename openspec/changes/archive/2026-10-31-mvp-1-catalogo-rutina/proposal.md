# Proposal

## Why

La app ya abre y loguea, pero no tiene datos: sin catálogo de ejercicios y sin rutina, el flujo de carga del MVP 2 no tiene sobre qué trabajar. Este change arma esa base: los ejercicios existen una sola vez (catálogo) y la rutina activa los referencia por día y en orden.

## What Changes

- Catálogo personal de ejercicios: lista con buscador, alta y edición (nombre, tipo, saltos de kg/reps/segundos según el tipo, notas).
- Crear la rutina activa a mano y editarla: nombre, días en pestañas (agregar, renombrar, borrar, reordenar arrastrando) y ejercicios por día (agregar, quitar, reordenar arrastrando).
- Hoja "Agregar a Día N" con buscador sobre el catálogo; si no existe, se crea ahí mismo (nombre + tipo) y se avisa si se parece a uno existente.
- Objetivo opcional por ejercicio del día según el tipo (series × reps, series × segundos, minutos).
- La pantalla inicial cambia: sin rutina ofrece "Crear rutina" y "Ejercicios"; con rutina muestra sus días y "Editar rutina". "Cerrar sesión" pasa a un botón "Salir" arriba a la derecha.
- Guardado instantáneo en la rutina (cada cambio se escribe en Firestore); el formulario de ejercicio guarda con botón.
- La app pasa de una sola ruta a varias (`/`, `/ejercicios`, `/ejercicio`, `/rutina`) con el login resuelto en el layout.

**Fuera de alcance:** borrar ejercicios del catálogo, varias rutinas o archivar (MVP 4), import/export (MVP 4), carga de sesiones y "Hoy: Día X" (MVP 2), persistencia offline de Firestore (MVP 2), kg en el objetivo, tema claro y Ajustes.

## Capabilities

### New Capabilities
- `catalogo-ejercicios`: el catálogo personal de ejercicios (alta, edición, búsqueda, tipos, saltos y sugerencia de parecidos).
- `rutina`: la rutina activa (crearla, días, ejercicios por día con orden y objetivo, y cómo se muestra en el inicio).

### Modified Capabilities
- `app-pwa`: la pantalla inicial deja de ser solo un estado vacío; suma accesos a Ejercicios y Crear rutina.
- `acceso`: cerrar sesión pasa a ser "Salir" arriba en la pantalla inicial.

## Impact

- Código: rutas nuevas en `src/routes/`, login movido a `+layout.svelte`, módulos de datos `src/lib/catalogo.ts` y `src/lib/rutina.ts`, componentes nuevos en `src/lib/componentes/` (Stepper, Hoja, ListaOrdenable, OpcionesChip).
- Firestore: colecciones `users/{uid}/ejercicios` y `users/{uid}/rutinas` (las reglas actuales ya las cubren; no cambian).
- Dependencia de desarrollo nueva: `vitest` para las funciones puras (parecidos y reordenar).
- Diseño: mockups en https://claude.ai/artifact/KYywsntvDXEY7ECdUYUzVT (variante B del editor, A del formulario).
