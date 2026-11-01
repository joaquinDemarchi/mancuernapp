# MancuernApp — instrucciones para agentes

Este archivo vale para cualquier IA (Claude, Codex, Antigravity, etc.). Es la única fuente de reglas del repo:
si aprendés algo que la próxima IA debería saber, anotalo acá, no en tu memoria interna.

## Contexto

- PWA para registrar la rutina de gimnasio. SvelteKit + Firebase (Auth + Firestore offline) + Vercel.
- Contexto completo del proyecto y proceso de trabajo: `openspec/config.yaml` (leerlo siempre).
- Decisiones de diseño: `docs/decisiones-diseno-mancuernapp.md`.
- Specs vigentes: `openspec/specs/`. Trabajo en curso: `openspec/changes/<change>/` (no `archive/`).

## Arranque de sesión

1. Leer `openspec/config.yaml`.
2. Correr `git status` y `git log -10 --oneline` para ver lo último que hizo otra IA.
3. Leer el change activo en `openspec/changes/` (`tasks.md`, `traspaso.md`, y `design.md` si toca UI).
4. Seguir con la próxima tarea sin `[x]`, salvo que el usuario pida otra cosa.

## Cierre de cada tarea

1. Verificar: `npm run check`, `npm test` y, si cambia algo de build o PWA, `npm run build`.
2. Marcar `[x]` en `tasks.md` y actualizar `traspaso.md` (dónde quedó, qué falta, gotchas).
3. Un commit local por tarea. Nunca dejar cambios sin commitear al terminar.

## Comandos

- `npm run dev` — servidor de desarrollo (Vite)
- `npm run check` — svelte-check + tipos
- `npm test` — vitest (`src/lib/*.test.ts`)
- `npm run build` — build de producción

## Reglas de código

- Español en código, comentarios, artefactos de OpenSpec y commits.
- Leer los archivos relevantes antes de cambiar nada; si falta contexto, preguntar.
- Cambios mínimos: editar solo lo necesario, no reescribir archivos completos ni "limpiar" código ajeno al cambio.
- Soluciones simples: sin abstracciones, helpers ni features que no se pidieron.
- Imitar el estilo del código que rodea al cambio.
- No declarar algo terminado sin haberlo verificado (check, tests o probarlo).

## Commits

- Mensaje corto en español, en imperativo o descriptivo, sin prefijos tipo `feat:`.
  Ej.: `Cargar un día anterior con su fecha real`.
- Pedir OK antes de `git push`, deploy o borrar datos/archivos.

## Preferencias del usuario

- Respuestas cortas y directas, sin halagos ni resúmenes de relleno.
- En ejemplos, uids y datos de prueba usar "joa" (p. ej. `uidJoa`), no "lio".
