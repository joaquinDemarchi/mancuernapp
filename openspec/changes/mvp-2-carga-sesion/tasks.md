# Tasks

> Cada tarea: commit local + `[x]` acá + actualizar `traspaso.md`. Costo estimado entre paréntesis.
> Total estimado: ~100k tokens (5 grupos). Push y deploy solo con OK de Joa. Diseño de referencia: design.md §7 y el canvas https://claude.ai/artifact/X4TK7P9w7oHgeu9a6YJwB5 (inicio B, Ajustar B).

## 1. Base: limpieza, offline y cálculos (~16k)

- [x] 1.1 Con OK de Joa, borrar `src/routes/prototipo/` y la excepción de login de `src/routes/+layout.svelte`; `firebase.ts` con `initializeFirestore` + `persistentLocalCache` (`persistentMultipleTabManager`); `crearEjercicio` sin `await` (`doc(collection())` + `setDoc`, devuelve el id al instante) y revisar que `asegurarUsuario` no bloquee sin señal; verificar `npm run check`, `npm test` y `npm run build` sin errores y que catálogo y rutina siguen cargando en dev; commit (~7k)
- [x] 1.2 Crear `src/lib/calculos.ts` (`hoy`, `sesionDeHoy`, `diaSugerido`, `ultimaVez`, `semana`, `desdeObjetivo`, `desarmar`, `volumen`, `formatear`; design.md §2) con `calculos.test.ts`: rotación y vuelta al primero, día borrado, última vez del mismo día y de cualquier día para extras, semana con y sin sesión actual, desarmar 3×10 · 40 → tres 1×10 · 40, volumen 4×10·40 + 3×10·60 = 3400, formatos `3×10 · 60 kg + 1×8 · 70 kg`, `3×40 s`, `15 min`; verificar `npm test` en verde; commit (~9k)

## 2. Datos de sesión e inicio (~16k)

- [x] 2.1 Crear `src/lib/sesion.ts` (tipos `Sesion`, `Registro`, `Bloque`; store `sesiones` con `onSnapshot` de `where('rutinaId','==',…)`, re-suscripción al cambiar la rutina, baja al salir, `serverTimestamps: 'estimate'`; `guardarRegistro` que crea el doc en el primer toque, `quitarRegistro`, `terminar`, `borrarSesion`, todas sin `await`); verificar en dev desde la consola con Joa logueado que crear, editar y borrar una sesión de prueba se refleja en el store y en Firestore, y dejar Firestore como estaba; commit (~8k)
- [x] 2.2 Inicio con rutina (variante B): tarjeta "Hoy" con día sugerido, semana, chips y "Empezar Día X" → `/sesion?dia=`; estados "Seguir Día X" (en curso) y "Ver sesión" (terminada, con volumen); días con "hecho el dd/mm"; barra con "Ejercicios" y "Editar rutina" secundarias; ruta `/sesion` vacía con volver; verificar en dev a 390 px los escenarios "Rotación" y "Cambiar el día" y el inicio sin sesiones ("Primera vez"); commit (~8k)

## 3. Pantalla de sesión y Ajustar (~32k)

- [x] 3.1 `/sesion`: cabecera "Hoy: Día X" + meta (rutina, semana, hechos), lista con valores según estado (última, primera vez, extra, hecho, ajustado en `--accent-ink`), ✓ de 64 px (copia la última / quita / abre Ajustar si es primera vez), calentamiento se marca tocando el nombre, "Terminar sesión" (deshabilitado sin hechos) con hoja de resumen y volumen; usa la sesión de hoy si existe; verificar en dev con Joa logueado "Día sin cambios" (7 toques), "Destildar", "Entrar y salir sin cargar", "Cerrar a mitad" (recargar) y "Volumen"; commit (~13k)
- [x] 3.2 `HojaAjustar.svelte` (variante B): lista de bloques como radios ("Serie N"/"Bloque N", elegido con borde `--accent`), editor del elegido con steppers apilados según tipo y saltos del ejercicio, "+ Bloque" (copia el último), "Desarmar" (2+ series), quitar (no el único), "Listo"; cardio sin lista de bloques; cada cambio guarda y marca hecho; verificar en dev a 360 px "Subir kg", "Desarmar", "Última serie distinta" y que los números no se cortan; commit (~14k)
- [x] 3.3 RPE (chips 6–10 en grilla, tocar el elegido lo borra) y nota (textarea, guarda en `change`) en `HojaAjustar`; la fila muestra "· RPE 8"; verificar en dev el escenario "RPE", borrar el RPE y que la nota persiste al recargar; commit (~5k)

## 4. Extra y sesión de hoy (~14k)

