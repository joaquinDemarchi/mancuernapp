# Notas de traspaso — prototipo-flujo-carga

## Estado
- 1 hecha (31/10/2026): change propuesto. Formato, alcance, variantes y datos elegidos por Joa (ver abajo).
- 2 hecha: `/prototipo` (`datos.ts` con 3 días falsos; Día 2 sugerido con los 5 tipos y Sentadilla en 2 bloques). Sin login (excepción en `+layout.svelte`, sacarla al borrar). Contador de toques en la cabecera ("Reiniciar" y el selector de variante no cuentan). Cada −/+ marca hecho; destildar vuelve a la última vez. Verificado en el Browser pane a 375 px: día sin cambios = 8 toques (7 ✓ + Terminar); ajustes en A y B; resumen con % e indicador.
- Al arrancar `mvp-2-carga-sesion`: borrar `src/routes/prototipo/` y la excepción del layout.

## Decisiones previas (Joa, 31/10/2026)
- Formato: ruta descartable en la app con los componentes reales (no canvas ni HTML suelto).
- Alcance: Hoy: Día X + ✓ igual, Ajustar con −/+, Terminar → resumen. Sin bloques ni RPE.
- Ajustar en dos variantes: A fila expandida, B hoja abajo.
- Datos falsos en memoria, sin Firestore.

## Decisiones para el MVP 2
- Ajustar: variante **B** (hoja abajo), elegida por Joa en el celu (31/10/2026).
- Bug de la prueba: dos `Stepper` lado a lado (series y reps) cortaban el número detrás del `+` en el celu de Joa. En el prototipo se apilaron en una columna (sin cortes a 360 px; con 2 bloques la hoja hace scroll). En el MVP 2: steppers apilados, o achicar el número del `Stepper` si se quieren dos columnas.
- Contador de toques: solo para medir en el prototipo; **no va en la app real**.
- Resumen al terminar: **solo el volumen total** (kg, ejercicios de peso hechos). El detalle por ejercicio confundía (no se entendía qué ejercicios mostraba ni por qué); se sacó junto con el % vs la vez anterior y el indicador. Revisar cómo mostrar % e indicador en el MVP 3 (métricas).
- (pendiente: el resto de las impresiones de Joa)
