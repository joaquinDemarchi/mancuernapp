# Notas de traspaso — mvp-0-base

## Estado
- Change propuesto (30/10/2026): `proposal.md`, `design.md`, `tasks.md` y specs `acceso`, `app-pwa` y delta de `design-system`. Próxima: ver tasks.md.
- 1.1 hecha: SvelteKit 3 + Svelte 5 + Vite 8, `adapter-static`, `ssr = false` / `prerender = true` en `src/routes/+layout.ts`. `npm run build` → `build/index.html`.
- 1.2 hecha: `config/app.ts` (`app.nombre`, colores, `listaBlanca`), `src/app.css` (reset + body con tokens), `+layout.svelte` importa `design/tokens.css` y pone el `<title>`. Verificado en dev: fondo `rgb(20,19,17)`, título "MancuernApp". `.claude/launch.json` con `dev` (5173) y `preview` (4173).
- 1.3 hecha: `static/fonts/saira-latin-var.woff2` (99 KB, de Google Fonts v23, subconjunto latín) + `OFL.txt`; `@font-face` en `app.css` y `preload` en `app.html`. Verificado en el navegador: a 96 px `1234567890` mide 595 px al 100 % y 462 px al 75 % (eje `wdth` activo), `wght` 400→700 cambia el ancho, `1111` = `0000` (cifras tabulares), única petición de fuente a `localhost`. No hizo falta fontsource.
- 2.1 hecha: `src/routes/manifest.webmanifest/+server.ts` (prerender) arma el manifest desde `config/app.ts` con los PNG de `design/icon/` importados por Vite. `+layout.svelte` agrega `theme-color`, `manifest`, `icon` y `apple-touch-icon` en `<svelte:head>`. Verificado en `preview`: 200 `application/manifest+json`, standalone, 3 íconos cargan con su tamaño real.
- 2.2 hecha: `src/service-worker/index.ts` precachea `immutable` + `assets` + `prerendered` (18 archivos: JS/CSS, ícono 192, Saira, `/`, manifest) en `cache-<version>`; caché primero para esos, red para el resto, fallback a `/` en navegaciones, no toca otros orígenes. Verificado en `preview`: SW `activated`, caché con la fuente; con el servidor apagado la app recarga con fondo grafito, Saira `loaded` e ícono.
- **Próxima: 3.1** (necesita que Lio cree el proyecto de Firebase).

## Decisiones tomadas con Lio
- Lista blanca en `config/app.ts` (UI) **y** en `firestore.rules` (seguridad). Email confirmado: `joa.demarchi@gmail.com` (único).
- Firebase: proyecto nuevo creado por Lio en la consola; Firestore en `southamerica-east1`. Reglas pegadas a mano en la consola.
- Vercel: import desde GitHub (`joaquinDemarchi/mancuernapp`), deploy al pushear `main`, dominio `*.vercel.app`.
- SvelteKit SPA estática (`adapter-static`, `ssr = false`), una sola ruta `/`.

## Gotchas previstos
- **SW en SvelteKit 3:** ya no existe `$service-worker`. Se usa `$app/manifest` (`immutable`, `assets`, `prerendered` como `{ path }` sin `/` inicial), `$app/env` (`version`) y `$app/service-worker` (`self`). El SW va en la carpeta `src/service-worker/` con su `tsconfig.json` (`extends: $app/tsconfig/service-worker`) y el `tsconfig.json` raíz lo excluye. `svelte-check` no lo revisa: usar `npx tsc --noEmit -p src/service-worker`.
- `icon-512` y maskable no se precachean (solo los usa el manifest); Android los baja al instalar.
- `vite preview` no ve archivos nuevos del build (p. ej. `service-worker.js`) hasta reiniciarlo.
- `icon-192.png` pesa < 4 KB y Vite lo inlinea como data URI: se importa con `?no-inline` para que sea un archivo.
- Con `ssr = false` los `<svelte:head>` no están en el HTML prerenderizado; se insertan al correr el JS (Chrome igual detecta el manifest).
- **SvelteKit 3:** no hay `svelte.config.js`; la config (adapter) va en `vite.config.ts` y los alias en `package.json` → `imports`. Por eso el alias de config es `#config/*` (no `$config`), igual que `#lib`. Mapea a `./config/*.ts`, así se importa `#config/app` sin extensión. `tsconfig.json` incluye `config`.
- El `firebaseConfig` es público: va en `config/firebase.ts` commiteado; la seguridad está en las reglas.
- Login con popup, no redirect (el redirect falla con cookies de terceros bloqueadas).
- El dominio de Vercel hay que agregarlo en Firebase Auth → Authorized domains o el popup da `auth/unauthorized-domain`.
- `bundle.css` de los componentes vive en el artifact Design System (privado), no en el repo.
- Costo: §9 estimaba ~15k para este change; con Saira, SW, auth y reglas queda en ~70k.

## Checklist de verificación en el celu (5.2)
- [ ] Instalar desde Chrome Android; nombre "MancuernApp" e ícono maskable sin recorte
- [ ] Login con Google (email de la lista) → pantalla inicial con "Todavía no hay rutina"
- [ ] Cerrar y reabrir → entra sin loguearse
- [ ] Modo avión → abre con Saira e ícono
- [ ] "Cerrar sesión" → vuelve al login
