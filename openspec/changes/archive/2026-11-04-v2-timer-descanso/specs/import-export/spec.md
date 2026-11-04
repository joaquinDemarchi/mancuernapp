# Spec Delta

## MODIFIED Requirements

### Requirement: Formato de la plantilla
El import y el export SHALL usar el mismo CSV: columnas fijas `Rutina; Día; Ejercicio; Tipo; Series; Reps; Kg; Segundos; Minutos; Fecha; Descanso` con encabezado, `;` como separador, coma decimal y UTF-8 con BOM. `Descanso` (segundos) es opcional: un archivo sin esa columna SHALL importarse igual. Un ejercicio nuevo SHALL tomar el primer descanso no vacío de sus filas; uno que ya está en el catálogo SHALL conservar el suyo. El export SHALL escribir el descanso de cada ejercicio en sus filas sin fecha. El usuario SHALL poder descargar la plantilla con el encabezado y filas de ejemplo.

#### Scenario: Abrir en Excel
- **WHEN** el usuario descarga la plantilla y la abre con Excel en español
- **THEN** ve cada columna separada y "62,5" como número

#### Scenario: Archivo sin la columna Descanso
- **WHEN** el usuario importa un CSV exportado antes de este cambio (10 columnas)
- **THEN** la revisión no marca error de encabezado y los ejercicios nuevos quedan sin descanso

#### Scenario: Descanso de un ejercicio nuevo
- **WHEN** el CSV trae "Burpees" (nuevo) con Descanso 60 en una fila
- **THEN** al importar, Burpees queda en el catálogo con 1:00 de descanso
