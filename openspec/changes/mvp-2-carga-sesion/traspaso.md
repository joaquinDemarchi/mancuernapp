# Notas de traspaso — mvp-2-carga-sesion

## Estado
- Change propuesto (31/10/2026): `proposal.md`, `design.md` (handoff en §7), `tasks.md`, spec nueva `sesion` y deltas de `rutina` y `app-pwa`. Sin código todavía. Próxima: 1.1 (pide OK de Joa para borrar `/prototipo`).

## Decisiones tomadas con Joa (31/10/2026)
- Bloques: "+ Bloque", quitar y **desarmar** en series sueltas (sin "Juntar").
- RPE: chips 6–10 en Ajustar, opcional. Nota por ejercicio: sí, en Ajustar.
- Ejercicio extra: sí, reusando `HojaAgregar`; solo en la sesión, no cambia la rutina.
- Editar/borrar: solo la sesión de hoy; las viejas con el historial (MVP 3).
- Mockups: https://claude.ai/artifact/X4TK7P9w7oHgeu9a6YJwB5 (privado). Elegidas: inicio **B** (tarjeta "Hoy" con "Empezar") y Ajustar **B** (lista de bloques + editor del elegido). Descartadas en el canvas: inicio A ("Hoy" como inicio con menú ⋯) y Ajustar A (bloques apilados).
- Supuestos aprobados: primera vez arranca del objetivo y el ✓ abre Ajustar; "Borrar" en la sesión de hoy; resumen = solo volumen (del prototipo).
- Del prototipo: Ajustar en hoja abajo, steppers apilados, sin contador de toques, ✓ = igual, tocar el nombre para ajustar, chips para cambiar el día.

## Gotchas previstos
- Offline: no hacer `await` de `setDoc`/`updateDoc`/`addDoc` en la UI (sin señal no resuelven hasta sincronizar). Aplica también a `crearEjercicio` del MVP 1.
- La sesión se crea al primer toque, no en "Empezar": `/sesion` sin doc es un estado válido.
- Sin índices compuestos: una sola consulta `where('rutinaId','==',…)` y todo lo demás en `calculos.ts`.
- `hoy()` con fecha local, no `toISOString()` (UTC corre el día de noche).
- Mockups: clases de `project/mvp1.css` + `project/mvp2.css` del canvas (`.item`, `.check`, `.blk`, `.rpe`, `.card`): referencia visual; en la app cada componente lleva sus estilos con tokens.
- Si el número del `Stepper` se corta a 360 px, achicar su tipografía (pasó en el prototipo con dos columnas).
- Gotchas de verificación del MVP 1 siguen valiendo (`openspec/changes/archive/2026-10-31-mvp-1-catalogo-rutina/traspaso.md`): Firestore solo con Joa logueado en su Chrome, hojas modales con `el.click()` desde la consola, `#lib/x.ts` con extensión, sin `svelte.config.js`.
- Para probar en el celu por Wi-Fi: `dev-lan` de `.claude/launch.json`, puerto 5173 abierto en el firewall (lo hace Joa) y `http://` a mano.
