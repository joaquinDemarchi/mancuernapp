# Design

## Context

`/sesion` marca un ejercicio como hecho desde dos lugares: `tocarCheck` (✓ con última vez, o calentamiento) y el `onguardar` de `HojaAjustar` (primera vez o ajustado); los dos terminan en `guardarRegistro`, que escribe sin `await`. El catálogo (`src/lib/catalogo.ts`) guarda `DatosEjercicio` y la ficha `/ejercicio` edita los saltos con `Stepper` (valor `number | null`). El CSV (`src/lib/csv.ts`) valida un encabezado exacto de 10 columnas. Motivo y alcance: proposal.md; requisitos: specs `descanso`, `catalogo-ejercicios` e `import-export`.

Ciclo de diseño (config.yaml): mockup → Joa elige → handoff a este design.md (§5) → código.

## Goals / Non-Goals

**Goals:**
- El cálculo del tiempo (restante, ajustar, formato M:SS) en funciones puras con tests; la UI solo dibuja.
- Que el timer no dependa de que el `setInterval` corra con la pantalla apagada.
- Archivos CSV viejos (10 columnas) siguen importándose.

**Non-Goals:**
- Service worker o notificaciones para avisar en segundo plano.
- Guardar el timer en Firestore o en el store (vive en la pantalla).

## Decisions

### 1. El timer guarda la hora de fin, no un contador

Estado en `/sesion`: `{ ejercicioId?, duracion, fin }` (ver §2) con `fin = Date.now() + descanso * 1000`. Lo que falta se calcula como `fin - Date.now()` en cada tick (`setInterval` de 250 ms) y al volver a la pestaña (`visibilitychange`). Ajustar suma o resta 15 s a `fin` (sin bajar de 0). Funciones puras en `src/lib/descanso.ts`: `restante(fin, ahora)` (segundos enteros, redondeando hacia arriba, mínimo 0), `formatearDescanso(segundos)` → `"1:30"`.
- Alternativa: contador que resta 1 por segundo. Descartada: el navegador frena los intervalos en segundo plano y el tiempo quedaría atrasado.

### 2. Arranque solo con el botón

Decisión de Joa (04/11/2026, al ver los mockups): el timer también sirve **entre series**, así que no arranca al marcar ✓ ni al guardar en Ajustar; lo abre un botón flotante cuando el usuario quiere. Marcar o destildar ejercicios no lo arranca, no lo corta y no lo cambia.

Duración con la que abre (`duracionSugerida` en `/sesion`): el `descanso` del catálogo del **primer ejercicio sin hacer** de la lista (`filas` sin `registro`); si no tiene, la última duración usada en esta pantalla; si no hubo ninguna, 90 s. Estado: `{ ejercicioId?, duracion, fin }`; `ejercicioId` solo si la duración salió del catálogo (para mostrar su nombre). ±15 s cambia `fin` y `duracion` (mínimo 15 s de duración, `fin` no antes de ahora); "Otra vez" arranca de nuevo con esa `duracion`; la "última usada" es esa `duracion`, en memoria (se pierde al salir de la pantalla).
- Alternativa: arranque automático al marcar hecho (la propuesta original, mockups A/B/C). Descartada por Joa: no sirve para el descanso entre series.

### 3. Pantalla prendida y vibración, si existen

`navigator.wakeLock?.request('screen')` al arrancar; `release()` al terminar, saltar o desmontar la pantalla. El navegador suelta el lock al ocultar la pestaña: en `visibilitychange` a visible, si el timer sigue corriendo, se vuelve a pedir. Al llegar a 0, `navigator.vibrate?.([200, 100, 200])` una sola vez. Sin soporte (p. ej. vibración en iPhone) no hay error ni aviso: el timer anda igual.
- Alternativa: Notification API. Descartada por Joa (pide permiso y en una PWA no es confiable).

### 4. Descanso en el catálogo

`DatosEjercicio.descanso?: number` (segundos, múltiplo de 15, 15–300). Ausente = sin descanso; al guardar la ficha con el descanso vacío se borra la clave (Firestore no acepta `undefined`). Los ejercicios existentes no se migran.

### 5. Columna Descanso en el CSV

`columnas` suma `Descanso` al final. `validar` acepta el encabezado de 10 columnas (sin Descanso) o de 11; valida el valor como entero de segundos (15–300). `planImport` toma el primer descanso no vacío de cada ejercicio nuevo; `armarImport` lo escribe solo en ejercicios nuevos. `escribirCsv` pone el descanso del ejercicio en las filas sin fecha y deja vacío el de las filas con fecha.

### 6. Pantallas (handoff de los mockups)

Mockups: https://claude.ai/artifact/UXk1kejcsFnzjhfpgcvsQK. Elegidas por Joa (04/11/2026): timer **E** (botón flotante + mini timer flotante) y campo **2** (chips + stepper). Descartadas en el canvas: A/B/C (arranque automático), D (botón en la barra + franja) y campo 1 (solo stepper). Tema oscuro de referencia; todo con tokens, así el claro sale solo.

