# Proposal

## Why

Joa armó su rutina nueva (3 días, 33 filas) con otra herramienta y `/datos` no la dejó importar: el archivo venía separado por `,` y con el encabezado mal codificado (`ï»¿Rutina`, `DÃ­a`: UTF-8 leído como Latin-1 y vuelto a guardar). Las filas estaban bien, pero la app solo mostró "El encabezado tiene que ser…" sin decir qué fallaba. La plantilla tampoco explica las reglas del formato, así que hay que adivinarlas.

## What Changes

- **Separador detectado**: el import acepta `;` (el de siempre) o `,`, según cuál aparece en el encabezado. El export y la plantilla siguen con `;`.
- **Encabezado tolerante**: además de mayúsculas y tildes, se aceptan el BOM y el encabezado con mojibake (`DÃ­a` → `Día`).
- **Errores de encabezado claros**: dicen qué columna está mal y qué se esperaba; si el encabezado tiene una sola columna, avisan que el separador tiene que ser `;` o `,`.
- **Comentarios**: las filas cuya primera celda empieza con `#` se ignoran (siguen contando para el número de fila).
- **Plantilla con instrucciones**: arriba del encabezado, líneas `#` con columnas, tipos y qué columnas usa cada uno, separador, coma decimal, fechas, filas sin fecha = rutina, Descanso y codificación.

**Fuera de alcance:** arreglar archivos enteros con mojibake (nombres de ejercicios mal codificados); separador tab u otros; avisar de nombres casi repetidos dentro del mismo archivo; cambiar el export.

## Capabilities

### Modified Capabilities
- `import-export`: formato de la plantilla (separador, encabezado tolerante, comentarios e instrucciones).

## Impact

- Código: `leerCsv` y `validar` en `src/lib/csv.ts` (+ tests); `plantillaCsv` con las instrucciones. Sin cambios en la UI de `/datos`, datos ni Firestore.
