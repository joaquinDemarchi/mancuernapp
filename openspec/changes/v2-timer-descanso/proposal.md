# Proposal

## Why

En el gym Joa mide el descanso entre ejercicios con el reloj del celu, fuera de la app, y cada ejercicio pide un descanso distinto. Con la carga de la sesión ya resuelta (MVP 2), un timer que arranque solo al marcar el ejercicio ahorra salir de la app y cuidar el tiempo a ojo.

## What Changes

- Cada ejercicio del catálogo suma un **descanso opcional** (en segundos); vacío = sin timer.
- En la sesión, al marcar como hecho un ejercicio que tiene descanso (✓, o "Guardar" en Ajustar), arranca solo un timer con ese tiempo. Destildar no lo arranca.
- El timer muestra el tiempo que falta, se puede ajustar (±15 s) y saltar; marcar otro ejercicio lo reemplaza.
- Mientras corre, la pantalla queda prendida; al terminar, el celu vibra y el timer avisa que terminó.
- El CSV de import/export suma la columna opcional `Descanso` (segundos) al final; los archivos sin esa columna siguen importándose.

**Decisiones de Joa (04/11/2026):** descanso por ejercicio, opcional; arranque automático al marcarlo hecho y se puede saltar; pantalla prendida en vez de notificaciones. Supuesto: "Guardar" en Ajustar también lo arranca, porque en un ejercicio sin última vez el ✓ abre Ajustar. Dónde se ve el timer y cómo se edita el descanso se elige en el ciclo de diseño (tareas 1.x).

**Fuera de alcance:** notificaciones o aviso con la app en segundo plano o la pantalla bloqueada; sonido; un descanso global; descanso distinto por día o por rutina; descanso entre series de un mismo ejercicio; historial o estadísticas de descansos; que el timer siga corriendo fuera de la pantalla de sesión.

## Capabilities

### New Capabilities
- `descanso`: timer de descanso en la sesión (arranque al marcar hecho, ajustar, saltar, pantalla prendida y vibración al terminar).

### Modified Capabilities
- `catalogo-ejercicios`: un ejercicio suma un descanso opcional.
- `import-export`: columna opcional `Descanso` en la plantilla.

## Impact

- Código: `src/lib/catalogo.ts` (`descanso?` en el ejercicio), la ficha `/ejercicio`, `/sesion` (timer y arranque al marcar hecho), `src/lib/csv.ts` (columna nueva, compatible con archivos viejos) y tests.
- Firestore: campo opcional `descanso` (segundos) en `users/{uid}/ejercicios/{id}`; sin migración (los existentes quedan sin descanso). Reglas sin cambios.
- APIs del navegador: Screen Wake Lock y Vibration, solo si el celu las soporta (sin ellas el timer anda igual). Sin dependencias nuevas.
