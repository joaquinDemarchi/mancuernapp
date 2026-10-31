<script lang="ts">
	import { goto } from '$app/navigation';
	import { app } from '#config/app';
	import { salir } from '#lib/acceso.ts';
	import { crearRutina, fechaCorta, rutinaActiva } from '#lib/rutina.ts';
	import Boton from '#lib/componentes/Boton.svelte';
	import BarraAccion from '#lib/componentes/BarraAccion.svelte';
	import Cabecera from '#lib/componentes/Cabecera.svelte';

	let creando = $state(false);

	async function crear() {
		creando = true;
		try {
			await crearRutina();
			goto('/rutina');
		} finally {
			creando = false;
		}
	}

	function cantidad(n: number) {
		return n ? `${n} ejercicio${n === 1 ? '' : 's'}` : 'Sin ejercicios';
	}
</script>

<main class="pantalla">
	<Cabecera titulo={app.nombre}>
		{#snippet accion()}<button class="texto" onclick={salir}>Salir</button>{/snippet}
	</Cabecera>
	{#if $rutinaActiva}
		<p class="meta">Rutina activa · desde {fechaCorta($rutinaActiva.inicio)}</p>
		<h2>{$rutinaActiva.nombre}</h2>
		<ul>
			{#each $rutinaActiva.dias as dia (dia.id)}
				<li>
					<a href="/rutina?dia={dia.id}">
						<span>
							<span class="nombre">{dia.nombre}</span>
							<span class="meta">{cantidad(dia.items.length)}</span>
						</span>
						<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
							<path d="M9 4l8 8-8 8" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="square" />
						</svg>
					</a>
				</li>
			{/each}
		</ul>
	{:else if $rutinaActiva === null}
		<div class="vacio">
			<p class="titulo">Todavía no hay rutina</p>
			<p>Armá los días con ejercicios de tu catálogo.</p>
		</div>
	{/if}
</main>
<BarraAccion>
	<Boton variante="secundario" onclick={() => goto('/ejercicios')}>Ejercicios</Boton>
	{#if $rutinaActiva}
		<Boton onclick={() => goto('/rutina')}>Editar rutina</Boton>
	{:else}
		<Boton disabled={creando || $rutinaActiva === undefined} onclick={crear}>Crear rutina</Boton>
	{/if}
</BarraAccion>

<style>
	.vacio {
		margin: auto 0;
		text-align: center;
	}
	p {
		margin: 0;
		font: 400 var(--fs-body) / var(--lh-body) var(--font-text);
		color: var(--ink-muted);
	}
	.titulo {
		font: 600 var(--fs-heading) / var(--lh-heading) var(--font-display);
		color: var(--ink);
	}
	.meta {
		font: 400 var(--fs-meta) / var(--lh-meta) var(--font-text);
		color: var(--ink-faint);
	}
	h2 {
		margin: 0 0 var(--space-4);
		font: 700 var(--fs-title) / var(--lh-title) var(--font-display);
		font-stretch: var(--stretch-condensed);
	}
	ul {
		display: grid;
		gap: var(--space-1);
		margin: 0;
		padding: 0;
		list-style: none;
	}
	a {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-2);
		min-height: 64px;
		padding: var(--space-2) var(--space-4);
		border-radius: var(--radius);
		background: var(--surface);
		color: var(--ink);
		text-decoration: none;
	}
	a > span {
		display: grid;
	}
	a:focus-visible {
		outline: 2px solid var(--focus);
		outline-offset: 2px;
	}
	svg {
		flex: none;
		color: var(--ink-muted);
	}
	.nombre {
		font: 600 var(--fs-heading) / var(--lh-heading) var(--font-display);
		font-stretch: var(--stretch-condensed);
	}
</style>
