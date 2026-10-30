# Design

## Context

MVP 0 dejó una SPA SvelteKit 3 (`adapter-static`, `ssr = false`, `prerender = true`) con una sola ruta `/` que decide login o inicial según el store `sesion` de `src/lib/acceso.ts`; Firebase (`app`, `auth`, `db`) en `src/lib/firebase.ts`; `Boton` y `BarraAccion` en `src/lib/componentes/`; `firestore.rules` ya permite `users/{uid}/**` al dueño. No hay framework de tests. Motivo y alcance: proposal.md; requisitos: specs `catalogo-ejercicios`, `rutina` y los deltas de `app-pwa` y `acceso`.

Decisiones tomadas con Joa (30/10/2026):
- Catálogo: acceso secundario "Ejercicios" desde el inicio, sin barra de pestañas.
- Agregar ejercicio al día: hoja con buscador, crear al vuelo y sugerencia de parecidos.
- Reordenar: arrastrar.
- Objetivo opcional por ejercicio (series × reps / series × seg / minutos), sin kg.
- Mockups: https://claude.ai/artifact/KYywsntvDXEY7ECdUYUzVT. Elegidas: editor **B · Días en pestañas**, formulario de ejercicio **A · Tipo en chips**. Supuestos aprobados: rutina con guardado instantáneo, ejercicio con "Guardar", "Salir" arriba a la derecha, tocar un ejercicio del día abre el objetivo, días renombrables.

## Goals / Non-Goals

**Goals:**
- Dejar el modelo `ejercicios` + `rutinas` listo para que el MVP 2 lo lea sin migrar.
- Componentes reutilizables que el MVP 2 también necesita (Stepper, Hoja).
- Arrastrar fiable con el pulgar, sin dependencias nuevas de runtime.

**Non-Goals:**
- Persistencia offline de Firestore (`persistentLocalCache`): llega con el MVP 2. En el MVP 1 se edita con conexión; si se corta, Firestore encola en memoria.
- Borrar ejercicios del catálogo (una rutina archivada podría referenciarlos); los errores se corrigen renombrando.
- Animaciones de reordenamiento más allá de seguir al dedo.

## Decisions

### 1. Rutas sin parámetros dinámicos; login en el layout
- Rutas: `/` (inicio), `/ejercicios` (catálogo), `/ejercicio` (nuevo; `?id=` para editar), `/rutina` (editor; `?dia=` opcional para abrir en un día).
- Todas prerenderizables: el id va en query string, no en `[id]`, así `adapter-static` no necesita fallback ni rewrites en Vercel y el service worker precachea todas.
- `+layout.svelte` decide: `cargando` → fondo; `sin-sesion` → login (el markup actual de `+page.svelte` pasa a `src/lib/componentes/Login.svelte`); `con-sesion` → `{@render children()}`.
- **Alternativa:** `[id]` con `fallback: 'index.html'` → descartada: suma config de Vercel y del SW por nada.

### 2. Datos: un módulo por colección, con stores vivos
- `src/lib/catalogo.ts`: `ejercicios` (store con `onSnapshot` de `users/{uid}/ejercicios`, ordenado por nombre en el cliente con `localeCompare('es')`), `crearEjercicio`, `guardarEjercicio`, `porId`. Se suscribe al haber sesión y se desuscribe al salir.
- `src/lib/rutina.ts`: `rutinaActiva` (store con `onSnapshot` de `rutinas where estado == 'activa' limit 1`; `null` si no hay), `crearRutina`, y una función por operación (`renombrarRutina`, `agregarDia`, `renombrarDia`, `borrarDia`, `moverDia`, `agregarItem`, `quitarItem`, `moverItem`, `fijarObjetivo`). Cada una arma el nuevo `dias[]` y hace `updateDoc(ref, { dias })` (guardado instantáneo; un solo usuario, sin conflictos).
- Ejercicio: `{ nombre, tipo, saltoKg: 2.5, saltoReps: 1, saltoSeg: 5, notas: '' }`. Se guardan los tres saltos aunque el tipo use menos, así cambiar de tipo no pierde valores.
- Rutina: `{ nombre: 'Rutina 1', inicio: 'AAAA-MM-DD', estado: 'activa', dias: [{ id, nombre, items: [{ ejercicioId, objetivo? }] }] }`. `objetivo` = `{ series?, reps?, segundos?, minutos? }` (misma forma que un bloque, sin kg).
- **Cambio al modelo de `config.yaml`:** el orden de días e items es la posición en el array (no se guarda `orden`) y cada día lleva `id` (`crypto.randomUUID()`), porque `sesiones.diaId` del MVP 2 lo referencia y el nombre del día se puede cambiar. Se actualiza `config.yaml` y `docs/decisiones-diseno-mancuernapp.md §4`.
- **Alternativa:** días como subcolección → descartada: la rutina se lee entera siempre y se reordena seguido; un array en un doc es una lectura y una escritura.

