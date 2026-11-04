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

Componente nuevo `GraficoSemanas.svelte` (props: la lista de `porSemana`). Barras con `div` flex (no SVG: alturas en px calculadas, más simple de estilar con tokens), con las sesiones de cada semana como número debajo (§8). Decisión de Joa (04/11/2026, opción 1 del tablero "Todo"): **siempre una barra por semana**, también con "Todo"; con muchas semanas las barras se angostan (gap 2 px) y las etiquetas de fecha y kg se reemplazan por 5 marcas de mes repartidas debajo. Umbral: más de 13 semanas = modo angosto (sin kg arriba ni número de sesiones abajo). Accesible: las barras con `aria-hidden` y una lista visualmente oculta con "Semana del 27/10: 13.400 kg, 4 sesiones" por semana (spec "Volumen por semana").
- Alternativa: agrupar por mes con "Todo" (opción 2 del tablero). Descartada por Joa.

### 8. Pantallas (handoff de los mockups)

Mockups: https://claude.ai/artifact/Pm8cYCQe51qkh1nFvNNMkx. Elegidas por Joa (04/11/2026): **A** (tarjetas apiladas), barras por semana (opción 1 de "Todo") y enlace **1** (link sutil en el inicio). Descartadas: B (racha grande + pestañas), C (semanas en filas + lista única de ejercicios), barras por mes y fila propia en el inicio. Tema oscuro de referencia; todo con tokens.

#### Inicio — enlace "Resumen"

- Un `a.texto.sutil` más en `.enlaces` del inicio, después de "Cargar un día anterior" y antes de "Importar y exportar"; también en las dos ramas sin rutina activa, al lado de "Historial". Texto: "Resumen". Sin ícono.

#### `/resumen` — de arriba a abajo

`main.pantalla`, margen lateral `--space-4`, bloques separados `--space-4`.

1. **Cabecera**: `<Cabecera titulo="Resumen" volver="/" />` (sin `atras`: siempre vuelve al inicio).
2. **Período**: `OpcionesChip` con `leyenda="Período"` (leyenda en `meta`, `--ink-faint`) y opciones "Rutina activa" / "3 meses" / "Todo" (sin rutina activa, solo las dos últimas). Los tres chips del mismo ancho (`flex: 1`), `min-height: var(--touch-min)`. Activo: `--ink` de fondo y `--ground` de texto, como en el mockup; si `OpcionesChip` ya tiene otro estilo de activo, se usa el suyo (consistencia con el resto de la app).
3. **Constancia** (tarjeta `--surface`, `--radius`, padding `--space-4`, dos columnas `flex: 1`): número en `--fs-num-l` 700 condensado `tabular-nums` + `meta` debajo. Izquierda: racha ("5" / "semanas seguidas yendo"; con 1: "semana seguida yendo"; con 0: "0" en `--ink-muted` / "semanas seguidas"). Derecha: promedio del período con una decimal ("2,7" / "sesiones por semana").
4. **Volumen por semana** (tarjeta): título `h2` en `--fs-heading` 600 condensado. Gráfico de §7, alto de dibujo 96 px + 20 px para el kg arriba de cada barra (`meta` `--ink-muted`, en miles con una decimal: "13,4"; 0 = "0"). Barras `--accent`, la semana en curso `--control`; base con borde inferior 1 px `--control`; semana sin sesiones = barra de 2 px. Debajo de cada barra: lunes (`meta`, "27/10") y número de sesiones (`label`, `tabular-nums`). Nota al pie (`meta`): "Semanas de lunes a domingo · abajo, sesiones de cada semana" y, si la última es la actual, "· la del 03/11 está en curso".
5. **Progreso por ejercicio** (tarjeta): `h2` + `meta` "Última vez vs primera vez del período". Filas `a` de `min-height: var(--touch-primary)` separadas por borde superior 1 px `--raised`: nombre (`label`), `<Indicador pct chico conPct />` y chevron 20 px `--ink-faint`. `href="/evolucion?id=…"`. Sin ejercicios que califiquen: `meta` "Hacé un ejercicio de peso dos veces en este período para ver su progreso."
6. **Mejores marcas** (tarjeta): `h2`; filas de ≥ 56 px con borde superior `--raised`: izquierda nombre (`label`) y debajo el detalle en `meta` (peso: "Mayor volumen: 3.150 kg · 30/10"; reps: "Reps en una serie"; tiempo: "Segundos en una serie"; cardio: "Minutos"); derecha el valor en `--fs-heading` 700 condensado (`"100 kg × 5"`, `"11 reps"`, `"60 s"`, `"25 min"`) y la fecha `meta` debajo, alineados a la derecha. Orden alfabético. Las filas no son tocables.
7. **Período vacío**: debajo de la tarjeta de constancia (que sigue), en lugar de los bloques 4–6, texto centrado: "No hay sesiones en este período" (`--fs-heading` 600 condensado) y `meta` "Cuando cargues una sesión, aparece acá." (con rutina activa recién empezada y período "Rutina activa": "Rutina N empezó hace poco. Mirá “3 meses” o “Todo”.").

Textos de lector de pantalla: la lista oculta del gráfico (§7); el indicador ya lleva palabra y forma.

## Risks / Trade-offs

- [Muchas semanas en "Todo" achican las barras hasta no leerse] → modo angosto de §7 (se lee la tendencia, no cada valor); la lista oculta sigue teniendo todos los datos.
- [El indicador Bajo/Óptimo/Alto está pensado para sesión vs sesión; aplicado a varias semanas, un +25 % sano da "Alto"] → Joa lo eligió así; si en los mockups se lee como alarma, se cambia el texto o se saca el indicador sin tocar el cálculo (una línea en la spec).
- [Semana con zona horaria] → fechas siempre locales `AAAA-MM-DD`, nunca `toISOString()`; tests con domingo/lunes y cambio de mes.
- [Ejercicios borrados del catálogo con sesiones] → se saltean en marcas y progreso (no hay tipo ni nombre), igual que hoy en `evolucion`.

## Migration Plan

Solo cliente: deploy normal en Vercel. Sin datos nuevos; rollback = revertir el commit.
