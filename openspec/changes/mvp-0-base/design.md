# Design

## Context

El repo hoy solo tiene documentación, `openspec/`, `design/tokens.css` y `design/icon/` (SVG + PNG 192, 512 y maskable 512). No hay `package.json`. Node 24 y npm 11 en la PC. Remoto: `github.com/joaquinDemarchi/mancuernapp`. Motivo y alcance: ver proposal.md; requisitos: specs `acceso`, `app-pwa` y el delta de `design-system`.

Decisiones ya tomadas con Lio para este change:
- Lista blanca en `config/app.ts` (UI) **y** en `firestore.rules` (seguridad real).
- Proyecto de Firebase nuevo, creado por Lio en la consola; Firestore en `southamerica-east1`.
- Vercel importado desde GitHub, deploy automático al pushear `main`, dominio `*.vercel.app`.
- SvelteKit como SPA estática (sin SSR).

## Goals / Non-Goals

**Goals:**
- Un esqueleto chico y sin dependencias extra que los MVP 1–4 extiendan sin rehacer nada.
- Una sola fuente para nombre, íconos y tokens; la app no duplica assets de `design/`.
- Que la app abra offline desde el primer día, aunque todavía no tenga datos.

**Non-Goals:**
- Persistencia offline de Firestore y modelo de dominio (MVP 2 y MVP 1).
- Tests automatizados: la lógica de este change es mínima; se valida con `npm run check`, `npm run build` y una checklist manual en el celu.
- Mockup previo de la pantalla vacía: es un estado vacío con dos componentes ya definidos en el Design System; el ciclo de diseño arranca en MVP 1.

## Decisions

### 1. SvelteKit SPA con `adapter-static` y una sola ruta
- `src/routes/+layout.ts`: `ssr = false`, `prerender = true`. El build genera `index.html` como shell.
- Una única ruta `/` que muestra login o pantalla inicial según el estado de auth. Así no hacen falta rewrites en Vercel ni un fallback por ruta.
- **Alternativa:** `adapter-vercel` con SSR → descartada: Firebase Auth vive en el cliente y el offline se complica sin beneficio.
- Vercel tiene soporte sin configuración para `adapter-static`; no se agrega `vercel.json`.

### 2. `config/app.ts` como fuente única de marca
Exporta `app = { nombre: "MancuernApp", nombreCorto, descripcion, colorFondo, colorTema, listaBlanca: [...] }`. `colorFondo`/`colorTema` repiten `--ground` del tema oscuro porque el manifest no puede leer CSS; se comenta al lado del valor. La lista blanca hoy tiene solo `joa.demarchi@gmail.com`. Se importa con `#config/app` (alias en `package.json` → `imports`; SvelteKit 3 no usa `svelte.config.js`).

### 3. Manifest generado desde `config/app.ts`, íconos importados desde `design/icon/`
- `src/routes/manifest.webmanifest/+server.ts` con `prerender = true` arma el JSON con `app` y con los PNG importados por Vite (`import icon192 from "../../../design/icon/icon-192.png"`). Vite los copia con hash al build: no hay copia manual en `static/`.
- Íconos: 192 y 512 (`purpose: "any"`) + maskable 512 (`purpose: "maskable"`). `display: "standalone"`, `start_url: "/"`.
- `src/app.html` enlaza el manifest, `theme-color` y `apple-touch-icon` (el 192, importado en `+layout.svelte` y puesto con `<svelte:head>`).
- **Alternativa:** copiar los íconos a `static/` → descartada: duplica la fuente y se desincroniza.

### 4. Tokens y Saira
- `+layout.svelte` importa `../../design/tokens.css` y `src/app.css` (reset mínimo + `body` con `--ground`, `--ink`, `--font-text`). No se toca `tokens.css`.
- Saira: un archivo `static/fonts/saira-latin-var.woff2` bajado una vez de Google Fonts (`css2?family=Saira:wdth,wght@75..100,400..700`, subconjunto latín) + `static/fonts/OFL.txt`. `@font-face` en `app.css` con `font-stretch: 75% 100%`, `font-weight: 400 700`, `font-display: swap`; `<link rel="preload" as="font" crossorigin>` en `app.html`.
- Antes de commitear se verifica que el archivo trae los ejes `wdth` y `wght` (si el de Google no los trae, se usa el de `@fontsource-variable/saira` con ejes completos, copiado igual a `static/fonts/`).
- **Alternativa:** cargar desde Google Fonts → descartada: depende de terceros y no anda offline.

