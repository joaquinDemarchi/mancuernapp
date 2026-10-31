# Proposal

## Why

Con el catálogo y la rutina listos (MVP 1), falta lo central: cargar lo que se hace en el gym. Este change trae el flujo de carga de §5, validado con el prototipo en el celu de Joa, para que desde ahora la app reemplace al Excel en el gym, también sin señal.

## What Changes

- El inicio con rutina suma la tarjeta "Hoy: Día X" con el día sugerido (el siguiente al de la última sesión), chips para cambiarlo y "Empezar"; si hoy ya hay sesión, la tarjeta la retoma.
- Pantalla de sesión (`/sesion`): ejercicios del día precargados con lo de la última vez (o el objetivo la primera vez), ✓ = igual que la última vez, tocar el nombre abre la hoja Ajustar.
- Hoja Ajustar (variante B de los mockups): lista de bloques con editor del elegido (steppers apilados), "+ Bloque", "Desarmar" un bloque en series sueltas, quitar bloque, RPE 6–10 opcional y nota opcional.
- Ejercicio extra en la sesión, reusando la hoja de buscar/crear del MVP 1 (queda solo en esa sesión).
- Guardado instantáneo en cada toque; "Terminar sesión" muestra el volumen total.
- La sesión de hoy se puede retomar, editar y borrar (con confirmación).
- Persistencia offline de Firestore: la app carga y guarda sin señal y sincroniza al volver.
- Se borra el prototipo `/prototipo` y su excepción de login.

**Fuera de alcance:** % vs la vez anterior e indicador de sobrecarga en el resumen, historial y editar/borrar sesiones de días anteriores (MVP 3); archivar rutina, import/export (MVP 4); contador de toques; timer de descanso, sugerir progresión (v2); dos sesiones el mismo día.

## Capabilities

### New Capabilities
- `sesion`: cargar la sesión del día (día sugerido, precarga, ✓, Ajustar con bloques/RPE/nota, extra, terminar con volumen, retomar y borrar la de hoy).

### Modified Capabilities
- `rutina`: "Rutina en el inicio" suma la tarjeta "Hoy" y "Editar rutina" pasa a secundaria.
- `app-pwa`: nuevo requisito de datos offline (leer y guardar sin señal).

## Impact

- Código: ruta nueva `/sesion`; módulo `src/lib/sesion.ts` (store y escrituras) y `src/lib/calculos.ts` (funciones puras con tests: día sugerido, última vez, semana N, volumen, desarmar); componente `HojaAjustar.svelte`; `HojaAgregar.svelte` generalizado (título, ya agregados, callback); inicio con la tarjeta "Hoy"; `firebase.ts` con `persistentLocalCache`.
- Firestore: colección `users/{uid}/sesiones` (las reglas actuales ya la cubren). Al modelo se suma `terminada` en la sesión.
- Se borran `src/routes/prototipo/` y la excepción de `src/routes/+layout.svelte`.
- Diseño: mockups en https://claude.ai/artifact/X4TK7P9w7oHgeu9a6YJwB5 (inicio B, Ajustar B).
