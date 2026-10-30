# Notas de traspaso — mvp-0-base

## Estado
- Change propuesto (30/10/2026): `proposal.md`, `design.md`, `tasks.md` y specs `acceso`, `app-pwa` y delta de `design-system`. Próxima: ver tasks.md.
- 1.1 hecha: SvelteKit 3 + Svelte 5 + Vite 8, `adapter-static`, `ssr = false` / `prerender = true` en `src/routes/+layout.ts`. `npm run build` → `build/index.html`.

## Decisiones tomadas con Lio
- Lista blanca en `config/app.ts` (UI) **y** en `firestore.rules` (seguridad). Email confirmado: `joa.demarchi@gmail.com` (único).
- Firebase: proyecto nuevo creado por Lio en la consola; Firestore en `southamerica-east1`. Reglas pegadas a mano en la consola.
- Vercel: import desde GitHub (`joaquinDemarchi/mancuernapp`), deploy al pushear `main`, dominio `*.vercel.app`.
- SvelteKit SPA estática (`adapter-static`, `ssr = false`), una sola ruta `/`.

## Gotchas previstos
- **SvelteKit 3:** no hay `svelte.config.js`; la config (adapter) va en `vite.config.ts` y los alias en `package.json` → `imports`. Por eso el alias de config es `#config/*` (no `$config`), igual que `#lib`.
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
