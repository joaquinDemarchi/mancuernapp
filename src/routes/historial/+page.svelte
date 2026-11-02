<script lang="ts">
	import { anterior, crecimiento, diaMes, formatearPct, formatearVolumen, semana, volumen, type Sesion } from '#lib/calculos.ts';
	import { ejercicios } from '#lib/catalogo.ts';
	import { rutinaActiva } from '#lib/rutina.ts';
	import { sesiones } from '#lib/sesion.ts';
	import Cabecera from '#lib/componentes/Cabecera.svelte';
	import Indicador from '#lib/componentes/Indicador.svelte';

	const tipoDe = (id: string) => $ejercicios?.find((e) => e.id === id)?.tipo;

	// Un grupo por día de la rutina activa, en su orden; lo que no es de esos días va al final.
	const grupos = $derived.by(() => {
		if (!$rutinaActiva || !$sesiones) return [];
		const nuevasPrimero = [...$sesiones].reverse();
		const dias = $rutinaActiva.dias.map((d) => ({
			nombre: d.nombre,
			otros: false,
			sesiones: nuevasPrimero.filter((s) => s.diaId === d.id)
		}));
		const otras = nuevasPrimero.filter((s) => !$rutinaActiva.dias.some((d) => d.id === s.diaId));
		return [...dias, { nombre: 'Otros días', otros: true, sesiones: otras }].filter((g) => g.sesiones.length);
	});

	function fila(s: Sesion) {
		const vol = volumen(s.registros, tipoDe);
		const previa = anterior($sesiones ?? [], s);
		return {
			vol,
			semana: semana($sesiones ?? [], s.diaId, s),
			pct: crecimiento(vol, previa && volumen(previa.registros, tipoDe))
		};
	}
</script>

<main class="pantalla">
	<Cabecera titulo="Historial" volver="/" />
	{#if $sesiones && $rutinaActiva && $ejercicios}
		{#each grupos as g (g.nombre)}
			<section>
				<h2>{g.nombre}</h2>
				{#if g.otros}<p class="nota">De días que ya no están en la rutina: solo para ver.</p>{/if}
				<ul>
					{#each g.sesiones as s (s.id)}
						{@const f = fila(s)}
						<li>
							<!-- Las de otros días todavía no se pueden abrir: la sesión resuelve el día con la rutina activa (MVP 4). -->
							<svelte:element
								this={g.otros ? 'div' : 'a'}
								class="fila"
								href={g.otros ? undefined : `/sesion?dia=${s.diaId}&fecha=${s.fecha}&desde=historial`}
							>
								<span class="fecha">{diaMes(s.fecha)}</span>
								<span class="datos">
									<span class="label">Semana {f.semana}</span>
									<span class="meta">{formatearVolumen(f.vol)}</span>
								</span>
								{#if f.pct !== undefined}
									<span class="pct">{formatearPct(f.pct)}</span>
									<Indicador pct={f.pct} chico />
								{:else}
									<span class="meta">primera vez</span>
								{/if}
							</svelte:element>
						</li>
					{/each}
				</ul>
			</section>
		{:else}
			<div class="vacio">
				<p class="titulo">Todavía no hay sesiones</p>
				<p>Cuando cargues la primera, aparece acá con su volumen.</p>
			</div>
		{/each}
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
		color: var(--ink-muted);
		font: 600 var(--fs-heading) / var(--lh-heading) var(--font-display);
		font-stretch: var(--stretch-condensed);
	}
	.nota {
		margin: calc(var(--space-1) * -1) 0 0;
		color: var(--ink-faint);
		font: 400 var(--fs-meta) / var(--lh-meta) var(--font-text);
	}
	ul {
		display: grid;
		gap: var(--space-1);
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.fila {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		min-height: 64px;
		padding: var(--space-2) var(--space-4);
		border-radius: var(--radius);
		background: var(--surface);
		color: var(--ink);
		text-decoration: none;
	}
	a.fila:focus-visible {
		outline: 2px solid var(--focus);
		outline-offset: 2px;
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
	.pct {
		font: 600 var(--fs-heading) / var(--lh-heading) var(--font-display);
		font-stretch: var(--stretch-condensed);
		font-variant-numeric: tabular-nums;
	}
	.vacio {
		display: grid;
		gap: var(--space-1);
		margin: auto 0;
		text-align: center;
	}
	.vacio p {
		margin: 0;
		color: var(--ink-muted);
		font: 400 var(--fs-body) / var(--lh-body) var(--font-text);
	}
	.vacio .titulo {
		color: var(--ink);
		font: 600 var(--fs-heading) / var(--lh-heading) var(--font-display);
	}
</style>
