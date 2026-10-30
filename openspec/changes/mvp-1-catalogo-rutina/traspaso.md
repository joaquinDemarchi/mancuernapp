# Notas de traspaso — mvp-1-catalogo-rutina

## Estado
- Change propuesto (30/10/2026): `proposal.md`, `design.md`, `tasks.md`, specs nuevas `catalogo-ejercicios` y `rutina`, deltas de `app-pwa` y `acceso`. Sin código todavía. Próxima: 1.1.

## Decisiones tomadas con Joa
- Catálogo como acceso secundario "Ejercicios" en el inicio (sin pestañas abajo).
- Agregar ejercicio: hoja con buscador + crear al vuelo + sugerencia de parecidos.
- Reordenar arrastrando (ejercicios y días).
- Objetivo opcional por ejercicio, sin kg.
- Mockups: https://claude.ai/artifact/KYywsntvDXEY7ECdUYUzVT (privado). Elegidos: editor B (días en pestañas), formulario A (tipo en chips). Las otras variantes (A apilada, C dos niveles, B lista de tipos) quedan en el canvas como descartadas.
- Rutina con guardado instantáneo; ejercicio con "Guardar"; "Salir" arriba a la derecha; días renombrables.

## Gotchas previstos
- Rutas con `?id=` en vez de `[id]` para seguir prerenderizando todo (ver design.md §1).
- `bundle.css` del Design System se lee con Artifact read + `paths: ["project/components/bundle.css"]` de https://claude.ai/artifact/GB9FbyJPzAdy3jsURqYKhP.
- Los mockups usan clases propias en `project/mvp1.css` del canvas (`.row`, `.chip`, `.sheet`, `.slot`…): son referencia visual, en la app cada componente lleva sus estilos con tokens.
- Ver también los gotchas de SvelteKit 3 en `openspec/changes/archive/2026-10-30-mvp-0-base/traspaso.md` (`#lib/x.ts` con extensión, sin `svelte.config.js`).
