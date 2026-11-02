# Proposal

## Why

La rutina de Joa cambia cada 4–7 semanas y hoy la app no tiene cómo cerrarla y empezar otra sin perder el historial; además, los datos solo viven en Firebase y lo cargado en el Excel viejo no está en la app. Con el MVP 3 mostrando evolución cruzando rutinas, falta poder cerrar rutinas, traer el pasado y sacar un backup.

## What Changes

- "Terminar rutina" (sutil, en Editar rutina, con confirmación): la rutina activa pasa a archivada con fecha de fin de hoy.
- Sin rutina activa y con una archivada, "Nueva rutina" crea la siguiente copiando días, ejercicios y objetivos de la última archivada ("Rutina N+1", inicio hoy); se edita como cualquier rutina.
- Historial: debajo de los grupos de la rutina activa, un grupo por rutina archivada (de la más nueva a la más vieja) con sus sesiones; tocar una la abre en solo lectura (sin ✓, Ajustar, agregar ni borrar).
- "Volver a esta rutina" (sutil, en el grupo de una archivada, con confirmación): la reactiva y archiva la activa, si hay.
- Importar CSV: plantilla propia con columnas fijas (Rutina; Día; Ejercicio; Tipo; Series; Reps; Kg; Segundos; Minutos; Fecha). Filas sin fecha arman la estructura de una rutina nueva; filas con fecha son sesiones viejas. Antes de guardar, una revisión muestra qué se crea, los errores por fila y el emparejamiento de cada ejercicio con el catálogo.
- "Exportar todo": un CSV con el mismo formato (estructura de cada rutina y todas las sesiones), para backup y análisis en Excel. Descargar la plantilla vacía con un ejemplo.
- CSV con `;` como separador, coma decimal y UTF-8 con BOM, para que el Excel en español lo abra directo.

**Decisiones de Joa (02/11/2026):** solo CSV (sin .xlsx); el import trae rutinas y sesiones viejas; la nueva rutina arranca copiando la anterior; las archivadas se ven en el historial. Los mockups de las pantallas nuevas (dónde van Importar/Exportar, revisión, solo lectura) se eligen en el ciclo de diseño (tareas 1.x).

**Fuera de alcance:** archivos .xlsx; import con IA (foto/PDF/WhatsApp, v2); varias rutinas activas (v2); editar o borrar sesiones de rutinas archivadas (hay que volver a esa rutina); editar el "desde" de una rutina o cargar fechas anteriores a su inicio con "Cargar un día anterior" (Joa lo deja como está); export parcial o por fechas; sincronizar con Google Sheets; importar RPE y notas.

## Capabilities

### New Capabilities
- `import-export`: plantilla CSV, importar rutinas y sesiones viejas con revisión y emparejamiento con el catálogo, y exportar todo.

### Modified Capabilities
- `rutina`: terminar (archivar) la rutina activa, nueva rutina copiando la anterior y volver a una archivada; "Crear la rutina" cambia cuando ya hay una archivada.
- `historial`: grupos por rutina archivada y sesiones archivadas en solo lectura.

## Impact

- Código: `src/lib/rutina.ts` pasa a leer todas las rutinas del usuario (activa + archivadas) y suma archivar, nueva copiando y reactivar; módulo nuevo `src/lib/csv.ts` con funciones puras (leer/escribir CSV, validar filas, armar el plan de import) y tests; pantallas o hojas nuevas de import/export según el mockup; `/historial` y `/sesion` (modo solo lectura y día resuelto con la rutina de la sesión).
- Firestore: sin campos nuevos (`fin` y `estado` ya están en el modelo); el import escribe en lotes (`writeBatch`), sin `await`, para que funcione sin señal. Reglas sin cambios.
- Dependencias: ninguna (CSV a mano).