- [x] 4.1 Generalizar `HojaAgregar.svelte` (props `titulo`, `yaEstan`, `onagregar`, texto "ya está en este día"/"ya está en la sesión") sin romper el editor de rutina; "+ Agregar ejercicio" al pie de `/sesion` agrega un extra (bloque inicial de su última vez en cualquier día o del tipo) al final, marcado "Extra"; verificar en dev "Agregar extra" (la rutina no cambia), crear un extra al vuelo y que "Agregar ejercicio" del editor de rutina sigue andando; commit (~9k)
- [x] 4.2 "Borrar" en la cabecera de `/sesion` (solo si la sesión existe) con la hoja de confirmación de design.md §7; sesión terminada: "Terminar sesión" pasa a "Listo" y se puede seguir editando; verificar en dev "Borrar" y editar una sesión terminada desde "Ver sesión"; commit (~5k)

## 5. Cierre (~14k)

- [x] 5.1 Verificar offline en dev (DevTools → Network offline, o modo avión con `dev-lan`): "Cargar en modo avión" y "Crear un extra sin señal", y que la UI no queda esperando; actualizar el modelo en `openspec/config.yaml` y `docs/decisiones-diseno-mancuernapp.md §4` (`creada`, `terminada`, sesión creada al primer toque); commit (~7k)
- [x] 5.2 Con OK de Joa, push a `main` y verificar el deploy de Vercel en verde; checklist en el celu de Joa (anotarla en `traspaso.md`): sesión real completa en el gym, ✓, ajustar kg, + bloque, desarmar, RPE, nota, extra, terminar, retomar, borrar una de prueba, y una carga en modo avión; commit (~7k)

## 6. Ajustes después del celu (~15k)

> Pedidos de Joa al probar en el celu (31/10/2026): poder cargar una sesión olvidada y un inicio más limpio.

- [x] 6.1 Inicio: la lista de días queda oculta detrás de un botón sutil "Ver días" / "Ocultar días"; cada día muestra sus ejercicios y "hecho el dd/mm", solo lectura (no lleva al editor); verificar en dev a 390 px; commit (~5k)
- [x] 6.2 "Cargar un día anterior" (link sutil bajo la tarjeta Hoy): hoja con fecha (Ayer, Anteayer u otra, entre el inicio de la rutina y ayer) y día (sugerido para esa fecha); abre `/sesion?dia=&fecha=`; la sesión se guarda con esa fecha (última vez, semana y rotación la toman); si ya hay sesión esa fecha, la abre para editar; título "Ayer: Día 1" / "29/10: Día 1"; verificar en dev con Joa logueado cargar la de ayer y que el inicio sugiere el día siguiente; commit (~10k)
- [x] 6.3 Ajustar más limpio (pedido de Joa desde el celu): por defecto solo la lista de bloques; tocar un bloque abre su editor y tocarlo de nuevo lo cierra (cardio siempre abierto); "+ Bloque" oculto por ahora; RPE y nota plegados detrás de un botón "Opcional" (abierto si ya tienen algo; muestra "· RPE 8 · nota"); verificar en dev a 390 px; commit (~4k)
- [x] 6.4 Inicio más limpio (pedido de Joa): "Rutina activa · desde" bajo el nombre; "Ejercicios" y "Editar rutina" plegados con los días detrás de "Ver rutina" (la barra solo queda sin rutina); en "Cargar un día anterior", "Otra fecha" es un chip al lado de Ayer/Anteayer y recién ahí aparece el campo de fecha; verificar en dev a 390 px; commit (~4k)
- [x] 6.5 Ícono unificado con la interfaz (elegido por Joa): mancuernita negra `--ground` sobre naranja `--accent` en `icon.svg` e `icon-maskable.svg`, PNG 192/512/maskable reexportados; deltas de `app-pwa` y `design-system`, `config.yaml`, decisiones y README de design; commit (~4k)

## 7. Critique, accesibilidad y copy (~12k)

> Revisión de las pantallas del MVP 2 contra `design/README.md` y la línea de Joa (simple, limpia por defecto). Joa aprobó los 9 hallazgos (01/11/2026).

- [x] 7.1 Botones de texto secundarios en gris (`.texto.sutil` con `--ink-muted`): Salir, Ver rutina, Cargar un día anterior, Borrar (sesión) y Opcional; el naranja queda para la acción principal y lo elegido; verificar en dev a 390 px; commit (~2k)
- [ ] 7.2 Tarjeta Hoy: los chips de día aparecen recién al tocar un "Cambiar" sutil junto a "Hoy: Día X"; verificar en dev a 390 px; commit (~3k)
- [ ] 7.3 `/sesion`: "+ Agregar ejercicio" como botón de texto sutil en lugar de la caja punteada; verificar en dev a 390 px; commit (~1k)
- [ ] 7.4 Ajustar: "Opcional" pasa a "RPE y nota"; bloques como botones con `aria-expanded` (no `role="radio"`); sin el título repetido del bloque en el editor; verificar en dev a 390 px; commit (~3k)
- [ ] 7.5 Copy: "Cargar Día X del dd/mm" en la hoja del día anterior, resumen "Podés editarla desde el inicio hasta que termine el día." y el inicio sin el título "MancuernApp"; verificar en dev a 390 px; commit (~3k)

## Workflow follow-up

- Critique + accesibilidad + copy de las pantallas nuevas (ciclo de diseño) antes de archivar.
- Archivar el change con `/opsx:archive` cuando Joa confirme la verificación en el celu.
