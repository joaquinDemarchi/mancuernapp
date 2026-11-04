# Design

## Context

Las sesiones viven en el store `sesiones` (`src/lib/sesion.ts`), todas, ordenadas de la más vieja a la más nueva; el tipo de cada ejercicio sale del catálogo (`ejercicios`). `src/lib/calculos.ts` ya tiene `volumenEjercicio`, `volumen`, `crecimiento`, `indicador` (con `UMBRALES`), `formatearPct`, `formatearVolumen`, `diaMes`, `hoy` y `diasAntes`. `/evolucion?id=…` usa `Cabecera` con `atras` (vuelve con `history.back()`), así que vuelve solo a donde se abrió. `GraficoEvolucion.svelte` es un SVG de línea con `viewBox` fijo; no hay gráfico de barras. Motivo y alcance: proposal.md; requisitos: specs `resumen` y `metricas`.

Ciclo de diseño (config.yaml): mockup → Joa elige → handoff a este design.md (§6) → código. Diseño y código en sesiones separadas.

## Goals / Non-Goals

**Goals:**
- Todos los cálculos del resumen en funciones puras de `calculos.ts` con tests; la pantalla solo dibuja.
- Rápido con todo el historial: una pasada por las sesiones del período por bloque, sin índices ni caché.
- Anda offline, sin lecturas nuevas a Firestore.

**Non-Goals:**
- Librería de gráficos (SVG a mano, como `GraficoEvolucion`).
- Persistir el período elegido entre visitas (vuelve al default al entrar de nuevo).

## Decisions

### 1. Período: filtro por fecha antes de calcular

`desdePeriodo(periodo, rutinaActiva, hoy)` → fecha `AAAA-MM-DD` de inicio o `undefined` (Todo): "rutina" = `rutinaActiva.inicio`; "3m" = `diasAntes(90)` (91 días contando hoy). Las sesiones del período son las de `fecha >= desde`; como son strings ISO, se comparan con `>=`. "Rutina activa" filtra por fecha, no por `rutinaId`: las sesiones de otra rutina en esas fechas no existen (una sola activa).
- Alternativa: filtrar por `rutinaId`. Da lo mismo hoy y la fecha es una sola regla para los tres períodos.

### 2. Semana = lunes de esa fecha

`lunes(fecha)` → `AAAA-MM-DD` del lunes de esa semana, con `Date` local (`new Date(a, m-1, d)`, sin UTC para no correrse un día). `porSemana(sesiones, tipoDe, desde?, hasta)` → `{ semana, volumen, sesiones }[]` de la más vieja a la más nueva, rellenando con 0 las semanas sin sesiones entre la primera semana con sesiones del período y la actual. Volumen y sesiones por semana salen de la misma lista (un solo recorrido).
- Alternativa: semanas ISO con número ("S44"). Descartada: "sem. del 27/10" se lee sin pensar.

### 3. Racha sobre todas las sesiones

`racha(sesiones, hoy)`: arma el conjunto de lunes con sesiones; arranca en la semana actual si tiene sesión, si no en la anterior, y cuenta hacia atrás mientras haya. No depende del período (la constancia es "hasta hoy").

### 4. Mejores marcas por tipo

`mejoresMarcas(sesiones, catalogo)` → por ejercicio (orden alfabético, como el catálogo) `{ ejercicioId, marcas: { etiqueta, valor, fecha }[] }`. Peso: el bloque con más kg (empate: más reps; después la fecha más vieja) y el mayor `volumenEjercicio`; reps: mayor `reps`; tiempo: mayor `segundos`; cardio: mayor `minutos`; calentamiento: se saltea. Compara con `>` estricto recorriendo de la más vieja a la más nueva, así la fecha que queda es la primera vez que se logró.
- Alternativa: 1RM estimado. Fuera de alcance (ítem de v2 aparte).

### 5. Progreso: primera vs última vez del período, con el mismo indicador

`progreso(sesiones, catalogo)` → ejercicios de peso con ≥ 2 veces en el período y volumen > 0 la primera vez: `{ ejercicioId, primera, ultima, pct }`, ordenados por `pct` de mayor a menor. Reusa `evolucion` (filtrada) y `crecimiento`; el indicador usa `indicador(pct)` con los `UMBRALES` de siempre (decisión de Joa).

### 6. Período en la URL

`/resumen?periodo=rutina|3m|todo`. Al cambiar el selector se usa `goto(…, { replaceState: true, keepFocus: true, noScroll: true })`, así volver desde `/evolucion` (que usa `history.back()`) restaura el período y la flecha de `/resumen` vuelve al inicio sin pasar por cada período. Sin parámetro (o "rutina" sin rutina activa) se usa el default.
- Alternativa: estado solo en el componente. Descartada: al volver de la evolución se perdería la elección (escenario de `metricas`).

### 7. Gráfico de barras

Componente nuevo `GraficoSemanas.svelte` (SVG con `viewBox` fijo como `GraficoEvolucion`, barras con tokens del design system). Muestra volumen; las sesiones por semana van en el mismo bloque o aparte según el mockup. Con muchas semanas (p. ej. "Todo" con un año) las barras se angostan; si el mockup elegido pide otra cosa (scroll horizontal o agrupar por mes) se decide en el handoff sin cambiar las specs. Accesible: el SVG con `aria-hidden` y una tabla o lista visualmente oculta con semana y kg (spec "Volumen por semana").

### 8. Pantallas (handoff de los mockups)

Pendiente: lo completa la tarea 1.2 con la variante que elija Joa (orden de los bloques, cómo se ve el selector, la racha y las marcas, textos y tokens).

## Risks / Trade-offs

- [Muchas semanas en "Todo" achican las barras hasta no leerse] → decidir en los mockups (límite visual, scroll o agrupar por mes); la lista oculta sigue teniendo todos los datos.
- [El indicador Bajo/Óptimo/Alto está pensado para sesión vs sesión; aplicado a varias semanas, un +25 % sano da "Alto"] → Joa lo eligió así; si en los mockups se lee como alarma, se cambia el texto o se saca el indicador sin tocar el cálculo (una línea en la spec).
- [Semana con zona horaria] → fechas siempre locales `AAAA-MM-DD`, nunca `toISOString()`; tests con domingo/lunes y cambio de mes.
- [Ejercicios borrados del catálogo con sesiones] → se saltean en marcas y progreso (no hay tipo ni nombre), igual que hoy en `evolucion`.

## Migration Plan

Solo cliente: deploy normal en Vercel. Sin datos nuevos; rollback = revertir el commit.