### 3. Funciones puras con tests (vitest)
- `src/lib/texto.ts`: `normalizar(s)` (minúsculas, sin acentos, espacios colapsados), `coincide(nombre, busqueda)` (todas las palabras de la búsqueda son prefijo de alguna palabra del nombre), `parecidos(nombre, catalogo)` (coincide en algún sentido, o comparten al menos la mitad de las palabras de 3+ letras), `esDuplicado`.
- `src/lib/orden.ts`: `mover(array, desde, hasta)` inmutable.
- `vitest` como devDependency con `npm test`; solo para estas funciones. La UI se verifica en `npm run dev` y en el celu.

### 4. Arrastrar: `ListaOrdenable.svelte` propio con Pointer Events
- La manija (botón de 48 × 64 px con ícono de dos rayas) es el único lugar que arranca el arrastre: `pointerdown` → `setPointerCapture`, `touch-action: none` solo en la manija (el resto de la fila hace scroll normal).
- Mientras arrastra: la fila sigue al dedo (`transform`), queda con `--raised` + `--elevation-float`, y en su lugar queda un hueco (borde punteado `--control`, 64 px). Al cruzar la mitad de la vecina se intercambian. `pointerup` → `onmover(desde, hasta)` una sola vez (una escritura).
- Eje `y` para ejercicios, eje `x` para las pestañas de días (mismo componente con prop `eje`).
- Teclado: con la manija enfocada, `↑/↓` (o `←/→`) mueve un lugar; `aria-label="Mover <nombre>"` y un `aria-live` que anuncia la nueva posición.
- Respeta `prefers-reduced-motion` (sin rotación ni transición de vuelta).
- **Alternativa:** `svelte-dnd-action` → descartada: arrastra desde toda la fila (pelea con el scroll) y suma una dependencia para ~120 líneas.

### 5. Componentes nuevos (de `bundle.css` del Design System)
- `Stepper.svelte` (`.ma-step`): `−`/valor/`+` 56 px, input editable con `inputmode`, props `valor`, `paso`, `min`, `max`, `etiqueta`, `decimales`; `−` deshabilitado en el mínimo. Coma decimal al mostrar.
- `Hoja.svelte`: `<dialog>` con `showModal()` (foco atrapado, `Esc` cierra), pegado abajo, `--surface`, radio arriba, `--elevation-float`, fondo `--scrim`; manija visual de 40 × 4 px `--control`. Tocar el fondo cierra.
- `OpcionesChip.svelte`: grupo de radios con forma de chip (`.chip`, wrap); elegido = `--accent` + `--on-accent`. Se usa para el tipo.
- `Boton` y `BarraAccion` sin cambios; la barra con dos botones usa grid de dos columnas iguales.

### 6. Pantallas (handoff de los mockups)
Medidas comunes: margen lateral `--space-4`; cabecera de 64 px con botón volver 48 × 48 (chevron, trazo 2,5, puntas rectas) + título `--fs-title` condensado; filas de 64 px mín. sobre `--surface`, separadas `--space-1`; nombre de ejercicio `--fs-heading` condensado 600; meta `--fs-meta` `--ink-faint`; objetivo a la derecha en `--fs-heading` condensado 700 `--ink-muted`, formato `4×10`, `3×40 s`, `15 min`.

