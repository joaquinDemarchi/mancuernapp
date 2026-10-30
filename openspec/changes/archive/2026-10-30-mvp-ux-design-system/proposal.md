# Proposal

## Why

MancuernApp arranca sin referencias visuales y su valor depende de que cargar datos en el gym sea rápido con una mano. Antes de escribir código (MVP 0 en adelante) hace falta una identidad visual elegida por Lio y un Design System que cualquier IA pueda leer y aplicar sin reinventar decisiones.

## What Changes

- 2–3 direcciones visuales propuestas como mockups (artifact **Design**) sobre las pantallas críticas: "Hoy: Día X", la tarjeta de carga de un ejercicio y el resumen de sesión. Lio elige una.
- **Design System** (artifact Design System) a partir de la dirección elegida: tokens (colores oscuro/claro, tipografía, espaciado, radios), componentes base y guías de uso.
- Ícono de la app (mancuernita celeste en diagonal sobre fondo blanco) en SVG + PNG para PWA (192, 512, maskable).
- Handoff al repo en `design/`: `tokens.css` con variables CSS para ambos temas, ícono, y `README.md` con links a los artifacts y la especificación de componentes.

## Capabilities

### New Capabilities
- `design-system`: identidad visual y tokens/componentes base que toda pantalla de la app debe respetar (temas, contraste, touch targets, uso con una mano, nombre e ícono).

### Modified Capabilities
<!-- Ninguna: no hay specs previas. -->

## Impact

- Nuevo directorio `design/` (tokens, ícono, README). Sin código de app todavía.
- `mvp-0-base` consumirá `design/tokens.css` y los íconos (manifest, `config/app.ts`).
- Los artifacts en claude.ai (Design, Design System) quedan como referencia viva; el repo guarda la copia operativa.

## Fuera de alcance

- Código SvelteKit, manifest, `config/app.ts` (van en `mvp-0-base`).
- Mockups de las pantallas de cada MVP posterior (se hacen en el ciclo de diseño de cada MVP).
- Prototipo del flujo de carga (`prototipo-flujo-carga`).
- Critique / accesibilidad / copy de pantallas construidas (al cerrar cada MVP).
