<script lang="ts">
	// Prototipo descartable (prototipo-flujo-carga): nada se guarda; se borra con el MVP 2.
	import Boton from '#lib/componentes/Boton.svelte';
	import BarraAccion from '#lib/componentes/BarraAccion.svelte';
	import Cabecera from '#lib/componentes/Cabecera.svelte';
	import Hoja from '#lib/componentes/Hoja.svelte';
	import OpcionesChip from '#lib/componentes/OpcionesChip.svelte';
	import Stepper from '#lib/componentes/Stepper.svelte';
	import { dias, diaSugerido, formatear, n, volumen, type Bloque, type EjercicioP } from './datos.ts';

	type Registro = { bloques: Bloque[]; hecho: boolean; ajustado: boolean };

	const nuevosRegistros = () =>
		Object.fromEntries(
			dias.flatMap((d) => d.ejercicios).map((e) => [e.id, { bloques: structuredClone(e.ultima), hecho: false, ajustado: false }])
		) as Record<string, Registro>;

	let variante = $state<'a' | 'b'>('a');
	let diaId = $state(diaSugerido);
	let registros = $state(nuevosRegistros());
	let toques = $state(0);
	let abierto = $state<string | null>(null);
	let hojaAjustar = $state(false);
	let hojaResumen = $state(false);

	const dia = $derived(dias.find((d) => d.id === diaId)!);
	const hechos = $derived(dia.ejercicios.filter((e) => registros[e.id].hecho).length);
	const editando = $derived(dia.ejercicios.find((e) => e.id === abierto));

	function reiniciar() {
		registros = nuevosRegistros();
		diaId = diaSugerido;
		toques = 0;
		abierto = null;
		hojaResumen = false;
	}

	// Cuenta toques sobre controles; el clic sintético del radio (lo dispara su label) no suma.
	function contar(e: MouseEvent) {
		const el = (e.target as Element).closest('button, input, label, a');
		if (!el || el.closest('[data-sin-contar]')) return;
		if (el instanceof HTMLInputElement && el.type === 'radio') return;
		toques++;
	}

	function marcar(ej: EjercicioP) {
		const r = registros[ej.id];
		r.hecho = !r.hecho;
		// Destildar vuelve a la última vez.
		if (!r.hecho) Object.assign(r, { bloques: structuredClone(ej.ultima), ajustado: false });
		if (abierto === ej.id) abierto = null;
	}

	function ajustar(ej: EjercicioP) {
		if (ej.tipo === 'calentamiento') return marcar(ej);
		if (variante === 'a') {
			abierto = abierto === ej.id ? null : ej.id;
		} else {
			abierto = ej.id;
			hojaAjustar = true;
		}
	}

	// Cada toque de −/+ ya cuenta como hecho (guardado instantáneo, §5).
	function cambio(ej: EjercicioP) {
		registros[ej.id].hecho = true;
		registros[ej.id].ajustado = true;
	}

	function listo() {
		if (abierto) registros[abierto].hecho = true;
		abierto = null;
		hojaAjustar = false;
	}

	// Solo los ejercicios de peso hechos (§6).
	const volumenTotal = $derived(
		dia.ejercicios.reduce((t, e) => t + (e.tipo === 'peso' && registros[e.id].hecho ? volumen(registros[e.id].bloques) : 0), 0)
	);
</script>

<svelte:document onclick={contar} />

