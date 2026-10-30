# Notas de traspaso — mvp-1-catalogo-rutina

## Estado
- Change propuesto (30/10/2026): `proposal.md`, `design.md`, `tasks.md`, specs nuevas `catalogo-ejercicios` y `rutina`, deltas de `app-pwa` y `acceso`. 
- 1.1 hecha: vitest 5 (`npm test` = `vitest run`), `src/lib/texto.ts` y `src/lib/orden.ts` con tests al lado (`*.test.ts`). 
- 1.2 hecha: `Login.svelte`, decisión de sesión en `+layout.svelte`, `Cabecera.svelte` (título, `volver` como href, `meta`, snippet `accion`), rutas vacías `/ejercicios`, `/ejercicio`, `/rutina`; clases globales `.pantalla` y `.texto` en `app.css`; `BarraAccion` con dos botones en columnas iguales. 
- 2.1 hecha: `Stepper.svelte` (`bind:valor` `number | null`, `null` muestra "–" y el primer toque arranca en `min`; `oncambio` para guardado instantáneo) y `OpcionesChip.svelte` (genérico, `bind:valor`, `opciones: {valor, etiqueta}[]`, `leyenda`). Próxima: 2.2.

## Decisiones tomadas con Joa
- Catálogo como acceso secundario "Ejercicios" en el inicio (sin pestañas abajo).
- Agregar ejercicio: hoja con buscador + crear al vuelo + sugerencia de parecidos.
- Reordenar arrastrando (ejercicios y días).
- Objetivo opcional por ejercicio, sin kg.
- Mockups: https://claude.ai/artifact/KYywsntvDXEY7ECdUYUzVT (privado). Elegidos: editor B (días en pestañas), formulario A (tipo en chips). Las otras variantes (A apilada, C dos niveles, B lista de tipos) quedan en el canvas como descartadas.
- Rutina con guardado instantáneo; ejercicio con "Guardar"; "Salir" arriba a la derecha; días renombrables.

## Gotchas previstos
- Svelte 5 delega `change`/`click` en la raíz: al simular eventos desde la consola usar `new Event('change', { bubbles: true })`.
- En el Browser pane no se puede entrar con Google (el popup no abre): para ver pantallas con sesión, en la consola `const m = await import('/src/lib/acceso.ts'); m.sesion.set({ estado: 'con-sesion', usuario: { uid: '...' } })`. Firestore no anda así (no hay token): las tareas con datos necesitan a Joa logueado o verificarse en el celu.
- En dev, el primer `goto` a una ruta tarda (Vite compila el chunk): esperar ~1 s antes de leer la página.
- `esDuplicado(a, b)` compara dos nombres; para el mensaje "Ya existe «X»" buscar con `catalogo.find(e => esDuplicado(e.nombre, nombre))`.
- `parecidos` cuenta "con" como palabra de 3+ letras ("Curl con mancuerna" ≈ "Remo con mancuerna"); si molesta en uso, filtrar conectores.
- Rutas con `?id=` en vez de `[id]` para seguir prerenderizando todo (ver design.md §1).
- `bundle.css` del Design System se lee con Artifact read + `paths: ["project/components/bundle.css"]` de https://claude.ai/artifact/GB9FbyJPzAdy3jsURqYKhP.
- Los mockups usan clases propias en `project/mvp1.css` del canvas (`.row`, `.chip`, `.sheet`, `.slot`…): son referencia visual, en la app cada componente lleva sus estilos con tokens.
- Ver también los gotchas de SvelteKit 3 en `openspec/changes/archive/2026-10-30-mvp-0-base/traspaso.md` (`#lib/x.ts` con extensión, sin `svelte.config.js`).
