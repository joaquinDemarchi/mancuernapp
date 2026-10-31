<script lang="ts">
	import { goto } from '$app/navigation';
	import { app } from '#config/app';
	import { salir } from '#lib/acceso.ts';
	import { diaMes, diaSugerido, formatearVolumen, hoy, semana, sesionDeHoy, volumen } from '#lib/calculos.ts';
	import { ejercicios } from '#lib/catalogo.ts';
	import { crearRutina, fechaCorta, rutinaActiva } from '#lib/rutina.ts';
	import { sesiones } from '#lib/sesion.ts';
	import Boton from '#lib/componentes/Boton.svelte';
	import BarraAccion from '#lib/componentes/BarraAccion.svelte';
	import Cabecera from '#lib/componentes/Cabecera.svelte';
	import OpcionesChip from '#lib/componentes/OpcionesChip.svelte';

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

	// Tarjeta "Hoy": la sesión de hoy si existe; si no, el día sugerido o el elegido con los chips.
	const deHoy = $derived($sesiones && sesionDeHoy($sesiones));
	const sugerido = $derived($rutinaActiva && $sesiones && diaSugerido($rutinaActiva, $sesiones));
	let elegido = $state<string>();
	const diaId = $derived(deHoy?.diaId ?? elegido ?? sugerido?.id);
	const dia = $derived($rutinaActiva?.dias.find((d) => d.id === diaId));
	const ultima = $derived($sesiones?.filter((s) => s.fecha < hoy()).at(-1));

	const metaHoy = $derived.by(() => {
		if (!dia || !$sesiones) return '';
		if (deHoy?.terminada) {
			const tipoDe = (id: string) => $ejercicios?.find((e) => e.id === id)?.tipo;
			return `Terminada · ${formatearVolumen(volumen(deHoy.registros, tipoDe))}`;
		}
		if (deHoy) {
			const extras = deHoy.registros.filter((r) => !dia.items.some((i) => i.ejercicioId === r.ejercicioId));
			return `En curso · ${deHoy.registros.length} de ${dia.items.length + extras.length} hechos`;
		}
		if (!$sesiones.length) return 'Primera vez';
		const anterior = $rutinaActiva?.dias.find((d) => d.id === ultima?.diaId);
		const partes = [`Semana ${semana($sesiones, dia.id)}`, cantidad(dia.items.length)];
		if (anterior) partes.push(`la última fue ${anterior.nombre}`);
		return partes.join(' · ');
	});

	function hechoEl(id: string) {
		const s = $sesiones?.findLast((s) => s.diaId === id);
		return s ? ` · hecho el ${diaMes(s.fecha)}` : '';
	}
</script>

<main class="pantalla">
	<Cabecera titulo={app.nombre}>
		{#snippet accion()}<button class="texto" onclick={salir}>Salir</button>{/snippet}
	</Cabecera>
	{#if $rutinaActiva}
		<p class="meta">Rutina activa · desde {fechaCorta($rutinaActiva.inicio)}</p>
		<h2>{$rutinaActiva.nombre}</h2>
		{#if dia}
			<section class="hoy" aria-label="Hoy">
				<div>
					<h3>Hoy: {dia.nombre}</h3>
					<p class="meta">{metaHoy}</p>
				</div>
				{#if !deHoy && $rutinaActiva.dias.length > 1}
					<OpcionesChip
						bind:valor={() => dia.id, (v) => (elegido = v)}
						opciones={$rutinaActiva.dias.map((d) => ({ valor: d.id, etiqueta: d.nombre }))}
						leyenda="Cambiar el día"
					/>
				{/if}
				{#if deHoy?.terminada}
					<Boton variante="secundario" onclick={() => goto(`/sesion?dia=${dia.id}`)}>Ver sesión</Boton>
				{:else}
					<Boton onclick={() => goto(`/sesion?dia=${dia.id}`)}>{deHoy ? 'Seguir' : 'Empezar'} {dia.nombre}</Boton>
				{/if}
			</section>
		{/if}
		<ul>
			{#each $rutinaActiva.dias as dia (dia.id)}
				<li>
					<a href="/rutina?dia={dia.id}">
						<span>
							<span class="nombre">{dia.nombre}</span>
							<span class="meta">{cantidad(dia.items.length)}{hechoEl(dia.id)}</span>
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
		<Boton variante="secundario" onclick={() => goto('/rutina')}>Editar rutina</Boton>
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
	.hoy {
		display: grid;
		gap: var(--space-3);
		margin-bottom: var(--space-4);
		padding: var(--space-4);
		border-radius: var(--radius);
		background: var(--raised);
	}
	h3 {
		margin: 0;
		font: 600 var(--fs-heading) / var(--lh-heading) var(--font-display);
		font-stretch: var(--stretch-condensed);
	}
	/* Chips no elegidos en --surface: sobre la tarjeta --raised no se verían */
	.hoy :global(input:not(:checked) + span) {
		background: var(--surface);
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
