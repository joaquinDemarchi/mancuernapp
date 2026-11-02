# Design

## Context

Hoy `src/lib/rutina.ts` lee solo la rutina activa (`where('estado','==','activa'), limit(1)`); el modelo ya tiene `estado` y `fin?`, pero nada escribe "archivada". El store `sesiones` (MVP 3) ya lee todas las sesiones del usuario y `/historial` agrupa las que no son de la rutina activa en "Otros días" sin poder abrirlas, porque `/sesion` resuelve el día con la rutina activa. `src/lib/texto.ts` tiene `normalizar`, `parecidos` y `esDuplicado` (los usa el catálogo para avisar duplicados). Las escrituras no esperan respuesta (`setDoc`/`updateDoc` sin `await`) para que todo funcione offline. Motivo y alcance: proposal.md; requisitos: specs `import-export`, `rutina` y `historial`.

Ciclo de diseño (config.yaml): mockup → Joa elige → handoff a este design.md (§7) → código.

## Goals / Non-Goals

**Goals:**
- Leer, validar y armar el import en funciones puras con tests; la UI solo muestra el plan y lo escribe.
- Export e import son inversos: exportar e importar en una cuenta vacía deja los mismos datos (test de ida y vuelta).
- Nada nuevo en Firestore ni en las reglas.

**Non-Goals:**
- Detectar el separador o leer CSV de otras apps (solo la plantilla propia; se acepta coma decimal o punto).
- Deshacer un import (se puede volver a importar o borrar sesiones; borrar una rutina importada queda fuera).

## Decisions

### 1. Store con todas las rutinas

`rutina.ts` lee la colección entera en un store `rutinas` (ordenadas por `inicio`) y `rutinaActiva` pasa a derivarse de ese store (la que tiene `estado: 'activa'`, o `null`). Mismo criterio que las sesiones en el MVP 3: una sola suscripción, en caché offline, pocos documentos.
- Alternativa: segunda consulta solo para archivadas. Descartada: duplica la lectura y complica el "volver a esta rutina".

### 2. Archivar, nueva copiando y volver

- `terminarRutina()`: `updateDoc` con `estado: 'archivada'`, `fin: hoy`.
- `nuevaRutina()`: copia `dias` de la última archivada (por `fin`) con **ids de día nuevos** (`crypto.randomUUID()`): las sesiones viejas referencian los ids viejos, así "semana N" y la rotación empiezan de cero en la nueva. Nombre `Rutina ${rutinas.length + 1}`, inicio hoy.
- `volverARutina(id)`: `writeBatch` con la activa → archivada (fin hoy) y la elegida → activa (sin `fin`), así nunca hay dos activas.
- En el inicio, sin activa: con archivadas el botón principal es "Nueva rutina"; sin ninguna, "Crear rutina" como hoy.

### 3. Sesiones de rutinas archivadas

Las filas del historial pasan a linkear `/sesion?dia=&fecha=&rutina=<id>&desde=historial`. `/sesion` toma la rutina de `?rutina=` (default la activa), busca el día en esa rutina y la sesión con `sesionDeHoy(…, fecha, rutinaId)`. Si la rutina está archivada, la pantalla queda en solo lectura: filas sin ✓ ni Ajustar, sin "+ Agregar ejercicio", sin "Borrar" y sin barra de acción. El grupo "Otros días" del MVP 3 desaparece: cada sesión cae en su rutina.

### 4. CSV propio, a mano

`src/lib/csv.ts`, funciones puras:
- `leerCsv(texto)`: saca el BOM, separa por `;` respetando comillas, devuelve filas con su número de línea.
- `validar(filas)`: encabezado exacto (sin importar mayúsculas/tildes), números (`62,5` o `62.5`), fecha `DD/MM/AAAA` o `AAAA-MM-DD`, tipo de la lista (vacío → `peso` si hay Kg, si no `reps`); devuelve errores `{ linea, mensaje }`.
- `planImport(filas, { ejercicios, rutinas, sesiones })`: agrupa por rutina → día → ejercicio (sin fecha = items con objetivo) y por rutina+fecha+día (con fecha = sesión con registros y bloques en orden); empareja ejercicios con `esDuplicado` y propone `parecidos`; marca fechas que ya tienen sesión en esa rutina. Devuelve qué crear, sin ids de Firestore.
- `escribirCsv({ rutinas, sesiones, ejercicios })`: una fila por item de cada día (sin fecha) y una por bloque de cada registro (con fecha `DD/MM/AAAA`), números con `Intl` es-AR sin separador de miles, BOM al principio.
- Alternativa: SheetJS para .xlsx. Descartada por Joa (solo CSV) y suma ~400 kB.

### 5. Escritura del import

La UI completa el plan con las elecciones de la revisión (crear o emparejar cada ejercicio nuevo; si hay activa y se importa una rutina sin fechas: terminar la activa o guardar la nueva archivada), genera ids con `doc(coleccion())` y escribe todo con `writeBatch` en lotes de hasta 450 operaciones, sin `await` (offline). Las sesiones importadas van con `terminada: true` y `creada: serverTimestamp()`.

### 6. Descarga y carga de archivos

Export y plantilla: `Blob` con `text/csv;charset=utf-8` y un `<a download>` temporal; nombre `mancuernapp-AAAA-MM-DD.csv` y `mancuernapp-plantilla.csv`. Import: `<input type="file" accept=".csv,text/csv">` y `file.text()`. Dónde viven los botones (pantalla `/datos` o hoja desde "Ver rutina") lo decide el mockup.

### 7. Pantallas (handoff de los mockups)

Pendiente: se completa en la tarea 1.2 con la variante que elija Joa (dónde van Importar/Exportar, revisión del import, "Terminar rutina", "Nueva rutina", grupos archivados y sesión en solo lectura).

## Risks / Trade-offs

- [Un CSV grande (meses del Excel) supera 500 escrituras por lote] → lotes de 450; cada lote es atómico, si se corta a mitad quedan lotes completos (se informa cuántas sesiones entraron).
- [Excel puede cambiar fechas o decimales al guardar] → se aceptan los dos formatos de fecha y coma o punto decimal; los errores dicen la fila.
- [Emparejar mal un ejercicio mezcla evoluciones] → la revisión muestra cada emparejamiento antes de guardar; los parecidos nunca se emparejan solos.
- [Copiar con ids nuevos rompe la relación "mismo día" entre rutinas] → se acepta: el % compara dentro de la rutina; la evolución cruza rutinas por ejercicio, no por día.
- [Dos activas si falla a mitad un cambio de rutina] → `volverARutina` en un solo `writeBatch`.

## Migration Plan

Sin migración: los documentos existentes ya tienen `estado: 'activa'`. Deploy normal desde `main` con OK de Joa; rollback = revertir el commit (lo importado queda como datos normales).
