# Design

## Context

MVP 1 dejó catálogo (`src/lib/catalogo.ts`, store `ejercicios`) y rutina activa (`src/lib/rutina.ts`, store `rutinaActiva`, días con `id`), rutas prerenderizadas con `?id=`, componentes `Stepper`, `Hoja`, `OpcionesChip`, `HojaAgregar`, `Cabecera`, `Boton`, `BarraAccion`, y `vitest` para funciones puras. Firestore todavía sin caché offline. El prototipo (`/prototipo`, archivado en `openspec/changes/archive/2026-10-31-prototipo-flujo-carga/`) validó en el celu: ✓ = igual, tocar el nombre para ajustar, Ajustar en hoja abajo, steppers apilados, día sugerido con chips y resumen solo con el volumen. Motivo y alcance: proposal.md; requisitos: spec `sesion` y deltas de `rutina` y `app-pwa`.

Decisiones tomadas con Joa (31/10/2026):
- Bloques: "+ Bloque", quitar bloque y **desarmar** un bloque en series sueltas (~7k).
- RPE: chips 6–10 en Ajustar, opcional.
- Ejercicio extra: sí, reusando la hoja de buscar/crear; queda solo en la sesión.
- Editar/borrar: solo la sesión de hoy; las viejas van con el historial (MVP 3).
- Nota por ejercicio: sí, en Ajustar.
- Mockups: https://claude.ai/artifact/X4TK7P9w7oHgeu9a6YJwB5. Elegidas: inicio **B · Inicio con «Empezar»** y Ajustar **B · Lista de bloques + editor**. Supuestos aprobados: primera vez arranca del objetivo y el ✓ abre Ajustar; "Borrar sesión" en la sesión de hoy; resumen = volumen.

## Goals / Non-Goals

**Goals:**
- Día sin cambios en ≈ 7 toques (Empezar + un ✓ por ejercicio + Terminar), con cambios ≈ 15.
- Cargar y guardar sin señal; nada se pierde al cerrar la app a mitad.
- Toda la lógica de "qué mostrar" en funciones puras con tests.

**Non-Goals:**
- % vs vez anterior, indicador, historial, gráficos (MVP 3).
- Dos sesiones el mismo día. (Editar o cargar sesiones de días anteriores: solo por "Cargar un día anterior", §8.)
- Reordenar ejercicios dentro de la sesión (se sigue el orden del día; los extras van al final).
- "Juntar" series desarmadas.

## Decisions

### 1. Modelo de la sesión
`users/{uid}/sesiones/{id}`:
```
{ rutinaId, diaId, fecha: 'AAAA-MM-DD' (local), creada: serverTimestamp(), terminada: boolean,
  registros: [{ ejercicioId, bloques: [{ series, reps?, kg?, segundos?, minutos? }], hecho: true, rpe?, nota? }] }
```
- El doc se crea con el **primer toque** que guarda algo (✓ o un cambio en Ajustar), no al tocar "Empezar": así abrir y volver no deja sesiones vacías. Id con `doc(collection(...))` (sin `await`, ver §5).
- Solo se guardan los ejercicios cargados: un registro = un ejercicio hecho. Destildar ✓ quita el registro. `hecho` queda en `true` por compatibilidad con el modelo de §4.
- Extra = registro cuyo `ejercicioId` no está en los items del día (se deriva, no se guarda).
- Orden en pantalla: items del día; después los extras en el orden de `registros`.
- **Cambio al modelo:** se suman `creada` y `terminada`. Actualizar `openspec/config.yaml` y `docs/decisiones-diseno-mancuernapp.md §4`.
- Calentamiento: bloque `{ series: 1 }`. Cardio: `{ series: 1, minutos }`.

