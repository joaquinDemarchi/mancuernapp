import { app } from '#config/app';
import icon192 from '../../../design/icon/icon-192.png?no-inline';
import icon512 from '../../../design/icon/icon-512.png';
import iconMaskable from '../../../design/icon/icon-maskable-512.png';

// Manifest armado desde config/app.ts; los íconos salen de design/icon/ (Vite les pone hash)
export const prerender = true;

export function GET() {
	const manifest = {
		name: app.nombre,
		short_name: app.nombreCorto,
		description: app.descripcion,
		lang: 'es',
		start_url: '/',
		scope: '/',
		display: 'standalone',
		background_color: app.colorFondo,
		theme_color: app.colorTema,
		icons: [
			{ src: icon192, sizes: '192x192', type: 'image/png', purpose: 'any' },
			{ src: icon512, sizes: '512x512', type: 'image/png', purpose: 'any' },
			{ src: iconMaskable, sizes: '512x512', type: 'image/png', purpose: 'maskable' }
		]
	};
	return new Response(JSON.stringify(manifest), {
		headers: { 'content-type': 'application/manifest+json' }
	});
}
