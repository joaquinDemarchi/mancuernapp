<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		titulo,
		volver,
		meta,
		accion
	}: {
		titulo: string;
		/** Ruta a la que vuelve la flecha; sin ella no hay flecha. */
		volver?: string;
		meta?: string;
		/** Botón de texto a la derecha (p. ej. "Salir"). */
		accion?: Snippet;
	} = $props();
</script>

<header>
	{#if volver}
		<a href={volver} aria-label="Volver">
			<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
				<path d="M15 4 7 12l8 8" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="square" />
			</svg>
		</a>
	{/if}
	<div>
		<h1>{titulo}</h1>
		{#if meta}<p>{meta}</p>{/if}
	</div>
	{#if accion}{@render accion()}{/if}
</header>

<style>
	header {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		min-height: 64px;
	}
	a {
		display: grid;
		place-items: center;
		flex: none;
		width: var(--touch-min);
		height: var(--touch-min);
		margin-left: calc(var(--space-3) * -1);
		border-radius: var(--radius);
		color: var(--ink);
	}
	a:focus-visible {
		outline: 2px solid var(--focus);
		outline-offset: 2px;
	}
	div {
		flex: 1;
		min-width: 0;
	}
	h1 {
		margin: 0;
		font: 700 var(--fs-title) / var(--lh-title) var(--font-display);
		font-stretch: var(--stretch-condensed);
		overflow-wrap: anywhere;
	}
	p {
		margin: 0;
		font: 400 var(--fs-meta) / var(--lh-meta) var(--font-text);
		color: var(--ink-faint);
	}
</style>