### 2. Lectura: una suscripción por rutina, cálculos en el cliente
- `src/lib/sesion.ts`: store `sesiones` con `onSnapshot(query(sesiones, where('rutinaId', '==', rutina.id)))` (índice de un campo, automático; sin índices compuestos). Se re-suscribe cuando cambia el id de la rutina activa y se da de baja al salir. `undefined` cargando.
- Una rutina tiene decenas de sesiones: se ordenan en el cliente por `fecha` y después `creada` (con `serverTimestamps: 'estimate'` para las pendientes offline).
- `src/lib/calculos.ts` (puras, con tests en `calculos.test.ts`):
  - `hoy()` → `'AAAA-MM-DD'` local.
  - `sesionDeHoy(sesiones, hoy)` → la de fecha `hoy` o `undefined`.
  - `diaSugerido(rutina, sesiones)` → el día siguiente (por posición) al de la última sesión anterior a hoy; sin sesiones o si ese día ya no existe, el primero; después del último, vuelve al primero.
  - `ultimaVez(sesiones, diaId, ejercicioId, antesDe)` → los bloques del registro de ese ejercicio en la última sesión de ese día anterior a `antesDe`; para extras (no está en el día) busca en cualquier día. `undefined` si nunca se hizo.
  - `semana(sesiones, diaId, sesion)` → N-ésima vez de ese día (contando la actual; si todavía no existe, cantidad + 1).
  - `desdeObjetivo(tipo, objetivo)` → bloque inicial la primera vez (series y reps/segundos/minutos del objetivo; sin kg).
  - `desarmar(bloques, i)` → reemplaza el bloque `i` de N series por N bloques de 1 serie con los mismos valores.
  - `volumen(registros, tipos)` → Σ series × reps × kg de los registros de tipo peso.
  - `formatear(tipo, bloques)` → `3×10 · 60 kg + 1×8 · 70 kg`, `3×40 s`, `15 min`, `Calentamiento` (de `datos.ts` del prototipo).

### 3. Escritura: guardado instantáneo
- `sesion.ts` expone `guardarRegistro(ctx, registro)` y `quitarRegistro(ctx, ejercicioId)` (si no hay doc, lo crea con `setDoc` y los datos de `ctx = { rutinaId, diaId }`; si hay, `updateDoc(ref, { registros })` con el array entero), `terminar(id)` y `borrarSesion(id)`. Editar una sesión terminada no la reabre (`terminada` sigue en `true`).
- Cada toque de −/+, chip de RPE, bloque nuevo o quitado escribe; la nota escribe en `change` (al salir del campo).
- Un solo usuario y uso secuencial: reescribir `registros[]` entero es aceptable (como `dias[]` en MVP 1).

### 4. Rutas
- `/` (inicio con la tarjeta Hoy) y `/sesion?dia=<diaId>` (prerender, igual que el resto). `/sesion` usa la sesión de hoy si existe (y su día, ignora `?dia=`); si no, el día de `?dia=` y la sesión se crea al primer toque.
- Se borran `src/routes/prototipo/` y la excepción de login en `+layout.svelte`.

### 5. Offline
- `firebase.ts`: `initializeFirestore(app, { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) })` en lugar de `getFirestore`.
- **No esperar escrituras** en la UI: sin señal, la promesa de `setDoc`/`updateDoc`/`addDoc` no resuelve hasta sincronizar. Escribir sin `await` (con `.catch` que loguea) y navegar enseguida. Esto incluye `crearEjercicio` del catálogo (hoy hace `await addDoc`): pasa a `doc(collection())` + `setDoc` sin `await`, devolviendo el id al instante.
- Revisar `asegurarUsuario` en `acceso.ts`: sin señal no debe bloquear la entrada (Auth ya persiste la sesión en IndexedDB).
- El service worker ya cachea la app (MVP 0); los datos los cachea Firestore.

### 6. Componentes
- `HojaAgregar.svelte` se generaliza: props `titulo`, `yaEstan: Set<string>` (texto "ya está en este día" / "ya está en la sesión" según `contexto`) y `onagregar(id)`. El editor de rutina pasa `agregarItem`; la sesión pasa `guardarRegistro` con el bloque inicial.
- `HojaAjustar.svelte` nuevo (§7). Usa `Hoja`, `Stepper`, `OpcionesChip` (RPE) y `Boton`.
- `Stepper`: si el número vuelve a cortarse a 360 px, achicar su tipografía (gotcha del prototipo); los steppers van siempre apilados.

