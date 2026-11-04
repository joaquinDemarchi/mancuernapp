# Proposal

## Why

En el gym Joa mide el descanso entre series y entre ejercicios con el reloj del celu, fuera de la app, y cada ejercicio pide un descanso distinto. Con la carga de la sesión ya resuelta (MVP 2), un timer a mano en la sesión, que ya sabe cuánto descansar, ahorra salir de la app y cuidar el tiempo a ojo.

## What Changes

- Cada ejercicio del catálogo suma un **descanso opcional** (en segundos); vacío = sin timer.
- En la sesión, un botón flotante abre el timer cuando el usuario quiere (entre series o entre ejercicios), con el descanso del primer ejercicio sin hacer (si no tiene, el último usado; si no, 1:30). Marcar ejercicios no lo arranca ni lo cambia.
- El timer es un mini timer flotante: muestra el tiempo que falta, se puede ajustar (±15 s) y saltar.
- Mientras corre, la pantalla queda prendida; al terminar, el celu vibra y el timer avisa que terminó, con "Otra vez" para repetir el mismo descanso.
- El CSV de import/export suma la columna opcional `Descanso` (segundos) al final; los archivos sin esa columna siguen importándose.

**Decisiones de Joa (04/11/2026):** descanso por ejercicio, opcional; pantalla prendida en vez de notificaciones. Al ver los mockups cambió el arranque: en vez de arrancar solo al marcar hecho, se abre con un botón cuando quiere (sirve entre series), solo en la sesión. Diseño elegido: botón flotante + mini timer (E) y en la ficha chips + stepper (2); detalle en design.md §6.

**Fuera de alcance:** notificaciones o aviso con la app en segundo plano o la pantalla bloqueada; sonido; un descanso global; descanso distinto por día o por rutina; descanso entre series de un mismo ejercicio; historial o estadísticas de descansos; que el timer siga corriendo fuera de la pantalla de sesión.

## Capabilities

### New Capabilities
- `descanso`: timer de descanso en la sesión (abrir con el botón, ajustar, saltar, pantalla prendida, vibración y "Otra vez" al terminar).

### Modified Capabilities
- `catalogo-ejercicios`: un ejercicio suma un descanso opcional.
- `import-export`: columna opcional `Descanso` en la plantilla.

## Impact

- Código: `src/lib/catalogo.ts` (`descanso?` en el ejercicio), la ficha `/ejercicio`, `/sesion` (botón y mini timer flotante), `src/lib/csv.ts` (columna nueva, compatible con archivos viejos) y tests.
- Firestore: campo opcional `descanso` (segundos) en `users/{uid}/ejercicios/{id}`; sin migración (los existentes quedan sin descanso). Reglas sin cambios.
- APIs del navegador: Screen Wake Lock y Vibration, solo si el celu las soporta (sin ellas el timer anda igual). Sin dependencias nuevas.
