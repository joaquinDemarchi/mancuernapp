# Design

## Context

Proyecto greenfield: el repo solo tiene OpenSpec y `docs/decisiones-diseno-mancuernapp.md`. No hay referencias visuales previas. La pantalla crítica es la carga de sesión (§5 del doc): lista "Hoy: Día X", tarjetas por ejercicio con valores previos en gris, ✓ / Ajustar, steppers `−/+`, chips RPE, resumen con indicador 🟢🟡🔴. Se usa de pie en el gym, con una mano, con brillo de pantalla variable.

Herramientas verificadas el 30/10/2026: skill **taste** (`design-taste-frontend`) disponible; artifact types **Design** y **Design System** disponibles en claude.ai.

## Goals / Non-Goals

**Goals:**
- Que Lio elija una dirección visual entre 2–3 opciones concretas, vistas sobre las pantallas reales.
- Un Design System que sirva de referencia barata para cualquier IA (README + tokens + componentes).
- Copia operativa en el repo (`design/`) que `mvp-0-base` pueda importar directo.

**Non-Goals:**
- Diseñar todas las pantallas del MVP (cada MVP tiene su ciclo de diseño).
- Escribir código de la app o configurar el manifest.

## Decisions

1. **Mockups en artifact Design, no en código.** Comparar 2–3 direcciones lado a lado en un canvas es más barato que prototipar en SvelteKit. Descartado: prototipo HTML en el repo (más tokens, se tira igual).
2. **Pantallas para comparar direcciones**: "Hoy: Día X" (lista), tarjeta de ejercicio en modo Ajustar (stepper, bloques, RPE) y resumen de sesión con indicador. Cubren todos los componentes base.
3. **Qué varía entre direcciones**: paleta (base oscura + acento; el celeste del ícono es candidato natural de acento), tipografía (números grandes y tabulares para kg/reps) y densidad. Las define la skill taste al ejecutar la tarea 1.
4. **Design System desde la dirección elegida**, en el artifact type Design System (tokens en ambos temas, componentes con estados, guías). Es la referencia viva.
5. **Handoff al repo como CSS custom properties** en `design/tokens.css` (`:root` = oscuro, `[data-theme="light"]` = claro). Framework-agnóstico: SvelteKit lo importa en el layout raíz sin dependencias. Descartado: config de Tailwind (agrega una decisión de stack no tomada).
6. **Ícono**: SVG fuente simple + PNG exportados; versión maskable con zona segura del 80%.
7. **Gate de decisión**: las tareas 2–4 no arrancan sin la elección de Lio registrada en `traspaso.md`.

## Risks / Trade-offs

- [Los artifacts viven fuera del repo] → el repo guarda `tokens.css`, el ícono y un README con la especificación de componentes; los artifacts son complemento, no dependencia.
- [Celeste sobre fondo oscuro con poco contraste o aspecto genérico] → verificar contraste AA al fijar tokens (tarea 2) y dejar que la skill taste proponga alternativas de acento.
- [Fuentes web pesan / fallan offline] → preferir una fuente autoalojable o system font stack; decidir en tarea 2.
- [Presupuesto del doc 25–30k vs ~33k estimado] → si hace falta, recortar la tercera dirección visual (−3k).
