# Design

## Context

MVP 2 dejó las sesiones en `users/{uid}/sesiones` (store `sesiones` en `src/lib/sesion.ts`, suscripto solo a `where('rutinaId','==', activa)`), las funciones puras en `src/lib/calculos.ts` (`ordenar`, `ultimaVez`, `semana`, `volumen`, `formatearVolumen`, `diaMes`, `formatear`) con tests, la pantalla `/sesion?dia=&fecha=` que abre o crea la sesión de cualquier fecha y la borra con confirmación, y la hoja de resumen con el volumen. Los tokens del indicador (`--bajo`, `--optimo`, `--alto` y sus `-tint`) ya están en `design/tokens.css`, y la spec `design-system` exige que el indicador use palabra y forma además del color. Rutas prerenderizadas con `?id=` (`/ejercicio?id=`). Sin librerías de UI ni de gráficos. Motivo y alcance: proposal.md; requisitos: specs `metricas`, `historial` y delta de `sesion`.

Ciclo de diseño (config.yaml): mockup → Joa elige → handoff a este design.md (§6) → código. La sesión de diseño es aparte de la de código.

## Goals / Non-Goals

**Goals:**
- Todas las métricas en funciones puras con tests (lo que se muestra en resumen, historial y evolución sale de las mismas funciones).
- Nada nuevo en Firestore: ni campos guardados ni reglas; todo se calcula en el cliente, también offline.
- La carga en el gym no suma toques: lo nuevo vive en el resumen y en pantallas secundarias.

**Non-Goals:**
- Paginar o virtualizar el historial (con ~4 sesiones por semana son ~200 por año).
- Ejes con escala de fechas reales en el gráfico: los puntos van equiespaciados por vez.

## Decisions

### 1. Leer todas las sesiones del usuario

El store `sesiones` pasa de `where('rutinaId','==', activa)` a la colección entera, ordenada como hoy. La pantalla de sesión, el inicio y la rotación filtran por `rutinaId` donde hoy asumen que todo es de la activa (`diaSugerido`, `semana`, `ultimaVez`, `sesionDeHoy`).
- Alternativa: una segunda suscripción solo para historial/evolución. Descartada: duplica lectura y caché de los mismos documentos.
- Alternativa: dejar el filtro y cruzar rutinas en MVP 4. Descartada: el gráfico cruzando rutinas es justo lo que pide §6 del doc, y hoy hay una sola rutina, así que el cambio es barato ahora.
- Como `diaId` es un UUID por rutina, filtrar por `diaId` ya separa rutinas; el filtro por `rutinaId` solo hace falta donde no hay día (sesión de hoy, rotación).

### 2. Cálculos nuevos en `calculos.ts`

- `volumenEjercicio(registro)`: Σ series × reps × kg de un registro (el `volumen` de sesión pasa a sumarlo).
- `anterior(sesiones, sesion)`: la sesión previa del mismo `diaId` según `ordenar`.
- `crecimiento(actual, previo)`: `(actual − previo) / previo × 100`, `undefined` si no hay previo o es 0.
- `indicador(pct)`: `'bajo' | 'optimo' | 'alto'` con `UMBRALES = { optimoDesde: 0, altoDesde: 10 }` (constante exportada; Óptimo incluye 0 y 10). Se clasifica con el % sin redondear y se muestra redondeado a entero ("+6 %", "−3 %", con signo menos tipográfico).
- `evolucion(sesiones, ejercicioId)`: lista `{ fecha, sesionId, diaId, bloques, volumen? }` de cada vez que se hizo, en orden.
- El % de un ejercicio compara con su registro en `anterior(...)`; si ese ejercicio no se hizo en la anterior, no hay %. (Alternativa: buscar la última vez del ejercicio en ese día aunque se haya salteado una sesión; se puede cambiar en el handoff si Joa lo prefiere, solo toca esta función.)

### 3. Gráfico SVG propio

Un componente `GraficoEvolucion.svelte` dibuja un `<svg>` con `viewBox` fijo y ancho 100 %: línea con puntos equiespaciados, escala Y de mínimo a máximo del volumen con un margen, etiquetas de primer y último valor y fecha, color `--accent`. Un solo punto = un círculo sin línea.
- Alternativa: Chart.js o uPlot. Descartadas: suman 40–70 kB a una PWA que hoy no tiene dependencias de UI, para un único gráfico de línea.
- Accesible: `role="img"` con `aria-label` que resume ("Volumen de Press banca: de 1.800 kg el 01/09 a 2.360 kg el 29/10, 8 veces") y la lista de veces debajo como dato real.

### 4. Rutas y navegación

- `/historial`: lista; cada fila es un link a `/sesion?dia=<diaId>&fecha=<fecha>` (la sesión existente se abre para editar, ya soportado). Borrar desde ahí vuelve con `history.back()` al historial.
- `/evolucion?id=<ejercicioId>`: prerenderizada como `/ejercicio?id=`. Vuelve con `history.back()` (a la sesión, a la ficha o al historial).
- Accesos: fila de la última sesión en el inicio (§6); "Ver evolución" (`.texto.sutil`) en la ficha `/ejercicio?id=` y en `HojaAjustar`.
- Sesiones de rutinas no activas: hoy no existen (archivar es MVP 4). La pantalla de sesión resuelve el día con la rutina activa; si el `diaId` no está, MVP 4 decidirá la vista de solo lectura.

