<script lang="ts">
	import '../../design/tokens.css';
	import '../app.css';
	import { app } from '#config/app';
	import { sesion } from '#lib/acceso.ts';
	import Login from '#lib/componentes/Login.svelte';
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

<!-- Mientras carga solo se ve el fondo, así no parpadea el login. -->
{#if $sesion.estado === 'sin-sesion'}
	<Login />
{:else if $sesion.estado === 'con-sesion'}
	{@render children()}
{/if}
