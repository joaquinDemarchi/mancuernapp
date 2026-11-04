# import-export Specification

## Purpose
Traer a la app rutinas y sesiones que viven fuera de ella (el Excel viejo, una rutina del profe) y sacar todos los datos como backup, con un formato CSV propio que Excel abre directo.

## Requirements

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

### Requirement: Filas de la plantilla
Cada fila SHALL ser un bloque: sin Fecha, el objetivo de un ejercicio en un día de la rutina (Kg se ignora); con Fecha (DD/MM/AAAA o AAAA-MM-DD), un bloque hecho ese día. Varias filas con la misma rutina, día, ejercicio y fecha SHALL ser bloques del mismo ejercicio, en orden.

#### Scenario: Bloques de una sesión vieja
- **WHEN** el CSV tiene dos filas de Press banca en Día 1 de "Rutina 1" con fecha 15/09/2026, una con 3 × 10 · 60 y otra con 1 × 8 · 70
- **THEN** el import arma una sesión del 15/09 de Día 1 con Press banca 3×10 · 60 kg + 1×8 · 70 kg

### Requirement: Revisión antes de guardar
Importar SHALL mostrar una revisión antes de escribir nada: rutinas y días que se crean, cantidad de sesiones por rutina, ejercicios nuevos y emparejados, y cada fila con error con su número de línea y el motivo. Con errores no SHALL poder guardarse; cancelar no SHALL cambiar ningún dato.

#### Scenario: Fila con error
- **WHEN** la fila 7 tiene "tres" en Series
- **THEN** la revisión muestra "Fila 7: Series tiene que ser un número" y no deja importar

#### Scenario: Cancelar
- **WHEN** el usuario revisa un CSV válido y toca "Cancelar"
- **THEN** no se crea ninguna rutina, sesión ni ejercicio

### Requirement: Emparejamiento con el catálogo
Cada ejercicio del CSV SHALL emparejarse con el del catálogo que tenga el mismo nombre (ignorando mayúsculas, tildes y espacios); si no hay, la revisión SHALL ofrecer crearlo con el tipo del CSV o elegir uno parecido del catálogo, y no SHALL poder importarse hasta decidir cada parecido. Un ejercicio emparejado conserva su tipo del catálogo.

#### Scenario: Mismo nombre
- **WHEN** el CSV dice "press banca" y el catálogo tiene "Press banca"
- **THEN** la revisión lo muestra como existente y las filas usan ese ejercicio

#### Scenario: Parecido
- **WHEN** el CSV dice "Camilla isquio" y el catálogo tiene "Camilla isquiotibiales"
- **THEN** la revisión pregunta si es el mismo, con la opción de crearlo nuevo, y "Importar" queda deshabilitado hasta elegir

### Requirement: Importar una rutina nueva
Las filas sin fecha de una rutina que no existe SHALL crear esa rutina con sus días en el orden en que aparecen y los ejercicios con su objetivo; si no hay rutina activa queda activa con inicio hoy, y si hay una activa SHALL ofrecerse terminarla primero o guardar la nueva como archivada.

#### Scenario: Rutina del profe
- **WHEN** el usuario sin rutina activa importa "Rutina 5" con 4 días
- **THEN** "Rutina 5" queda activa con esos 4 días y el inicio muestra su tarjeta Hoy

### Requirement: Importar sesiones viejas
Las filas con fecha SHALL crear sesiones terminadas de esa rutina y día; si la rutina no existe se SHALL crear archivada con inicio y fin en la primera y la última fecha. Una fecha que ya tiene sesión en esa rutina SHALL marcarse en la revisión y no importarse.

#### Scenario: El Excel viejo
- **WHEN** el usuario importa 3 semanas de "Rutina 1" que no existe en la app
- **THEN** se crea "Rutina 1" archivada con esas sesiones, que aparecen en el historial y en la evolución de cada ejercicio

#### Scenario: Fecha repetida
- **WHEN** el CSV trae una sesión del 29/10 de la rutina activa y ya hay una ese día
- **THEN** la revisión dice "29/10 ya tiene sesión: se saltea" y las demás se importan

### Requirement: Exportar todo
"Exportar todo" SHALL descargar un CSV con la estructura de cada rutina (filas sin fecha) y cada bloque de cada sesión (filas con fecha), que importado en una cuenta vacía SHALL reconstruir las mismas rutinas y sesiones.

#### Scenario: Backup
- **WHEN** el usuario toca "Exportar todo"
- **THEN** descarga "mancuernapp-AAAA-MM-DD.csv" con todas sus rutinas y sesiones

#### Scenario: Ida y vuelta
- **WHEN** se exporta y se importa ese archivo en una cuenta sin datos
- **THEN** quedan las mismas rutinas, días, ejercicios y sesiones con los mismos valores
