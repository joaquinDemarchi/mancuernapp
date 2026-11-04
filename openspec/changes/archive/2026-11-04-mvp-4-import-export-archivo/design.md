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

Las filas del historial pasan a linkear `/sesion?dia=&fecha=&rutina=<id>&desde=historial`. `/sesion` toma la rutina de `?rutina=` (default la activa), busca el día en esa rutina y la sesión con `sesionDeHoy(…, fecha, rutinaId)`. Si la rutina está archivada, la pantalla queda en solo lectura y se ve como el resumen (volumen, % e indicador por ejercicio, §7): sin ✓ ni Ajustar, sin "+ Agregar ejercicio", sin "Borrar" y sin barra de acción. El grupo "Otros días" del MVP 3 desaparece: cada sesión cae en su rutina.

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

Export y plantilla: `Blob` con `text/csv;charset=utf-8` y un `<a download>` temporal; nombre `mancuernapp-AAAA-MM-DD.csv` y `mancuernapp-plantilla.csv`. Import: `<input type="file" accept=".csv,text/csv">` y `file.text()`. Los botones viven en la pantalla nueva `/datos` (§7).

### 7. Pantallas (handoff de los mockups)

Canvas: https://claude.ai/artifact/68rdozFVjMZ2SRW6vSFFhw (privado). Elección de Joa (03/11/2026): **1A** pantalla `/datos`, **2B** revisión con solo lo que hay que decidir, **con rutina activa A** (elegir en la revisión), **3B** terminar con "tocá de nuevo", **inicio A** centrado, **4B** archivadas plegadas y **sesión B** como el resumen. Solo tokens de `design/tokens.css` y componentes que ya existen (`Boton`, `BarraAccion`, `Hoja`, `Indicador`, `.texto.sutil`); clases nuevas de referencia en `project/mvp4.css` del canvas. Números con `--font-display` + `--stretch-condensed` + `tabular-nums`; meta en `--fs-meta` `--ink-faint`.

**Inicio (`/`)**
- Con rutina activa: en `.enlaces`, link sutil "Importar y exportar" → `/datos`, después de "Ver rutina" y "Cargar un día anterior".
- Sin activa y con archivadas (inicio A): cabecera "MancuernApp" + "Salir"; centro como el estado vacío (`.empty`, `--ink-muted`): h2 "Sin rutina activa" en `--ink`; "{última} terminó el {fin DD/MM} con {n} sesiones."; meta "La nueva arranca con sus {d} días y ejercicios; después la cambiás."; links sutiles centrados "Historial" e "Importar y exportar". `BarraAccion` con primario "Nueva rutina" → `nuevaRutina()` y abre `/rutina`.
- Sin ninguna rutina: "Crear rutina" como hoy, más el link sutil "Importar y exportar".

**Importar y exportar (`/datos`, nueva)**
- Cabecera con volver y título "Importar y exportar". Sin `BarraAccion`.
- Título de sección (600 `--fs-meta`, `--ink-muted`) "Sacar tus datos": fila "Exportar todo", meta "{r} rutinas · {s} sesiones · un CSV para Excel", ícono de descarga a la derecha en `--ink-faint`.
- "Traer rutinas y sesiones": fila "Importar CSV" (es el `<label>` de un `<input type="file" accept=".csv,text/csv">` visualmente oculto), meta "Antes de guardar ves qué se crea", ícono de subida; fila "Descargar plantilla", meta "Columnas y filas de ejemplo para llenar".
- Pie en meta: "Filas sin fecha arman los días de una rutina; filas con fecha son sesiones hechas. Separador «;» y coma decimal."
- Fila (`.dato`): botón a todo el ancho, `min-height: 56px`, padding `--space-2` `--space-4`, fondo `--surface`, `--radius`; título 600 `--fs-body`, meta debajo.

**Revisión del import (en `/datos`, reemplaza el contenido al elegir el archivo)**
- Cabecera: volver (aria-label "Cancelar"), título "Revisar import", meta "{archivo} · {n} filas".
- Tarjeta resumen (`--surface`, padding `--space-4`): h2 "{x} rutinas nuevas y {s} sesiones" (singular/plural; sin rutinas nuevas, "{s} sesiones"); debajo una línea meta por rutina con el nombre en `--ink`: "· nueva · {d} días", "· archivada · {s} sesiones" o "· {s} sesiones más" (si ya existe).
- "Para decidir" (solo si hay algo): por cada parecido una caja `--surface` con el nombre del CSV, meta "¿Es «{nombre del catálogo}» de tu catálogo?" y dos chips "Es el mismo" / "Crear nuevo" (`aria-pressed`, ninguno elegido de entrada, el elegido en `--accent`). Si hay rutina activa y el CSV trae una rutina sin fechas: `fieldset` con legend "Tenés {activa} activa" y dos radios (`.radio` del MVP 1): "Terminar {activa} y empezar esta" (meta "{activa} pasa al historial con fin hoy", marcado de entrada) y "Guardarla archivada" (meta "Seguís con {activa}; la activás después desde el historial").
- "Detalle": filas plegables (botón con `aria-expanded` y chevron `--ink-faint`, `min-height: 64px`, `--surface`), solo las que tienen algo: "{n} ejercicios nuevos" (meta con los nombres), "{n} ya están en tu catálogo" (meta con los primeros nombres y "…"), "{n} fecha se saltea" / "{n} fechas se saltean" (meta "{rutina}: {DD/MM} ya tiene sesión"). Desplegadas listan uno por línea.
- `BarraAccion` de dos columnas: secundario "Cancelar" (no escribe nada, vuelve a `/datos`) y primario "Importar", deshabilitado mientras falte decidir un parecido, con la meta de la barra "Falta decidir {n} ejercicio(s)". Al importar se vuelve a `/` (sin pantalla de éxito; no está en el mockup).
- Con errores (mismo lugar, sin resumen): h2 "{n} filas con error" (`role="alert"`), texto `--ink-muted` "Corregilas en el archivo y volvé a elegirlo. No se guardó nada.", una caja por fila (fondo `--alto-tint`, "Fila {línea}" en `--alto` 600, motivo en `--ink`) y meta "Las otras {m} filas están bien."; barra: "Cancelar" y primario "Elegir otro archivo" (label del input). Mensajes: "Series tiene que ser un número («tres»)", "La fecha «31/09/2026» no existe", "Tipo «pesas» no es válido: peso, reps, tiempo, cardio o calentamiento".

