# Tasks

> Cada tarea: commit local + `[x]` acá + actualizar `traspaso.md`. Costo estimado entre paréntesis.
> Total estimado: ~20k tokens. Push solo con OK de Joa.

## 1. Import tolerante (~10k)

- [ ] 1.1 En `src/lib/csv.ts`: `leerCsv` detecta `;` o `,` en el encabezado e ignora filas `#`; `validar` arregla el mojibake del encabezado y dice qué columna falla (o que falta el separador); tests con el archivo de Joa (`,` + `DÃ­a`), comentarios y errores; `npm run check`, `npm test`; commit (~10k)

## 2. Plantilla con instrucciones (~10k)

- [ ] 2.1 `plantillaCsv` con líneas `#` arriba del encabezado (columnas, tipos, separador, coma decimal, fechas, rutina vs sesión, Descanso, codificación); test de ida y vuelta; verificar en dev con stores falsos que la plantilla y el archivo de Joa pasan la revisión; `npm run build`; actualizar config.yaml; commit (~10k)
