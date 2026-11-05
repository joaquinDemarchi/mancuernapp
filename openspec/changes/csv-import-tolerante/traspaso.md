# Traspaso

## Dónde quedó
- Change propuesto. Archivo corregido para Joa: `Downloads/semana_1_mancuernapp.csv` (`;`, BOM, Dead bug y Bird dog con pausa como `reps`).

## Gotchas
- El archivo de Joa (`semana_1_encabezado_plantilla.csv`) tenía `,`, BOM y encabezado con mojibake (`ï»¿`, `DÃ­a`) pero las filas en UTF-8 bien.
- 1.1 hecha: `leerCsv` detecta `,` mirando la primera línea no comentario (si no tiene `;` y tiene `,`); comentarios = primera celda que empieza con `#`. `validar` pasa cada título por `sinMojibake` (Latin-1 → bytes → UTF-8; si queda `\uFFFD`, lo deja igual). El BOM que sobrevive (`\uFEFF`) lo saca el `trim()` de `normalizar`.
- Probado con los dos archivos reales de Joa: 33 filas, 0 errores, 3 días de 11 ejercicios.
- 2.1 hecha: `plantillaCsv` mete 9 filas `#` (constante `instrucciones` en `csv.ts`) entre el BOM y el encabezado; sin `"` ni `;` en el texto para que no salgan entre comillas. Verificado en dev con stores falsos (DataTransfer + `change` en `/datos`): el archivo de Joa con `,`/mojibake → "1 rutina nueva · 3 días" sin errores; la plantilla → "Rutina 1 · archivada · 1 sesión"; `Rutina;Dias;…` → "La columna 2 del encabezado dice «Dias» y tiene que ser «Día»". check, test (99) y build en verde.

## Qué falta
- Que Joa importe `semana_1_mancuernapp.csv` (o el original, después del push) y abra la plantilla nueva en Excel. Push solo con su OK. Después, archivar el change.
- Ojo con su rutina: se llama "Bloque 1 - Semana 1"; la app cuenta las semanas sola, así que conviene "Bloque 1" para no crear una rutina por semana.