**Editar rutina (`/rutina`): terminar (3B)**
- Debajo del panel del día, botón sutil "Terminar rutina" (alineado a la izquierda). Primer toque: aparece el texto `--ink-muted` con `role="alert"` "{nombre} pasa al historial con fin hoy y sus {n} sesiones quedan. Tocá de nuevo para terminarla." y el botón pasa a secundario a todo el ancho "Sí, terminar rutina". Segundo toque: `terminarRutina()` y vuelve a `/` (inicio A). Mismo patrón que "Borrar día" (`confirmando`); se resetea al salir de la pantalla. La barra "Agregar ejercicio" sigue igual.

**Historial (`/historial`, 4B)**
- Los grupos por día de la rutina activa quedan como en el MVP 3.
- Si hay archivadas: título de sección "Rutinas anteriores" (600 `--fs-meta`, `--ink-muted`, `margin-top: --space-4`). Por cada una, de la más nueva a la más vieja, un botón plegado de entrada (`aria-expanded`, `min-height: 64px`, `--surface`): nombre (600 `--fs-body`), meta "{inicio} – {fin} · {n} sesiones" y chevron abajo/arriba en `--ink-faint`.
- Desplegada: todas sus sesiones, de la más nueva a la más vieja, con la fila `.hist` del MVP 3 sobre `--raised`; donde la activa dice "Semana N" va el día ("Día 3") y la meta es "semana {N} · {vol} kg". Debajo, sutil "Volver a esta rutina".
- "Volver a esta rutina" abre una `Hoja`: título "¿Volver a {nombre}?", texto `--ink-muted` "{nombre} vuelve a ser la activa y sigue donde la dejaste (te toca {día}). {activa} pasa al historial con fin hoy." (sin activa, sin la segunda oración), primario a todo el ancho "Volver a {nombre}" y sutil centrado "Cancelar". Al confirmar: `volverARutina(id)` y vuelve a `/`.

**Sesión de una rutina archivada (`/sesion?…&rutina=`, sesión B)**
- Cabecera: volver (aria-label "Volver al historial"), título "{día} · {DD/MM}", meta "{rutina} (archivada) · semana {N}".
- Bloque del resumen del MVP 3: label "Volumen", "{vol} kg" en `--fs-num-xl`, `Indicador` grande con el % y meta "vs {vol anterior} kg el {DD/MM}" (sin vez anterior, sin indicador).
- "Por ejercicio": las filas del resumen (nombre, valores en meta y, solo los de peso con vez anterior, % + indicador chico a la derecha).
- Pie en meta: "Para corregirla, volvé a {rutina} desde el historial."
- Sin ✓, Ajustar, "+ Agregar ejercicio", "Borrar" ni `BarraAccion`. Conviene reusar el componente del resumen.

## Risks / Trade-offs

- [Un CSV grande (meses del Excel) supera 500 escrituras por lote] → lotes de 450; cada lote es atómico, si se corta a mitad quedan lotes completos (se informa cuántas sesiones entraron).
- [Excel puede cambiar fechas o decimales al guardar] → se aceptan los dos formatos de fecha y coma o punto decimal; los errores dicen la fila.
- [Emparejar mal un ejercicio mezcla evoluciones] → la revisión muestra cada emparejamiento antes de guardar; los parecidos nunca se emparejan solos.
- [Copiar con ids nuevos rompe la relación "mismo día" entre rutinas] → se acepta: el % compara dentro de la rutina; la evolución cruza rutinas por ejercicio, no por día.
- [Dos activas si falla a mitad un cambio de rutina] → `volverARutina` en un solo `writeBatch`.

## Migration Plan

Sin migración: los documentos existentes ya tienen `estado: 'activa'`. Deploy normal desde `main` con OK de Joa; rollback = revertir el commit (lo importado queda como datos normales).
