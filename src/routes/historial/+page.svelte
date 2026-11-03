<script lang="ts">
	import { goto } from '$app/navigation';
	import { anterior, crecimiento, diaMes, diaSugerido, formatearPct, formatearVolumen, semana, volumen, type Sesion } from '#lib/calculos.ts';
	import { ejercicios } from '#lib/catalogo.ts';
	import { fechaCorta, rutinaActiva, rutinas, volverARutina, type Rutina } from '#lib/rutina.ts';
	import { sesiones } from '#lib/sesion.ts';
	import Boton from '#lib/componentes/Boton.svelte';
	import Cabecera from '#lib/componentes/Cabecera.svelte';
	import Hoja from '#lib/componentes/Hoja.svelte';
	import Indicador from '#lib/componentes/Indicador.svelte';

	const tipoDe = (id: string) => $ejercicios?.find((e) => e.id === id)?.tipo;

	const nuevasPrimero = $derived([...($sesiones ?? [])].reverse());
	// Un grupo por día de la rutina activa, en su orden.
	const grupos = $derived(
		($rutinaActiva?.dias ?? [])
			.map((d) => ({ nombre: d.nombre, sesiones: nuevasPrimero.filter((s) => s.diaId === d.id) }))
			.filter((g) => g.sesiones.length)
	);
	// Debajo, las archivadas de la más nueva a la más vieja, plegadas de entrada.
	const archivadas = $derived(
		($rutinas ?? [])
			.filter((r) => r.estado === 'archivada')
			.reverse()
			.map((r) => ({ rutina: r, sesiones: nuevasPrimero.filter((s) => s.rutinaId === r.id) }))
	);
	let abiertas = $state<string[]>([]);
	const plegar = (id: string) => (abiertas = abiertas.includes(id) ? abiertas.filter((a) => a !== id) : [...abiertas, id]);
	const sesionesTexto = (n: number) => `${n} ${n === 1 ? 'sesión' : 'sesiones'}`;

	// "Volver a esta rutina": confirmación en una hoja.
	let volviendo = $state<Rutina>();
	let confirmarVolver = $state(false);
	const tocaDia = $derived(volviendo && $sesiones ? diaSugerido(volviendo, $sesiones)?.nombre : undefined);
	function volver() {
		if (!volviendo) return;
		volverARutina(volviendo.id);
		goto('/');
	}

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
	{#if $sesiones && $rutinas && $ejercicios}
		{#each grupos as g (g.nombre)}
			<section>
				<h2>{g.nombre}</h2>
				<ul>
					{#each g.sesiones as s (s.id)}
						{@render filaSesion(s)}
					{/each}
				</ul>
			</section>
		{/each}
		{#if archivadas.length}
			<section>
				<h3>Rutinas anteriores</h3>
				{#each archivadas as { rutina: r, sesiones: ss } (r.id)}
					{@const abierta = abiertas.includes(r.id)}
					<button type="button" class="grupo" aria-expanded={abierta} aria-controls="rutina-{r.id}" onclick={() => plegar(r.id)}>
						<span class="datos">
							<span class="label">{r.nombre}</span>
							<span class="meta">{fechaCorta(r.inicio)} – {fechaCorta(r.fin ?? '')} · {sesionesTexto(ss.length)}</span>
						</span>
						<svg class="chevron" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
							<path d={abierta ? 'm6 15 6-6 6 6' : 'm6 9 6 6 6-6'} fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="square" />
						</svg>
					</button>
					{#if abierta}
						<div class="archivada" id="rutina-{r.id}">
							<ul>
								{#each ss as s (s.id)}
									{@render filaSesion(s, r)}
								{/each}
							</ul>
							<button
								type="button"
								class="texto sutil"
								onclick={() => {
									volviendo = r;
									confirmarVolver = true;
								}}>Volver a esta rutina</button
							>
						</div>
					{/if}
				{/each}
			</section>
		{/if}
		{#if !$sesiones.length}
			<div class="vacio">
				<p class="titulo">Todavía no hay sesiones</p>
				<p>Cuando cargues la primera, aparece acá con su volumen.</p>
			</div>
		{/if}
	{/if}
	{#if volviendo}
		<Hoja bind:abierta={confirmarVolver} titulo="¿Volver a {volviendo.nombre}?">
			<p class="explica">
				{volviendo.nombre} vuelve a ser la activa y sigue donde la dejaste{tocaDia ? ` (te toca ${tocaDia})` : ''}.
				{#if $rutinaActiva}{$rutinaActiva.nombre} pasa al historial con fin hoy.{/if}
			</p>
			<Boton onclick={volver}>Volver a {volviendo.nombre}</Boton>
			<button type="button" class="texto sutil cancelar" onclick={() => (confirmarVolver = false)}>Cancelar</button>
		</Hoja>
	{/if}
</main>

<!-- En las archivadas, la fila dice el día en lugar de "Semana N" (que pasa a la meta). -->
{#snippet filaSesion(s: Sesion, archivada?: Rutina)}
	{@const f = fila(s)}
	<li>
		<a class="fila" class:elevada={archivada} href="/sesion?dia={s.diaId}&fecha={s.fecha}&rutina={s.rutinaId}&desde=historial">
			<span class="fecha">{diaMes(s.fecha)}</span>
			<span class="datos">
				{#if archivada}
					<span class="label">{archivada.dias.find((d) => d.id === s.diaId)?.nombre ?? 'Sesión'}</span>
					<span class="meta">semana {f.semana} · {formatearVolumen(f.vol)}</span>
				{:else}
					<span class="label">Semana {f.semana}</span>
					<span class="meta">{formatearVolumen(f.vol)}</span>
				{/if}
			</span>
			{#if f.pct !== undefined}
				<span class="pct">{formatearPct(f.pct)}</span>
				<Indicador pct={f.pct} chico />
			{:else}
				<span class="meta">primera vez</span>
			{/if}
		</a>
	</li>
{/snippet}

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
	h3 {
		margin: var(--space-4) 0 0;
		color: var(--ink-muted);
		font: 600 var(--fs-meta) / var(--lh-meta) var(--font-text);
	}
	.grupo {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		min-height: 64px;
		padding: var(--space-2) var(--space-4);
		border: 0;
		border-radius: var(--radius);
		background: var(--surface);
		color: var(--ink);
		text-align: left;
		cursor: pointer;
	}
	.grupo:focus-visible {
		outline: 2px solid var(--focus);
		outline-offset: 2px;
	}
	.chevron {
		flex: none;
		color: var(--ink-faint);
	}
	.archivada {
		display: grid;
		justify-items: start;
		gap: var(--space-1);
	}
	.archivada ul {
		width: 100%;
	}
	.archivada .texto {
		margin-left: calc(var(--space-3) * -1);
	}
	.fila.elevada {
		background: var(--raised);
	}
	.explica {
		margin: 0;
		color: var(--ink-muted);
		font: 400 var(--fs-body) / var(--lh-body) var(--font-text);
	}
	.cancelar {
		justify-self: center;
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