### 5. Componente del indicador

`Indicador.svelte` (`nivel`, `pct`): chip con tint de fondo, forma (▼ Bajo, ● Óptimo, ▲ Alto) y la palabra, para cumplir "no depender solo del color". Lo usan resumen, historial y evolución.

### 6. Pantallas (handoff de los mockups)

Mockups: https://claude.ai/artifact/XiB3ejhR2npTZwMc6bwcLs. Elegidas por Joa (02/11/2026): resumen **A** con el detalle por ejercicio plegado, **sin** % en la lista de la sesión, inicio **B** (fila de la última sesión), lista **B** (agrupada por día) y evolución **A** (volumen). Las clases del canvas (`project/mvp3.css`) son referencia; en la app cada componente lleva sus estilos con tokens.

**Indicador** (`Indicador.svelte`): pastilla con fondo `--{nivel}-tint`, texto `--{nivel}`, forma `▼`/`●`/`▲` con `aria-hidden` y la palabra. Grande (resumen): 32 px de alto, `label` 16/24. Chica (filas): 24 px, `meta` 13/18, `--space-2` de padding. Con %, el texto es "+5 % Óptimo" en la chica de la fila del inicio; en el resumen y el historial el % va aparte, en `heading` condensado.

**Resumen** (hoja de `/sesion`, sobre lo que ya hay):
- Meta igual que hoy ("Día 2 · semana 3 · 6 de 6 ejercicios"), "Volumen" y el número en `num-xl`.
- Debajo, con vez anterior: indicador grande "● Óptimo · +5 %" y al lado, en `meta`, "vs 4.165 kg el 28/10". Sin vez anterior: "Primera vez de Día 2: la próxima vas a ver cuánto subiste." en `meta`.
- Botón sutil "Por ejercicio" (`.texto.sutil`, `aria-expanded`), plegado por defecto. Al abrirlo, una fila por ejercicio de peso hecho, fondo `--raised`: nombre (`label`), valores en `meta` `--ink-muted` y, a la derecha, % en `heading` condensado + indicador chico; sin vez anterior, "primera vez" en `meta`. No aparece si no hay ejercicios de peso.
- "Listo" como hoy.

**Inicio** (debajo de la tarjeta Hoy, antes de los botones sutiles): con sesiones, una fila-link de 64 px, fondo `--surface`: a la izquierda la fecha `dd/mm` en `heading` condensado (52 px), al medio "Última: Día 1" (`label`) y "3.400 kg · ver historial" (`meta`), a la derecha el indicador chico con % y palabra ("● +6 % Óptimo"); sin vez anterior, sin indicador. `aria-label`: "Historial. Última sesión: 31/10, Día 1, 3.400 kg, +6 % Óptimo". Sin sesiones no se muestra.

**Historial** (`/historial`): cabecera con volver y "Historial". Grupos por día de la rutina activa en el orden de la rutina; título del grupo = nombre del día en `heading` condensado `--ink-muted`; los grupos sin sesiones no se muestran; sesiones de un día que ya no existe van al final bajo "Otros días". Filas como la del inicio: fecha, "Semana N" (`label`) y volumen (`meta`), y a la derecha % en `heading` + indicador chico con la palabra, o "primera vez" en `meta`. Toda la fila es un link a `/sesion?dia=&fecha=`. Vacío: "Todavía no hay sesiones" (`heading`) y "Cuando cargues la primera, aparece acá con su volumen." centrados.

**Evolución** (`/evolucion?id=`): cabecera con volver, nombre del ejercicio como título y meta "Peso · 8 veces desde 02/09". "Volumen por vez" (`label`) y el gráfico en una tarjeta `--surface`: línea de 3 px y puntos de r 4 en `--accent-ink` (el último r 6), base en `--raised`, cambio de rutina con línea punteada `--control` y el nombre de la rutina en 12 px `--ink-faint`; pie con primer y último valor ("**1.600 kg** · 02/09" … "**2.360 kg** · 02/11"). Debajo "Cada vez" y filas de la más nueva a la más vieja: fecha, día (y rutina si no es la activa), bloques con `formatear` y el volumen a la derecha. Tipos sin peso: sin gráfico ni volumen, solo las filas.

**Ver evolución**: botón sutil a la derecha del nombre en la cabecera de `HojaAjustar`, y otro en la ficha `/ejercicio?id=` (solo si el ejercicio ya existe).

## Risks / Trade-offs

- [El % de sesión compara totales aunque cambien los ejercicios (un extra o uno salteado distorsionan)] → Se acepta: es lo que hacía el Excel por fila y el % por ejercicio, al lado, muestra el detalle. Si molesta en el uso real, comparar solo ejercicios presentes en ambas sesiones (solo cambia `crecimiento` de sesión).
- [Leer todas las sesiones crece con los años] → ~200 documentos chicos por año, en caché offline; revisar si pasa de ~1.000.
- [Cambiar la suscripción puede romper la rotación o la sesión de hoy si queda un lugar sin filtrar por rutina] → Tests de `diaSugerido`/`sesionDeHoy` con sesiones de otra rutina antes de tocar el store.
- [Kg decimales (62,5) en volumen y %] → Ya se formatean con `Intl` es-AR; tests con decimales.

## Migration Plan

Sin migración de datos. Deploy normal desde `main` con OK de Joa; rollback = revertir el commit, los datos no cambian.
