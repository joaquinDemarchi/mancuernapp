<script lang="ts">
	import { goto } from '$app/navigation';
	import { describir, ejercicios } from '#lib/catalogo.ts';
	import { coincide } from '#lib/texto.ts';
	import Boton from '#lib/componentes/Boton.svelte';
	import BarraAccion from '#lib/componentes/BarraAccion.svelte';
	import Cabecera from '#lib/componentes/Cabecera.svelte';

	let busqueda = $state('');
	const filtrados = $derived(($ejercicios ?? []).filter((e) => coincide(e.nombre, busqueda)));
	const cantidad = $derived(
		$ejercicios ? `${$ejercicios.length} ejercicio${$ejercicios.length === 1 ? '' : 's'}` : undefined
	);
</script>

<main class="pantalla">
	<Cabecera titulo="Ejercicios" volver="/" meta={cantidad} />
	{#if $ejercicios?.length}
		<label class="buscador">
			<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
				<circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="2.5" />
				<path d="M15.5 15.5 21 21" stroke="currentColor" stroke-width="2.5" stroke-linecap="square" />
			</svg>
			<input type="search" placeholder="Buscar" aria-label="Buscar ejercicio" bind:value={busqueda} />
		</label>
		<ul>
			{#each filtrados as e (e.id)}
				<li>
					<a href="/ejercicio?id={e.id}">
						<span class="nombre">{e.nombre}</span>
						<span class="meta">{describir(e)}</span>
					</a>
				</li>
			{:else}
				<li class="vacio">No hay ejercicios con «{busqueda.trim()}»</li>
			{/each}
		</ul>
	{:else if $ejercicios}
		<p class="vacio">Todavía no hay ejercicios</p>
	{/if}
</main>
<BarraAccion><Boton onclick={() => goto('/ejercicio')}>Nuevo ejercicio</Boton></BarraAccion>

<style>
	.buscador {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		min-height: var(--touch-primary);
		margin-bottom: var(--space-3);
		padding: 0 var(--space-3);
		border: 2px solid var(--control);
		border-radius: var(--radius);
		color: var(--ink-muted);
	}
	.buscador:focus-within {
		outline: 2px solid var(--focus);
		outline-offset: 2px;
	}
	input {
		flex: 1;
		min-width: 0;
		border: 0;
		outline: 0;
		background: transparent;
		color: var(--ink);
		font: 400 var(--fs-body) / var(--lh-body) var(--font-text);
	}
	ul {
		display: grid;
		gap: var(--space-1);
		margin: 0;
		padding: 0;
		list-style: none;
	}
	a {
		display: grid;
		align-content: center;
		min-height: 64px;
		padding: var(--space-2) var(--space-4);
		border-radius: var(--radius);
		background: var(--surface);
		color: var(--ink);
		text-decoration: none;
	}
	a:focus-visible {
		outline: 2px solid var(--focus);
		outline-offset: 2px;
	}
	.nombre {
		font: 600 var(--fs-heading) / var(--lh-heading) var(--font-display);
		font-stretch: var(--stretch-condensed);
	}
	.meta {
		font: 400 var(--fs-meta) / var(--lh-meta) var(--font-text);
		color: var(--ink-faint);
	}
	.vacio {
		margin: auto 0;
		padding: var(--space-6) 0;
		text-align: center;
		color: var(--ink-muted);
		font: 400 var(--fs-body) / var(--lh-body) var(--font-text);
	}
</style>
