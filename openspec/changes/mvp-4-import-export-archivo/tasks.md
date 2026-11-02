# Tasks

> Cada tarea: commit local + `[x]` acá + actualizar `traspaso.md`. Costo estimado entre paréntesis.
> Total estimado: ~120k tokens (8 grupos). Push y deploy solo con OK de Joa. Diseño en una sesión aparte del código (grupo 1).

## 1. Diseño (sesión de diseño, ~20k)

- [ ] 1.1 Mockups en un Artifact Design (tokens de `design/tokens.css`, 390 px, tema oscuro) con 2–3 variantes numeradas de: dónde van Importar / Exportar todo / plantilla (pantalla `/datos` vs hoja desde "Ver rutina"); revisión del import (resumen, errores por fila, emparejamiento); "Terminar rutina" con confirmación; inicio sin activa con "Nueva rutina"; historial con grupos archivados y "Volver a esta rutina"; sesión en solo lectura; verificar que Joa tiene el link; commit del link en `traspaso.md` (~15k)
- [ ] 1.2 Con la elección de Joa, handoff a design.md §7 (pantalla por pantalla, textos y tokens); si cambia algo de las specs, actualizar los deltas y verificar `openspec validate mvp-4-import-export-archivo --strict`; commit (~5k)

## 2. Rutinas archivadas (~15k)

- [ ] 2.1 `rutina.ts` con store `rutinas` (todas) y `rutinaActiva` derivada; `terminarRutina`, `nuevaRutina` (copia con ids de día nuevos, "Rutina N+1") y `volverARutina` (un `writeBatch`); la copia en una función pura con test (días, items y objetivos iguales, ids distintos); verificar `npm test`, `npm run check` y en dev con stores falsos que el inicio, la tarjeta Hoy y Editar rutina siguen iguales con una activa; commit (~10k)
- [ ] 2.2 "Terminar rutina" (sutil, con confirmación) en `/rutina` e inicio sin activa con "Nueva rutina" (o "Crear rutina" sin ninguna) según §7; verificar en dev a 390 px "Cambio de rutina", "Copiar" y "Primera rutina"; commit (~5k)

## 3. Historial y sesión en solo lectura (~12k)

- [ ] 3.1 `/historial` con un grupo por rutina archivada (nombre, inicio–fin, día en cada fila, "Volver a esta rutina" con confirmación) y links con `&rutina=`; `/sesion` resuelve rutina y día desde `?rutina=` y queda en solo lectura si está archivada; sacar "Otros días"; verificar en dev a 390 px "Rutina archivada", "Sesión de una rutina archivada", "Me equivoqué al terminar" y que "Corregir un kg viejo" y "Borrar una vieja" siguen andando en la activa; commit (~12k)

## 4. CSV: lectura, validación y plan (~15k)

- [ ] 4.1 `src/lib/csv.ts` con `leerCsv`, `validar`, `planImport` y `escribirCsv` (design.md §4) y tests en `csv.test.ts`: BOM y comillas, coma y punto decimal, las dos fechas, fila con error con su línea, bloques de una sesión en orden, rutina nueva sin fechas, rutina inexistente con fechas → archivada con inicio/fin, fecha repetida salteada, emparejamiento por nombre normalizado y parecidos sin emparejar solos, ida y vuelta `escribirCsv` → `leerCsv` → `planImport` igual a los datos; verificar `npm test` y `npm run check`; commit (~15k)

## 5. Exportar y plantilla (~8k)

- [ ] 5.1 "Exportar todo" y "Descargar plantilla" donde diga §7 (Blob + `<a download>`); verificar en dev que el archivo baja con el nombre correcto y abrirlo en Excel (Joa) o revisar con `npm test` el texto generado con BOM, `;` y coma decimal; commit (~8k)

## 6. Importar con revisión (~20k)

- [ ] 6.1 Elegir archivo, mostrar la revisión según §7 (qué se crea, sesiones por rutina, errores por fila, emparejamiento y parecidos, fechas salteadas, elección con rutina activa) y "Cancelar" sin escribir nada; verificar en dev a 390 px con un CSV de prueba de "joa" los escenarios "Fila con error", "Cancelar", "Mismo nombre" y "Parecido"; commit (~12k)
- [ ] 6.2 Guardar el plan con `writeBatch` en lotes de 450 sin `await` (design.md §5); verificar en dev con stores falsos "Rutina del profe", "El Excel viejo" (historial y evolución muestran lo importado) y "Fecha repetida"; con Joa logueado, solo con su OK y un CSV chico de prueba que después se borra; commit (~8k)

## 7. Cierre (~10k)

- [ ] 7.1 Verificar offline (import y export sin señal, terminar y nueva rutina); actualizar `openspec/config.yaml` y `docs/decisiones-diseno-mancuernapp.md` §4 y §7 si cambió algo; `npm run check`, `npm test`, `npm run build`; commit (~4k)
- [ ] 7.2 Con OK de Joa, push a `main` y verificar el deploy de Vercel en verde; checklist en el celu de Joa (anotarla en `traspaso.md`): exportar todo y abrirlo en Excel, importar su Excel viejo pasado a la plantilla, terminar la rutina, nueva rutina copiando, ver una sesión archivada; commit (~6k)

## 8. Critique, accesibilidad y copy (~10k)

- [ ] 8.1 `design-critique` + `accessibility-review` + `ux-copy` sobre revisión del import, export, terminar/nueva rutina e historial con archivadas (mensajes de error por fila, confirmaciones, touch targets ≥ 48 px, input de archivo accesible); aplicar lo que Joa apruebe; verificar en dev a 390 px; commit (~10k)

## Workflow follow-up

- Archivar el change con `/opsx:archive` cuando Joa dé por cerrado el MVP 4 y verificar `openspec validate --specs`.
