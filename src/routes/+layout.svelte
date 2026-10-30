<script lang="ts">
	import '../../design/tokens.css';
	import '../app.css';
	import { app } from '#config/app';
	import icon192 from '../../design/icon/icon-192.png?no-inline';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<svelte:head>
	<title>{app.nombre}</title>
	<meta name="theme-color" content={app.colorTema} />
	<link rel="manifest" href="/manifest.webmanifest" />
	<link rel="icon" href={icon192} type="image/png" />
	<link rel="apple-touch-icon" href={icon192} />
</svelte:head>

{@render children()}
