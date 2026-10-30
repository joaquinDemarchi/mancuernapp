<script lang="ts">
	import '../../design/tokens.css';
	import '../app.css';
	import { app } from '#config/app';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<svelte:head>
	<title>{app.nombre}</title>
</svelte:head>

{@render children()}
