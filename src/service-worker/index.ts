import { version } from '$app/env';
import { assets, immutable, prerendered } from '$app/manifest';
import { self as sw } from '$app/service-worker';

// Precachea el shell, la fuente y los íconos para que la app abra sin conexión
const CACHE = `cache-${version}`;
const ASSETS = [...immutable, ...assets, ...prerendered].map(({ path }) => '/' + path.replace(/^\//, ''));

sw.addEventListener('install', (event) => {
	event.waitUntil(
		caches
			.open(CACHE)
			.then((cache) => cache.addAll(ASSETS))
			.then(() => sw.skipWaiting())
	);
});

sw.addEventListener('activate', (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
			.then(() => sw.clients.claim())
	);
});

sw.addEventListener('fetch', (event) => {
	const url = new URL(event.request.url);
	// Firebase, Google y cualquier otro origen van directo a la red
	if (event.request.method !== 'GET' || url.origin !== sw.location.origin) return;

	event.respondWith(
		(async () => {
			const cache = await caches.open(CACHE);

			if (ASSETS.includes(url.pathname)) {
				const cached = await cache.match(url.pathname);
				if (cached) return cached;
			}

			try {
				return await fetch(event.request);
			} catch (error) {
				// Sin red: las navegaciones caen al shell cacheado
				const fallback =
					(await cache.match(url.pathname)) ??
					(event.request.mode === 'navigate' ? await cache.match('/') : undefined);
				if (fallback) return fallback;
				throw error;
			}
		})()
	);
});