### 5. Service worker nativo de SvelteKit
- `src/service-worker/index.ts` (con su `tsconfig.json`) usa `$app/manifest`: precachea `immutable`, `assets` y `prerendered` (shell, manifest, fuente, íconos) en una caché con nombre por `version`.
- `fetch`: solo `GET` del mismo origen. Assets precacheados → caché primero. Navegaciones → red y, si falla, el `/` cacheado. Todo lo demás (Firebase, Google) no se intercepta.
- `install` hace `skipWaiting()`, `activate` borra cachés viejas y hace `clients.claim()`: la versión nueva queda activa en la siguiente apertura.
- **Alternativa:** `@vite-pwa/sveltekit` (Workbox) → descartada por ahora: más dependencia y config para un caso que el SW nativo cubre en ~40 líneas.

### 6. Firebase: config pública en el repo, seguridad en reglas
- `config/firebase.ts` con el `firebaseConfig` que copia Lio de la consola. Es público por diseño (va igual al navegador); no se usan variables de entorno, así Vercel no necesita configuración.
- `src/lib/firebase.ts` inicializa `app`, `auth` y `db` (`getFirestore`, sin persistencia offline todavía).
- `src/lib/acceso.ts`: `entrar()` con `signInWithPopup(GoogleAuthProvider)`, `salir()`, `emailPermitido(email)` (comparación en minúsculas contra `app.listaBlanca`), y `asegurarUsuario(user)` que crea `users/{uid}` solo si no existe (`getDoc` + `setDoc`).
- Estado de sesión: un store Svelte alimentado por `onAuthStateChanged`, con tres valores: `cargando`, `sin-sesion` (+ mensaje opcional "Esta cuenta no tiene acceso"), `con-sesion`. Si el email no está permitido se llama a `salir()` y se pasa a `sin-sesion` con el mensaje.
- **Popup y no redirect:** el redirect de Firebase falla en navegadores que bloquean cookies de terceros cuando el `authDomain` no es el dominio de la app; el popup funciona en Chrome Android y en la PWA instalada.

### 7. Reglas de Firestore
`firestore.rules` en la raíz del repo:
```
function permitido() {
  return request.auth != null && request.auth.token.email_verified
    && request.auth.token.email.lower() in ['joa.demarchi@gmail.com'];
}
match /users/{uid}/{document=**} { allow read, write: if permitido() && request.auth.uid == uid; }
```
(con el `match /users/{uid}` raíz también cubierto). Lio la pega en la consola (Firestore → Reglas) y la prueba en el Rules Playground. La lista se repite a mano respecto de `config/app.ts`; ambos lugares llevan un comentario que apunta al otro.

### 8. Pantallas y componentes
- `src/lib/componentes/Boton.svelte` (primario/secundario, ≥ `--touch-primary`) y `BarraAccion.svelte` (fija abajo, `--surface`, todo el ancho), solo con los estados que se usan acá; siguen la tabla de componentes de `design/README.md`.
- Login: nombre e ícono arriba, mensaje de error si lo hay, `BarraAccion` con "Entrar con Google" (primario).
- Inicial: nombre arriba, estado vacío "Todavía no hay rutina" al centro, `BarraAccion` con "Cerrar sesión" (secundario).
- Mientras `cargando`: solo el fondo `--ground` (evita el parpadeo del login).

## Risks / Trade-offs

- [Lista blanca duplicada en `config/app.ts` y `firestore.rules`] → comentario cruzado en ambos; cambia muy rara vez. Una lista editable en Firestore queda para cuando haya más usuarios.
- [Reglas pegadas a mano en la consola pueden quedar distintas del archivo] → la tarea de Firebase incluye verificar en el Rules Playground; si molesta, se pasa a `firebase deploy --only firestore:rules` más adelante.
- [Popup bloqueado o cerrado por el usuario] → se captura el error y se vuelve a `sin-sesion` sin mensaje de acceso denegado.
- [Login offline] → sin conexión y sin sesión previa no se puede entrar; con sesión previa Firebase Auth restaura el usuario desde IndexedDB y la pantalla inicial abre.
- [SW cachea una versión rota] → la caché se versiona por build; un deploy nuevo la reemplaza en la siguiente apertura.
- [Dominio de Vercel no autorizado en Firebase Auth] → el popup falla con `auth/unauthorized-domain`; la tarea de deploy incluye agregarlo en Authentication → Settings → Authorized domains.

## Migration Plan

No hay nada previo que migrar. Orden: proyecto local → Firebase (Lio) → pantallas → push a GitHub y Vercel (con OK de Lio). Rollback: en Vercel, "Promote" del deploy anterior; las reglas anteriores quedan en el historial de la consola.