### 7. Pantallas (handoff de los mockups)
Medidas comunes del MVP 1: margen `--space-4`, cabecera 64 px, filas de 64 px mín. sobre `--surface` separadas `--space-1`, nombre `--fs-heading` condensado 600, meta `--fs-meta` `--ink-faint`, números con `font-variant-numeric: tabular-nums` y la fuente display condensada.

- **Inicio con rutina** (`/`, variante B): cabecera "MancuernApp" + "Salir". Meta "Rutina activa · desde 30/10/2026" y nombre en `--fs-title`. **Tarjeta Hoy** (`--raised`, `--radius`, padding `--space-4`, gap `--space-3`): título `--fs-heading` "Hoy: Día 2"; meta "Semana 3 · 6 ejercicios · la última fue Día 1" (sin sesiones: "Primera vez"); chips de días (`OpcionesChip`, los no elegidos en `--surface` sobre la tarjeta); botón primario "Empezar Día 2" → `/sesion?dia=`. Con sesión de hoy en curso: sin chips, meta "En curso · 2 de 6 hechos", botón "Seguir Día 2". Con sesión de hoy terminada: meta "Terminada · 4.390 kg", botón secundario "Ver sesión". Debajo, lista de días como en MVP 1 con meta "4 ejercicios · hecho el 29/10" (última fecha de ese día; sin sesiones solo la cantidad); tocar → `/rutina?dia=`. Barra: "Ejercicios" + "Editar rutina", **ambas secundarias** (la primaria es "Empezar"). La lista de días puede hacer scroll; la tarjeta queda arriba.
- **Sesión** (`/sesion`): cabecera con volver + título "Hoy: Día 2" + meta "Rutina 1 · semana 3 · 2/6 hechos"; acción "Borrar" (botón texto) solo si la sesión ya existe. Lista de ejercicios (`ul` con gap `--space-1`): fila = botón cuerpo (nombre + valores) + botón ✓ de 64 px a la derecha (borde 2 px `--control`; hecho = fondo `--accent`, ícono `--on-accent`, `aria-pressed`). Valores:
  - sin cargar: "Última: 4×10 · 40 kg" en `--ink-faint`;
  - primera vez: "Primera vez · objetivo 4×10" (sin objetivo: "Primera vez");
  - extra sin cargar: "Extra · última: 3×12 · 14 kg";
  - hecho igual: valores en `--ink`; hecho ajustado (distinto a la última vez o con RPE/nota): `--accent-ink`, con " · RPE 8" al final si hay.
  - calentamiento: "Calentamiento"; el cuerpo también marca/desmarca (no abre Ajustar).
  - ✓: sin cargar y con última → copia la última (1 toque); hecho → quita el registro (vuelve a "Última"); primera vez → abre Ajustar.
  - `aria-label` del ✓: "Press banca: igual que la última vez" / "Hip thrust: cargar" / "Press banca: hecho".
  Al pie, botón punteado "+ Agregar ejercicio" (`.add` del MVP 1) → `HojaAgregar` titulada "Agregar a la sesión". Barra: "Terminar sesión" primario, deshabilitado sin ejercicios hechos; con la sesión ya terminada dice "Listo" y vuelve al inicio.
