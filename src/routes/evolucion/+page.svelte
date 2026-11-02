<script lang="ts">
	import { page } from '$app/state';
	import { diaMes, evolucion, formatear, formatearVolumen } from '#lib/calculos.ts';
	import { ejercicios, tipos } from '#lib/catalogo.ts';
	import { rutinaActiva } from '#lib/rutina.ts';
	import { sesiones } from '#lib/sesion.ts';
	import Cabecera from '#lib/componentes/Cabecera.svelte';
	import GraficoEvolucion from '#lib/componentes/GraficoEvolucion.svelte';

	// Derivado: de una evolución a otra la página no se vuelve a montar.
	const id = $derived(page.url.searchParams.get('id') ?? '');
	const ejercicio = $derived($ejercicios?.find((e) => e.id === id));
	const veces = $derived(ejercicio && $sesiones ? evolucion($sesiones, id, ejercicio.tipo) : []);

	// Solo la rutina activa está en memoria: las demás todavía no tienen nombre a mano (MVP 4).
	const nombreRutina = (rutinaId: string) => (rutinaId === $rutinaActiva?.id ? $rutinaActiva.nombre : 'Otra rutina');
	const nombreDia = (rutinaId: string, diaId: string) =>
		rutinaId === $rutinaActiva?.id ? ($rutinaActiva.dias.find((d) => d.id === diaId)?.nombre ?? '') : nombreRutina(rutinaId);

	const meta = $derived.by(() => {
		if (!ejercicio) return '';
		const tipo = tipos.find((t) => t.valor === ejercicio.tipo)?.etiqueta;
		if (!veces.length) return `${tipo} · sin cargar todavía`;
		return `${tipo} · ${veces.length === 1 ? '1 vez' : `${veces.length} veces`} desde ${diaMes(veces[0].fecha)}`;
	});
</script>

<main class="pantalla">
	<!-- Vuelve a donde se abrió (sesión, ficha o historial); entrando directo, al catálogo. -->
	<Cabecera titulo={ejercicio?.nombre ?? 'Ejercicio'} {meta} volver="/ejercicios" atras />
	{#if ejercicio && $sesiones}
		{#if ejercicio.tipo === 'peso' && veces.length}
			<section>
				<h2>Volumen por vez</h2>
				<GraficoEvolucion {veces} nombre={ejercicio.nombre} {nombreRutina} />
			</section>
		{/if}
		{#if veces.length}
			<section>
				<h2>Cada vez</h2>
				<ul>
					{#each [...veces].reverse() as v (v.sesionId)}
						<li>
							<span class="fecha">{diaMes(v.fecha)}</span>
							<span class="datos">
								<span class="label">{nombreDia(v.rutinaId, v.diaId)}</span>
								<span class="meta">{formatear(ejercicio.tipo, v.bloques)}</span>
							</span>
							{#if v.volumen !== undefined}<span class="volumen">{formatearVolumen(v.volumen)}</span>{/if}
						</li>
					{/each}
				</ul>
			</section>
		{:else}
			<p class="vacio">Cuando lo cargues en una sesión, aparece acá.</p>
		{/if}
	{/if}
</main>

<style>
	section {
		display: grid;
		gap: var(--space-2);
		margin-bottom: var(--space-4);
	}
	h2 {
		margin: 0;
		font: 600 var(--fs-body) / var(--lh-body) var(--font-text);
	}
	ul {
		display: grid;
		gap: var(--space-1);
		margin: 0;
		padding: 0;
		list-style: none;
	}
	li {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		min-height: 64px;
		padding: var(--space-2) var(--space-4);
		border-radius: var(--radius);
		background: var(--surface);
	}
	.fecha {
		flex: none;
		width: 52px;
		font: 600 var(--fs-heading) / var(--lh-heading) var(--font-display);
		font-stretch: var(--stretch-condensed);
		font-variant-numeric: tabular-nums;
	}
	.datos {
		display: grid;
		flex: 1;
		min-width: 0;
	}
	.label {
		font: 600 var(--fs-body) / var(--lh-body) var(--font-text);
	}
	.meta {
		color: var(--ink-muted);
		font: 400 var(--fs-meta) / var(--lh-meta) var(--font-text);
		font-variant-numeric: tabular-nums;
	}
	.volumen {
		font: 600 var(--fs-body) / var(--lh-body) var(--font-text);
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
	}
	.vacio {
		margin: auto 0;
		color: var(--ink-muted);
		font: 400 var(--fs-body) / var(--lh-body) var(--font-text);
		text-align: center;
	}
</style>
