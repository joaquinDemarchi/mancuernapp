# Tasks

> Cada tarea: commit local + `[x]` acá + actualizar `traspaso.md`. Costo estimado entre paréntesis.
> Total estimado: ~70k tokens (5 grupos, uno por sesión). Push y deploy solo con OK de Lio.

## 1. Esqueleto SvelteKit + marca + Saira (~15k)

- [x] 1.1 Crear el proyecto SvelteKit mínimo con TypeScript y npm en la raíz del repo (`npx sv create`, sin demo), cambiar a `@sveltejs/adapter-static`, poner `ssr = false` y `prerender = true` en `src/routes/+layout.ts` y el alias `$config` → `config/` en `svelte.config.js`; verificar que `npm run build` genera `build/index.html` (~5k)
- [x] 1.2 Crear `config/app.ts` (nombre, nombre corto, descripción, `colorFondo`/`colorTema` = `--ground` oscuro con comentario, `listaBlanca: ["joa.demarchi@gmail.com"]`), usar `app.nombre` en `<svelte:head><title>`; importar `design/tokens.css` y `src/app.css` (reset mínimo, `body` con `--ground`/`--ink`/`--font-text`) en `+layout.svelte`; verificar con `npm run check` sin errores y el fondo grafito en `npm run dev` (~4k)
- [x] 1.3 Bajar Saira variable woff2 latín (`wdth` 75–100, `wght` 400–700) a `static/fonts/saira-latin-var.woff2` + `static/fonts/OFL.txt`, verificar que trae ambos ejes (si no, usar el de `@fontsource-variable/saira`), declarar `@font-face` en `app.css` y `preload` en `app.html`; verificar en `npm run dev` que un número con `--font-display` + `--stretch-condensed` se ve condensado y que la pestaña Network no pide fuentes a otros dominios; commit (~6k)

## 2. PWA: manifest, íconos y service worker (~14k)

- [x] 2.1 Crear `src/routes/manifest.webmanifest/+server.ts` (prerender) que arma el manifest desde `config/app.ts` con los PNG de `design/icon/` importados por Vite (192, 512 `any`; 512 maskable); enlazarlo en `app.html` junto con `theme-color` y `apple-touch-icon`; verificar con `npm run build && npm run preview` que `/manifest.webmanifest` responde y que DevTools → Application → Manifest no muestra errores (~6k)
- [x] 2.2 Crear `src/service-worker.ts` (precache de `build` + `files` + `prerendered` por `version`; caché primero para assets, red con fallback a `/` en navegaciones; no intercepta otros orígenes; `skipWaiting` + `clients.claim` + limpieza de cachés viejas); verificar en `npm run preview` que con "Offline" en DevTools la app recarga con Saira e ícono, y que la fuente figura en Cache Storage; commit (~8k)

## 3. Firebase y acceso (~18k)

- [x] 3.1 Guiar a Lio para crear el proyecto en la consola de Firebase (app web, Authentication → Google habilitado, Firestore en `southamerica-east1` en modo producción) y pegar el `firebaseConfig` en `config/firebase.ts`; instalar `firebase` y crear `src/lib/firebase.ts` (`app`, `auth`, `db`); verificar con `npm run check` y que la app arranca sin errores en consola (~4k)
- [ ] 3.2 Escribir `firestore.rules` (lista blanca con `email_verified`, cada uno solo `users/{uid}/**`, comentario cruzado con `config/app.ts`); que Lio la pegue en la consola y verificar en el Rules Playground: lectura de `users/{uidLio}` como Lio → permitida, como otro email → denegada, `users/{otroUid}` como Lio → denegada (~5k)
- [ ] 3.3 Crear `src/lib/acceso.ts` (`entrar` con popup, `salir`, `emailPermitido` en minúsculas, `asegurarUsuario` que crea `users/{uid}` solo si no existe) y el store de sesión (`cargando` / `sin-sesion` + mensaje / `con-sesion`) con `onAuthStateChanged`; verificar en `npm run dev` con una página mínima: login con el email de Lio crea el doc en Firestore (visible en consola) y un segundo login no lo pisa; con otra cuenta queda deslogueado con "Esta cuenta no tiene acceso"; commit (~9k)

## 4. Pantallas login e inicial (~12k)

- [ ] 4.1 Crear `src/lib/componentes/Boton.svelte` (primario/secundario; reposo, presionado, foco, deshabilitado; alto `--touch-primary`) y `BarraAccion.svelte` (fija abajo, `--surface`, todo el ancho, con `safe-area-inset-bottom`) siguiendo `design/README.md` (y `bundle.css` del artifact Design System si hace falta el detalle); verificar con `npm run check` y midiendo en DevTools que el botón mide ≥ 56 px de alto (~5k)
- [ ] 4.2 Armar `src/routes/+page.svelte`: `cargando` → solo fondo; login (ícono + nombre, mensaje de error si hay, `BarraAccion` con "Entrar con Google"); inicial (nombre, "Todavía no hay rutina", `BarraAccion` con "Cerrar sesión"); solo tokens, sin valores visuales a mano; verificar los escenarios de `acceso` y `app-pwa` en `npm run dev` a 390 px de ancho, y que reabrir con sesión entra directo; commit (~7k)

## 5. Deploy y verificación en el celu (~11k)

- [ ] 5.1 Con OK de Lio: `git push` a `main`; guiar el import del repo en Vercel (preset SvelteKit, sin variables) y agregar `<proyecto>.vercel.app` en Firebase → Authentication → Authorized domains; verificar que el deploy queda en verde y la URL abre el login (~5k)
- [ ] 5.2 Verificación integral en el celu de Lio (checklist en `traspaso.md`): instalar desde Chrome Android, ícono y nombre correctos (maskable sin recorte), login con Google, pantalla inicial, cerrar y reabrir sin volver a loguearse, abrir en modo avión con Saira, Lighthouse PWA sin errores de instalabilidad; anotar resultados y gotchas; commit (~6k)

## Workflow follow-up

- Archivar el change con `/opsx:archive` cuando Lio confirme la verificación en el celu.
