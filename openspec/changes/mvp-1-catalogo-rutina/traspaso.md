# Notas de traspaso — mvp-1-catalogo-rutina

## Estado
- Change propuesto (30/10/2026): `proposal.md`, `design.md`, `tasks.md`, specs nuevas `catalogo-ejercicios` y `rutina`, deltas de `app-pwa` y `acceso`. 
- 1.1 hecha: vitest 5 (`npm test` = `vitest run`), `src/lib/texto.ts` y `src/lib/orden.ts` con tests al lado (`*.test.ts`). 
- 1.2 hecha: `Login.svelte`, decisión de sesión en `+layout.svelte`, `Cabecera.svelte` (título, `volver` como href, `meta`, snippet `accion`), rutas vacías `/ejercicios`, `/ejercicio`, `/rutina`; clases globales `.pantalla` y `.texto` en `app.css`; `BarraAccion` con dos botones en columnas iguales. 
- 2.1 hecha: `Stepper.svelte` (`bind:valor` `number | null`, `null` muestra "–" y el primer toque arranca en `min`; `oncambio` para guardado instantáneo) y `OpcionesChip.svelte` (genérico, `bind:valor`, `opciones: {valor, etiqueta}[]`, `leyenda`). 
- 2.2 hecha: `Hoja.svelte` (`bind:abierta`, `titulo`, children; `<dialog>` con `showModal`, cierra con Esc/fondo/X y el navegador devuelve el foco al botón que la abrió). Sin barra de acciones propia todavía: agregarla (snippet) cuando la pidan 4.3/4.4. 
- 3.1 hecha: `src/lib/catalogo.ts` (`ejercicios` es `null` hasta la primera lectura; `tipos` con etiquetas para los chips; `describir(e)` arma la meta "Peso · 2,5 kg · ±1 rep"; `crearEjercicio(nombre, tipo, datos?)` devuelve el id) y `/ejercicios`. Verificado en el Chrome de Joa: quedaron en su Firestore real "Elongación" (calentamiento) y "Press banca" (peso) como datos de prueba. 
- 3.2 hecha: `/ejercicio` (variante A). El error de duplicado se ve en vivo mientras se escribe y "Guardar" no hace nada en ese caso; guarda sin `await` y va a `/ejercicios`. Verificado en Chrome: saltos según tipo, "Remo con mancuerna" con salto 1 kg (quedó en el Firestore de Joa), duplicado, renombrar y entrar directo con `?id=`. 
- 4.1 hecha: `src/lib/rutina.ts` (`rutinaActiva`: `undefined` cargando, `null` sin rutina; `crearRutina`, `fechaCorta`, y `renombrarRutina`, `agregarDia` (devuelve id), `renombrarDia`, `borrarDia`, `moverDia`, `agregarItem`, `quitarItem`, `moverItem`, `fijarObjetivo` (sin objetivo borra la clave), todas sin probar todavía salvo `crearRutina`). Inicio con rutina listo. Verificado en Chrome: en el Firestore de Joa quedó "Rutina 1" activa desde 30/10/2026 con "Día 1" vacío (es la rutina real a completar). 
- 4.2 hecha: editor `/rutina` (nombre con guardado en `change`, pestañas `role=tab`, `+` agrega y elige el día, hoja "Renombrar día" con "Borrar día": con ejercicios el primer toque muestra el aviso y el botón pasa a "Sí, borrar día"; oculto con un solo día). `formatearObjetivo` en `rutina.ts`. Las filas del día todavía no son botones (la hoja Objetivo es la 4.4). Verificado en Chrome con Firestore; la rutina quedó como estaba ("Rutina 1", "Día 1" vacío). 
- 4.3 hecha: `HojaAgregar.svelte` (pasos `buscar`/`nuevo` dentro de la misma `Hoja`; parecidos primero; "ya está en este día" con `aria-disabled`; en el paso nuevo también avisa duplicado). Verificado en Chrome: "Día 1" quedó con Press banca y Hip thrust (Hip thrust creado al vuelo en el catálogo real), útiles para probar 4.4 y 4.5. 
- 4.4 hecha: `HojaObjetivo.svelte` (carga los valores solo al abrir, con `untrack`, para que el eco de Firestore no pise lo que se toca; guarda en cada `oncambio`) y `Hoja` con prop `meta`. Las filas del día son botones que abren el objetivo. Verificado en Chrome: Press banca quedó con objetivo 4×10 en "Día 1"; `3×40 s` y `15 min` probados con `formatearObjetivo` en consola (no hay ejercicios de tiempo ni cardio en el catálogo). 
- 4.5 hecha: `ListaOrdenable.svelte` (genérico; la fila recibe `manija` para esparcir en su manija; `demora` para el chip de pestañas; orden local hasta que vuelve `items` de Firestore; traga el clic que sigue al soltar; teclado con flechas, devuelve el foco y anuncia en `aria-live`). Verificado en Chrome: arrastre con mouse real de ejercicios (persiste al recargar), teclado, pestañas con toque corto (elige), arrastre rápido sin mantener (no mueve) y mantener ~400 ms con PointerEvents táctiles sintéticos (mueve, hueco punteado, persiste). **No verificado:** "Scroll sin arrastrar" con dedo real (Chrome con la extensión no emula táctil): queda para la checklist del celu en 5.1. 
- 5.1 hecha: modelo actualizado en `openspec/config.yaml` y `docs/decisiones-diseno-mancuernapp.md §4`; push a `main` con OK de Joa (30/10/2026). Joa confirmó la checklist del celu. Falta: critique + accesibilidad + copy y `/opsx:archive`.

