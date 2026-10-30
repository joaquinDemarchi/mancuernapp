# Proposal

## Why

MancuernApp todavía no existe como app: hay decisiones, Design System, tokens e ícono, pero nada instalable en el celu. `mvp-0-base` arma la base sobre la que se construyen los MVP 1–4: una PWA desplegada, con acceso restringido a Lio, que ya usa la identidad visual definida.

## What Changes

- Proyecto SvelteKit (TypeScript) como SPA estática, desplegado en Vercel desde GitHub en `*.vercel.app`.
- PWA instalable: manifest con nombre e íconos de `design/icon/`, service worker que precachea la app y la fuente, y abre offline.
- Nombre, colores del manifest y rutas de íconos centralizados en `config/app.ts`.
- Login con Google (Firebase Auth) y lista blanca de emails: en `config/app.ts` para la UI y en `firestore.rules` para proteger los datos.
- Al primer login permitido se crea `users/{uid}` con `{ email, nombre, rol: "usuario", ajustes: {} }`.
- Pantalla inicial vacía (estado "sin rutina todavía") con cierre de sesión, construida con `design/tokens.css` y los componentes base.
- Saira autoalojada: woff2 variable, subconjunto latín, `wdth` 75–100 y `wght` 400–700, cacheada por el service worker.

## Capabilities

### New Capabilities
- `acceso`: login con Google, lista blanca de emails (cliente y reglas de Firestore), alta del documento de usuario y cierre de sesión.
- `app-pwa`: app instalable y offline (manifest, service worker), nombre e ícono centralizados en `config/app.ts`, pantalla inicial.

### Modified Capabilities
- `design-system`: se agrega el requisito de tipografía Saira autoalojada y disponible offline.

## Fuera de alcance

- Catálogo de ejercicios, rutinas, sesiones, métricas, import/export (MVP 1–4).
- Persistencia offline de Firestore para datos de dominio (llega con MVP 2; acá solo el shell abre offline).
- Selector de tema claro en Ajustes (el tema oscuro queda por defecto; `data-theme="light"` ya funciona por tokens).
- Dominio propio, SSR o funciones serverless.
- Lista blanca editable sin redeploy, roles profe/alumno y cualquier ítem de v2.
- Push y deploy: se hacen solo con OK de Lio.

## Impact

- Código nuevo: todo el proyecto SvelteKit (`src/`, `static/`, `config/app.ts`, `svelte.config.js`, `vite.config.ts`, `package.json`).
- Firebase: proyecto nuevo creado por Lio en consola (Auth con Google, Firestore en `southamerica-east1`), `firestore.rules`.
- Vercel: proyecto importado del repo de GitHub; variables de entorno públicas del `firebaseConfig`.
- Dependencias: `@sveltejs/kit`, `@sveltejs/adapter-static`, `firebase`, archivo de fuente Saira (OFL) en `static/fonts/`.
- `design/tokens.css` y `design/icon/` se consumen tal cual, sin modificarlos.