#### `/sesion` — botón "Descanso" (timer cerrado)

- Solo si la sesión no es de solo lectura. `position: fixed`, abajo a la derecha: `right: var(--space-4)`, `bottom` = alto de `BarraAccion` + `var(--space-2)` (con `safe-area-inset-bottom`).
- Botón con ícono de cronómetro (SVG en línea 22 px, trazo 2,5, puntas rectas, `currentColor`: círculo + aguja + botón de arriba, como en el mockup) y la duración sugerida en M:SS (`formatearDescanso`), separados `var(--space-2)`.
- `min-height: var(--touch-primary)`, `padding: 0 var(--space-4)`, sin borde, `background: var(--raised)`, `color: var(--ink)`, `border-radius: var(--radius)`, `box-shadow: var(--elevation-float)`, texto `label` (600 16/24 `--font-text`) con `tabular-nums`. Sin naranja (el naranja queda para "Terminar sesión" y los ✓).
- `aria-label="Abrir descanso de 1:30"`. Foco: anillo `--focus` 2 px, separación 2 px.
- `main` suma `padding-bottom` para que el último ejercicio se pueda scrollear por encima del flotante (el flotante tapa la columna de ✓ si no).

#### `/sesion` — mini timer corriendo

- Reemplaza al botón en el mismo lugar. Caja de 244 px de ancho, `background: var(--raised)`, `box-shadow: var(--elevation-float)`, `border-radius: var(--radius)`, `padding: var(--space-2) var(--space-2) var(--space-2) var(--space-4)`, grid con `gap: var(--space-2)`.
- Fila 1: a la izquierda, en columna, el nombre del ejercicio (`meta`, `--ink-muted`; "Descanso" si la duración no salió del catálogo) y el tiempo que falta en `num-l` (700 40/1 `--font-display`, `--stretch-condensed`, `tabular-nums`); a la derecha, botón de texto "Saltar" (48 px de alto, `--ink`, label).
- Fila 2: dos botones secundarios de 48 px en 2 columnas: "−15 s" (`aria-label="Restar 15 segundos"`) y "+15 s" (`aria-label="Sumar 15 segundos"`); borde 2 px `--control`, fondo transparente, `--ink`.
- Accesibilidad: el contenedor es `role="timer"` con `aria-label="Descanso"` y sin `aria-live` (no anunciar cada segundo); el texto del tiempo es legible al enfocarlo. "Saltar" cierra sin vibrar y vuelve al botón.

#### `/sesion` — terminó

- Misma caja y lugar, invertida: `background: var(--ink)`, texto `var(--ground)` (sirve en los dos temas).
- Arriba "Descanso de 1:30" (`meta`, `--ground`) y "Terminó" (`num-l`, `--ground`).
- Abajo, en 2 columnas: "Otra vez" (secundario 48 px, borde 2 px `--ground`, texto `--ground`) que arranca otra vez con la misma duración, y "Cerrar" (texto, `--ground`) que vuelve al botón.
- `role="status"` para que el lector de pantalla anuncie "Terminó" una vez. Vibración `[200, 100, 200]` al llegar a 0, una sola vez. Se suelta el Wake Lock.

#### `/ejercicio` — campo Descanso (para todos los tipos)

- Va después de los saltos (o del tipo, si el tipo no tiene saltos) y antes de Notas.
- `fieldset` con leyenda "Descanso" (como `OpcionesChip`: `meta`, `--ink-muted`). Radios con aspecto de chip (mismo estilo que `OpcionesChip`; seleccionado = `--accent` + `--on-accent`): **Sin descanso** · **0:45** · **1:00** · **1:30** · **2:00** · **3:00** (valores vacío, 45, 60, 90, 120, 180). Ocupan dos renglones a 390 px.
- Vacío: "Sin descanso" marcado y debajo `meta` (`--ink-faint`): "Es el tiempo con el que abre el timer en la sesión."
- Con valor: debajo de los chips, separado `var(--space-1)`, un `Stepper` (sin etiqueta visible; `aria-label` "Descanso") de 15 a 300 s, paso 15, que muestra M:SS (el `Stepper` actual formatea números: hace falta mostrar M:SS). Si el valor es uno de los chips, ese chip queda marcado; si no (p. ej. 1:15), ningún chip marcado. Debajo `meta`: "Con − / + afinás de a 15 s."
- Tocar "Sin descanso" saca el stepper y al guardar se borra la clave `descanso`.

## Risks / Trade-offs

- [iPhone no vibra desde la web] → el aviso visual de "terminó" es el principal; la vibración es un extra.
- [Con la pantalla bloqueada no hay aviso] → la pantalla prendida lo evita mientras la sesión está abierta; si Joa bloquea el celu, al volver ve que terminó. Notificaciones quedan fuera (proposal).
- [Wake Lock gasta batería] → solo mientras corre el timer y se suelta al terminar.
- [CSV con 11 columnas en otra app vieja] → no aplica: el formato es propio y el de 10 sigue aceptado.

## Migration Plan

Sin migración: `descanso` es opcional. Deploy normal en Vercel con OK de Joa.