{#snippet editor(ej: EjercicioP)}
	<div class="editor">
		{#each registros[ej.id].bloques as b, i (i)}
			{#if registros[ej.id].bloques.length > 1}<p class="meta">Bloque {i + 1}</p>{/if}
			<div class="steppers">
				{#if ej.tipo === 'cardio'}
					<Stepper etiqueta="Minutos" bind:valor={b.minutos!} min={1} oncambio={() => cambio(ej)} />
				{:else}
					<Stepper etiqueta="Series" bind:valor={b.series} min={1} oncambio={() => cambio(ej)} />
					{#if ej.tipo === 'tiempo'}
						<Stepper etiqueta="Segundos" bind:valor={b.segundos!} paso={ej.saltoSeg} min={5} oncambio={() => cambio(ej)} />
					{:else}
						<Stepper etiqueta="Reps" bind:valor={b.reps!} paso={ej.saltoReps} min={1} oncambio={() => cambio(ej)} />
					{/if}
					{#if ej.tipo === 'peso'}
						<div class="ancho">
							<Stepper etiqueta="Kg" bind:valor={b.kg!} paso={ej.saltoKg} decimales={1} oncambio={() => cambio(ej)} />
						</div>
					{/if}
				{/if}
			</div>
		{/each}
		<Boton onclick={listo}>Listo</Boton>
	</div>
{/snippet}

<main class="pantalla">
	<Cabecera titulo="Hoy: {dia.nombre}" meta="Prototipo · {toques} toque{toques === 1 ? '' : 's'} · {hechos}/{dia.ejercicios.length} hechos">
		{#snippet accion()}<button class="texto" data-sin-contar onclick={reiniciar}>Reiniciar</button>{/snippet}
	</Cabecera>

	<OpcionesChip
		leyenda="Sugerido Día 2 (la última fue Día 1)"
		bind:valor={diaId}
		opciones={dias.map((d) => ({ valor: d.id, etiqueta: d.nombre }))}
	/>

	<ul>
		{#each dia.ejercicios as ej (ej.id)}
			{@const r = registros[ej.id]}
			<li class:hecho={r.hecho}>
				<div class="fila">
					<button class="cuerpo" aria-expanded={variante === 'a' && ej.tipo !== 'calentamiento' ? abierto === ej.id : undefined} onclick={() => ajustar(ej)}>
						<span class="nombre">{ej.nombre}</span>
						<span class="valores" class:ajustado={r.ajustado}>
							{r.hecho || ej.tipo === 'calentamiento' ? formatear(ej.tipo, r.bloques) : `Última: ${formatear(ej.tipo, ej.ultima)}`}
						</span>
					</button>
					<button class="check" aria-pressed={r.hecho} aria-label="{ej.nombre}: igual que la última vez" onclick={() => marcar(ej)}>
						<svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
							<path d="M4 12.5l5 5L20 6.5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="square" />
						</svg>
					</button>
				</div>
				{#if variante === 'a' && abierto === ej.id}{@render editor(ej)}{/if}
			</li>
		{/each}
	</ul>

	<fieldset class="variante" data-sin-contar>
		<legend>Variante de Ajustar</legend>
		<button aria-pressed={variante === 'a'} onclick={() => ((variante = 'a'), (abierto = null))}>A · fila</button>
		<button aria-pressed={variante === 'b'} onclick={() => ((variante = 'b'), (abierto = null))}>B · hoja</button>
	</fieldset>
</main>

<BarraAccion>
	<Boton disabled={!hechos} onclick={() => (hojaResumen = true)}>Terminar sesión</Boton>
</BarraAccion>

<Hoja bind:abierta={hojaAjustar} titulo={editando?.nombre ?? ''} meta={editando ? `Última: ${formatear(editando.tipo, editando.ultima)}` : ''}>
	{#if editando}{@render editor(editando)}{/if}
</Hoja>

<Hoja bind:abierta={hojaResumen} titulo="Sesión terminada" meta="{dia.nombre} · {toques} toques">
	<div class="resumen">
		<p class="meta">Volumen</p>
		<p class="grande">{n(volumenTotal)} kg</p>
		<div class="resumen" data-sin-contar><Boton onclick={reiniciar}>Probar de nuevo</Boton></div>
	</div>
</Hoja>

<style>
	.meta {
		margin: 0;
		color: var(--ink-faint);
		font: 400 var(--fs-meta) / var(--lh-meta) var(--font-text);
	}
	ul {
		display: grid;
		gap: var(--space-1);
		margin: var(--space-4) 0 0;
		padding: 0;
		list-style: none;
	}
	li {
		border-radius: var(--radius);
		background: var(--surface);
	}
	.fila {
		display: flex;
		align-items: stretch;
	}
	.cuerpo {
		display: grid;
		flex: 1;
		min-width: 0;
		min-height: 64px;
		padding: var(--space-2) var(--space-4);
		border: 0;
		background: transparent;
		color: var(--ink);
		text-align: left;
		cursor: pointer;
	}
	.nombre {
		font: 600 var(--fs-heading) / var(--lh-heading) var(--font-display);
		font-stretch: var(--stretch-condensed);
	}
	.valores {
		color: var(--ink-faint);
		font: 400 var(--fs-body) / var(--lh-body) var(--font-text);
		font-variant-numeric: tabular-nums;
	}
	.hecho .valores {
		color: var(--ink);
	}
	.hecho .valores.ajustado {
		color: var(--accent-ink);
	}
	.check {
		display: grid;
		place-items: center;
		flex: none;
		width: 64px;
		margin: var(--space-2);
		border: 2px solid var(--control);
		border-radius: var(--radius);
		background: transparent;
		color: var(--ink-faint);
		cursor: pointer;
	}
	.check[aria-pressed='true'] {
		border-color: var(--accent);
		background: var(--accent);
		color: var(--on-accent);
	}
	button:focus-visible {
		outline: 2px solid var(--focus);
		outline-offset: 2px;
	}
	.editor {
		display: grid;
		gap: var(--space-3);
		padding: var(--space-2) var(--space-4) var(--space-4);
	}
	.steppers {
		display: grid;
		/* Dos columnas cortaban el número en celus angostos (prueba de Joa) */
		grid-template-columns: 1fr;
		gap: var(--space-3);
	}
	.ancho {
		grid-column: 1 / -1;
	}
	.variante {
		display: flex;
		gap: var(--space-2);
		margin: var(--space-6) 0 0;
		padding: 0;
		border: 0;
	}
	.variante legend {
		margin-bottom: var(--space-1);
		color: var(--ink-faint);
		font: 400 var(--fs-meta) / var(--lh-meta) var(--font-text);
	}
	.variante button {
		min-height: var(--touch-min);
		padding: 0 var(--space-4);
		border: 2px solid var(--control);
		border-radius: var(--radius);
		background: transparent;
		color: var(--ink);
		font: 600 var(--fs-body) / var(--lh-body) var(--font-text);
	}
	.variante button[aria-pressed='true'] {
		border-color: var(--accent);
		color: var(--accent-ink);
	}
	.resumen {
		display: grid;
		gap: var(--space-2);
	}
	.resumen p {
		margin: 0;
	}
	.grande {
		font: 700 var(--fs-num-xl) / 1 var(--font-display);
		font-stretch: var(--stretch-condensed);
		font-variant-numeric: tabular-nums;
	}
</style>
