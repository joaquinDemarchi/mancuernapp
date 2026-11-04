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

Estado en `/sesion`: `{ ejercicioId, fin }` con `fin = Date.now() + descanso * 1000`. Lo que falta se calcula como `fin - Date.now()` en cada tick (`setInterval` de 250 ms) y al volver a la pestaña (`visibilitychange`). Ajustar suma o resta 15 s a `fin` (sin bajar de 0). Funciones puras en `src/lib/descanso.ts`: `restante(fin, ahora)` (segundos enteros, redondeando hacia arriba, mínimo 0), `formatearDescanso(segundos)` → `"1:30"`.
- Alternativa: contador que resta 1 por segundo. Descartada: el navegador frena los intervalos en segundo plano y el tiempo quedaría atrasado.

### 2. Arranque en un solo lugar

Una función `arrancarDescanso(ejercicioId)` en `/sesion` que mira `ejercicio(id)?.descanso` y, si hay, pone el timer. Se llama desde `tocarCheck` cuando el ✓ guarda (no cuando quita) y desde el `onguardar` de Ajustar solo si el ejercicio no estaba hecho antes de abrir la hoja. Así editar uno ya hecho no lo arranca.

### 3. Pantalla prendida y vibración, si existen

`navigator.wakeLock?.request('screen')` al arrancar; `release()` al terminar, saltar o desmontar la pantalla. El navegador suelta el lock al ocultar la pestaña: en `visibilitychange` a visible, si el timer sigue corriendo, se vuelve a pedir. Al llegar a 0, `navigator.vibrate?.([200, 100, 200])` una sola vez. Sin soporte (p. ej. vibración en iPhone) no hay error ni aviso: el timer anda igual.
- Alternativa: Notification API. Descartada por Joa (pide permiso y en una PWA no es confiable).

### 4. Descanso en el catálogo

`DatosEjercicio.descanso?: number` (segundos, múltiplo de 15, 15–300). Ausente = sin descanso; al guardar la ficha con el descanso vacío se borra la clave (Firestore no acepta `undefined`). Los ejercicios existentes no se migran.

### 5. Columna Descanso en el CSV

`columnas` suma `Descanso` al final. `validar` acepta el encabezado de 10 columnas (sin Descanso) o de 11; valida el valor como entero de segundos (15–300). `planImport` toma el primer descanso no vacío de cada ejercicio nuevo; `armarImport` lo escribe solo en ejercicios nuevos. `escribirCsv` pone el descanso del ejercicio en las filas sin fecha y deja vacío el de las filas con fecha.

### 6. Pantallas (handoff de los mockups)

Pendiente del ciclo de diseño (tarea 1.2): dónde se ve el timer en `/sesion` (sobre la barra "Terminar sesión", en la fila del ejercicio u hoja), estado "terminó", y cómo se edita el descanso en la ficha (stepper con opción "Sin descanso" u otra).

## Risks / Trade-offs

- [iPhone no vibra desde la web] → el aviso visual de "terminó" es el principal; la vibración es un extra.
- [Con la pantalla bloqueada no hay aviso] → la pantalla prendida lo evita mientras la sesión está abierta; si Joa bloquea el celu, al volver ve que terminó. Notificaciones quedan fuera (proposal).
- [Wake Lock gasta batería] → solo mientras corre el timer y se suelta al terminar.
- [CSV con 11 columnas en otra app vieja] → no aplica: el formato es propio y el de 10 sigue aceptado.

## Migration Plan

Sin migración: `descanso` es opcional. Deploy normal en Vercel con OK de Joa.
