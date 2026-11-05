# Traspaso

## Dónde quedó
- Change propuesto. Archivo corregido para Joa: `Downloads/semana_1_mancuernapp.csv` (`;`, BOM, Dead bug y Bird dog con pausa como `reps`).

## Gotchas
- El archivo de Joa (`semana_1_encabezado_plantilla.csv`) tenía `,`, BOM y encabezado con mojibake (`ï»¿`, `DÃ­a`) pero las filas en UTF-8 bien.
- 1.1 hecha: `leerCsv` detecta `,` mirando la primera línea no comentario (si no tiene `;` y tiene `,`); comentarios = primera celda que empieza con `#`. `validar` pasa cada título por `sinMojibake` (Latin-1 → bytes → UTF-8; si queda `\uFFFD`, lo deja igual). El BOM que sobrevive (`\uFEFF`) lo saca el `trim()` de `normalizar`.
- Probado con los dos archivos reales de Joa: 33 filas, 0 errores, 3 días de 11 ejercicios.