- **Hoja Ajustar** (variante B): título = nombre del ejercicio, meta "Última: 3×10 · 40 kg" (o "Primera vez"), X para cerrar. Lista de bloques como radios (`role="radiogroup"`): fila de 56 px `--raised`, etiqueta a la izquierda (`--fs-meta`, `--ink-faint`, 56 px de ancho: "Serie N" si el bloque tiene 1 serie, si no "Bloque N"; N = posición), valor a la derecha en display condensado 700 (`1×8 · 40 kg`); elegido = borde 2 px `--accent`. Al abrir queda elegido el primero. Debajo, botón punteado "+ Bloque" (copia el último bloque y lo elige). Editor del elegido en una tarjeta `--ground`: título "Bloque 2"/"Serie 3", "Desarmar" (botón texto, solo con 2+ series; elige la primera serie resultante) y quitar (ícono tacho, `aria-label="Quitar bloque 2"`; deshabilitado si es el único bloque). Steppers apilados según tipo: peso = Series, Reps (±saltoReps), Kg (±saltoKg, una decimal, etiqueta derecha "±2,5"); reps = Series, Reps; tiempo = Series, Segundos (±saltoSeg); cardio = Minutos (sin lista de bloques ni "+ Bloque"). Después "RPE (opcional)" con 5 chips iguales en grilla (6–10; tocar el elegido lo borra) y "Nota (opcional)" (textarea de 88 px, `--ground`). Barra: "Listo" primario (cierra; si el ejercicio no estaba hecho, lo guarda como hecho con los valores mostrados). La hoja hace scroll si no entra. Cada cambio guarda al instante.
- **Resumen** (hoja al tocar "Terminar sesión"): "Sesión terminada", meta "Día 2 · semana 3 · 6 de 6 ejercicios", etiqueta "Volumen" y el número en `--fs-num-xl` ("4.390 kg", `Intl.NumberFormat('es-AR')`; sin ejercicios de peso: "—"), texto "Queda guardada. Hasta mañana podés volver a tocarla desde el inicio." Barra: "Listo" → `/`.
- **Borrar sesión** (hoja desde "Borrar"): "Sesión de hoy", meta "Día 2 · 31/10/2026 · terminada|en curso", aviso en `--alto` con `role="alert"`: "Se borran los 6 ejercicios cargados hoy. No se puede deshacer." Barra: "Cancelar" secundario + "Sí, borrar sesión" primario → borra y va a `/`.

### 8. Ajustes después del celu (31/10/2026, con Joa)
- **Cargar un día anterior**: link sutil (botón texto) bajo la tarjeta Hoy → hoja "Cargar un día anterior" con chips de fecha "Ayer", "Anteayer" y un campo de fecha (mín. el inicio de la rutina, máx. ayer) y chips de días con el sugerido para esa fecha (`diaSugerido(rutina, sesiones, fecha)`). Botón "Cargar Día X" → `/sesion?dia=&fecha=`. Si esa fecha ya tiene sesión: "Abrir la sesión del dd/mm" (se edita igual que la de hoy). Sigue habiendo una sesión por fecha; la sesión lleva su fecha real, así la rotación, la semana y la "última vez" la toman en orden.
- `/sesion` toma `?fecha=` (por defecto `hoy()`): título "Hoy: Día 1", "Ayer: Día 1" o "29/10: Día 1"; la "última vez" es la anterior a esa fecha; el resumen dice solo "Queda guardada." si no es hoy. `Contexto` suma `fecha`.
- **Inicio más limpio**: la lista de días se oculta detrás de "Ver días" (botón texto); desplegada muestra cada día con "N ejercicios · hecho el dd/mm" y los nombres de sus ejercicios, solo lectura. Editar sigue en "Editar rutina".
- **Ajustar más limpio** (6.3): al abrir solo se ven los bloques; tocar uno abre su editor (tocarlo de nuevo lo cierra); cardio muestra siempre sus minutos. "+ Bloque" se oculta por ahora (Joa no lo usa; la función se puede volver a mostrar). RPE y nota van plegados detrás de "Opcional" (abierto al entrar si ya tienen algo; el botón resume "· RPE 8 · nota").

## Risks / Trade-offs

- [`await` de escrituras cuelga la UI sin señal] → regla de §5, verificar en modo avión en la tarea de offline.
- [Fecha local vs UTC: una sesión a las 23:30 cae en otro día] → `hoy()` usa la fecha local del celu.
- [Sesiones offline sin `creada` del servidor desordenan] → `serverTimestamps: 'estimate'` al leer; desempata `fecha`.
- [Muchos toques = muchas escrituras de `registros[]`] → son locales primero y una sesión pesa pocos KB; aceptado.
- [Cambiar el día de la rutina (borrar un día) con sesiones viejas] → `diaSugerido` vuelve al primero; las sesiones viejas quedan con su `diaId` (el historial las resuelve en MVP 3).
- [Costo: §9 estimaba ~25k; con bloques, desarmar, extra, offline y tests queda en ~95k] → tareas de 10–20k.