- **Inicio sin rutina** (`/`): cabecera con "MancuernApp" y botón texto "Salir" a la derecha. Centro: "Todavía no hay rutina" (`--fs-heading`, `--ink`) + "Armá los días con ejercicios de tu catálogo." (`--ink-muted`). Barra: "Ejercicios" secundario + "Crear rutina" primario.
- **Inicio con rutina** (`/`): meta "Rutina activa · desde 30/10/2026", nombre en `--fs-title`, lista de días (fila: nombre + "6 ejercicios" / "Sin ejercicios" + chevron; toca → `/rutina?dia=<id>`). Barra: "Ejercicios" + "Editar rutina".
- **Ejercicios** (`/ejercicios`): volver + "Ejercicios" + cantidad en meta. Buscador (input 56 px, borde `--control` 2 px, ícono lupa). Filas: nombre + meta "Peso · 2,5 kg · ±1 rep" / "Tiempo · ±5 s" / "Cardio" / "Calentamiento". Toca → `/ejercicio?id=`. Barra: "Nuevo ejercicio". Sin resultados: "No hay ejercicios con «x»".
- **Ejercicio** (`/ejercicio`, variante A): título = nombre o "Nuevo ejercicio". Campo Nombre; Tipo en chips (Peso, Reps, Tiempo, Cardio, Calentamiento; wrap); saltos en dos columnas según tipo (peso: "Salto kg" + "Salto reps"; reps: "Salto reps"; tiempo: "Salto de segundos"); meta "Mancuernas: 1 kg. Barra y máquinas: 2,5 kg." bajo los de peso; Notas (textarea 88 px). Barra: "Guardar" (deshabilitado sin nombre). Error de duplicado debajo del nombre en `--alto` con `role="alert"`. Guarda y vuelve atrás.
- **Editor de rutina** (`/rutina`, variante B): volver + "Editar rutina". Campo "Nombre · desde 30/10/2026" (input con estilo `--fs-heading` condensado; guarda al salir del campo). Pestañas: chips de días (elegido = `--accent`; `role="tablist"`), `+` al final agrega día; las pestañas se arrastran (eje x, manteniendo apretado el chip ~300 ms; el chip es la manija). Debajo: "Día 1 · 6 ejercicios" + botón texto "Renombrar" (abre hoja con nombre y "Borrar día" secundario; borrar con ejercicios pide confirmación; no aparece con un solo día). Lista del día con manija a la izquierda; tocar la fila → hoja Objetivo. Día vacío: "Este día no tiene ejercicios". Barra: "Agregar ejercicio".
- **Hoja Agregar a Día N**: título + cerrar (X 48 px). Buscador con foco al abrir. Sección "En tu catálogo": filas `--raised` con `+` a la derecha; si ya está en el día, meta "ya está en este día" y no se agrega. Sección "Nuevo" (si no hay duplicado exacto y hay texto): fila de borde punteado `--control` "Crear «Texto»"; si hay parecidos, meta "¿No es el mismo que «X»?" y los parecidos aparecen primero en "En tu catálogo". Agregar cierra la hoja.
- **Hoja Nuevo ejercicio** (desde "Crear «…»"): volver a la búsqueda + "Nuevo ejercicio". Nombre precargado, Tipo en chips (Peso elegido), meta "Saltos por defecto: 2,5 kg y ±1 rep. Se cambian después en Ejercicios." Barra: "Crear y agregar".
- **Hoja Objetivo**: nombre del ejercicio + meta "Día 1 · Peso" + cerrar. Texto "Objetivo (opcional). Es el punto de partida la primera vez que cargues este ejercicio." Steppers apilados según tipo (Series 1–10 + Reps 1–50; Series + Segundos paso 5; Minutos paso 1). Calentamiento: sin steppers. Objetivo vacío por defecto: los steppers muestran "–" hasta el primer toque. Barra: "Quitar del día" secundario + "Listo" primario. Cada cambio guarda al instante; "Listo" solo cierra.

## Risks / Trade-offs

- [Arrastre propio con bugs en táctil] → manija dedicada con `touch-action: none`, verificación en el celu en la tarea del editor, y teclado como camino alternativo.
- [Escrituras de `dias[]` completo pisan cambios de otra pestaña] → un solo usuario, uso secuencial; aceptado.
- [Sin caché offline, editar sin señal falla al recargar] → el editor se usa en casa; offline real en el MVP 2.
- [Mantener apretado para arrastrar pestañas puede no descubrirse] → reordenar días es raro; se anota para el critique del cierre.
- [Costo: §9 estimaba ~20k; con componentes, arrastre y tests queda en ~100k] → tareas de 10–20k para cortar en cualquier punto.

## Migration Plan

Sin datos previos: las colecciones nacen vacías. Las reglas no cambian. Deploy por push a `main` (con OK de Joa).