## Checklist en el celu (Joa) — OK de Joa el 30/10/2026
- [x] Crear 3–4 ejercicios de distintos tipos (peso con mancuerna a 1 kg, tiempo, cardio).
- [x] Agregar a la rutina con búsqueda y uno creado al vuelo.
- [x] Fijar objetivo en uno de peso, uno de tiempo (`3×40 s`) y uno de cardio (`15 min`).
- [x] Crear un segundo día; renombrar y borrar un día.
- [x] Arrastrar ejercicios desde la manija con el pulgar.
- [x] Arrastrar pestañas manteniendo apretado el chip.
- [x] Scroll de la lista tocando fuera de la manija: hace scroll, no arrastra (no verificado en la PC).
- [x] "Salir" vuelve al login (no verificado en la PC: el Browser pane no abre el popup de Google).

## Decisiones tomadas con Joa
- Catálogo como acceso secundario "Ejercicios" en el inicio (sin pestañas abajo).
- Agregar ejercicio: hoja con buscador + crear al vuelo + sugerencia de parecidos.
- Reordenar arrastrando (ejercicios y días).
- Objetivo opcional por ejercicio, sin kg.
- Mockups: https://claude.ai/artifact/KYywsntvDXEY7ECdUYUzVT (privado). Elegidos: editor B (días en pestañas), formulario A (tipo en chips). Las otras variantes (A apilada, C dos niveles, B lista de tipos) quedan en el canvas como descartadas.
- Rutina con guardado instantáneo; ejercicio con "Guardar"; "Salir" arriba a la derecha; días renombrables.

## Gotchas previstos
- Después de editar un módulo con el dev corriendo, `import('/src/lib/rutina.ts')` desde la consola puede dar una instancia nueva (store en `undefined`): recargar la página antes de leer stores.
- Con varias hojas en la página, buscar la abierta con `[...document.querySelectorAll('dialog')].find(d => d.open)`.
- Desde la consola, importar `firebase/firestore` por `/node_modules/.vite/deps/...` da otra instancia ("Expected first argument to collection()..."): leer los datos por los stores (`catalogo.ts`) en vez de usar el SDK directo.
- Verificación con Firestore: en el Chrome de Joa (Claude in Chrome), `http://localhost:5173` ya tiene sesión. Desde la consola: `const c = await import('/src/lib/catalogo.ts')`.
- Browser pane: los clics por coordenada sobre un `<dialog>` modal (top layer) llegan a `<html>` con la emulación de viewport; probar las hojas con `el.click()` desde la consola. Al borrar y recrear una ruta, Vite puede servir la vieja: reiniciar el dev server.
- Svelte 5 delega `change`/`click` en la raíz: al simular eventos desde la consola usar `new Event('change', { bubbles: true })`.
- En el Browser pane no se puede entrar con Google (el popup no abre): para ver pantallas con sesión, en la consola `const m = await import('/src/lib/acceso.ts'); m.sesion.set({ estado: 'con-sesion', usuario: { uid: '...' } })`. Firestore no anda así (no hay token): las tareas con datos necesitan a Joa logueado o verificarse en el celu.
- En dev, el primer `goto` a una ruta tarda (Vite compila el chunk): esperar ~1 s antes de leer la página.
- `esDuplicado(a, b)` compara dos nombres; para el mensaje "Ya existe «X»" buscar con `catalogo.find(e => esDuplicado(e.nombre, nombre))`.
- `parecidos` cuenta "con" como palabra de 3+ letras ("Curl con mancuerna" ≈ "Remo con mancuerna"); si molesta en uso, filtrar conectores.
- Rutas con `?id=` en vez de `[id]` para seguir prerenderizando todo (ver design.md §1).
- `bundle.css` del Design System se lee con Artifact read + `paths: ["project/components/bundle.css"]` de https://claude.ai/artifact/GB9FbyJPzAdy3jsURqYKhP.
- Los mockups usan clases propias en `project/mvp1.css` del canvas (`.row`, `.chip`, `.sheet`, `.slot`…): son referencia visual, en la app cada componente lleva sus estilos con tokens.
- Ver también los gotchas de SvelteKit 3 en `openspec/changes/archive/2026-10-30-mvp-0-base/traspaso.md` (`#lib/x.ts` con extensión, sin `svelte.config.js`).
