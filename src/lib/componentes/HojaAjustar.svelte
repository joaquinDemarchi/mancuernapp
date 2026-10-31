<script lang="ts">
	import { untrack } from 'svelte';
	import { desarmar, formatear, type Bloque, type Registro } from '#lib/calculos.ts';
	import type { Ejercicio } from '#lib/catalogo.ts';
	import Boton from '#lib/componentes/Boton.svelte';
	import Hoja from '#lib/componentes/Hoja.svelte';
	import Stepper from '#lib/componentes/Stepper.svelte';

	let {
		abierta = $bindable(false),
		ejercicio,
		registro,
		ultima,
		inicial,
		onguardar
	}: {
		abierta: boolean;
		ejercicio: Ejercicio;
		/** El registro de hoy, si ya está hecho. */
		registro?: Registro;
		/** Bloques de la última vez (para la meta). */
		ultima?: Bloque[];
		/** Con qué arranca si todavía no está hecho: la última vez o el objetivo. */
		inicial: Bloque[];
		onguardar: (registro: Registro) => void;
	} = $props();

	// Se monta una vez por ejercicio abierto (la página la envuelve en un #key): copia los valores al abrir.
	let bloques = $state<Bloque[]>(untrack(() => structuredClone($state.snapshot(registro?.bloques ?? inicial))));
	let elegido = $state(0);
	let hecho = $state(untrack(() => !!registro));

	const tipo = $derived(ejercicio.tipo);
	const b = $derived(bloques[elegido]);
	const kg = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 });
	const nombreBloque = (x: Bloque, i: number) => `${x.series === 1 ? 'Serie' : 'Bloque'} ${i + 1}`;

	// Cada cambio guarda al instante y deja el ejercicio hecho.
	function guardar(nuevos: Bloque[]) {
		bloques = nuevos;
		hecho = true;
		onguardar({ ...(registro ?? {}), ejercicioId: ejercicio.id, bloques: $state.snapshot(nuevos), hecho: true });
	}

	function cambiar(campo: keyof Bloque, valor: number) {
		guardar(bloques.map((x, i) => (i === elegido ? { ...x, [campo]: valor } : x)));
	}

	function agregarBloque() {
		guardar([...bloques, { ...bloques[bloques.length - 1] }]);
		elegido = bloques.length - 1;
	}

	function quitarBloque() {
		if (bloques.length < 2) return;
		const i = elegido;
		elegido = Math.max(0, i - 1);
		guardar(bloques.filter((_, j) => j !== i));
	}

	function desarmarElegido() {
		guardar(desarmar(bloques, elegido));
	}

	function listo() {
		if (!hecho) guardar(bloques);
		abierta = false;
	}
</script>

<Hoja bind:abierta titulo={ejercicio.nombre} meta={ultima ? `Última: ${formatear(tipo, ultima)}` : 'Primera vez'}>
	{#if tipo !== 'cardio'}
		<div class="bloques" role="radiogroup" aria-label="Bloques">
			{#each bloques as x, i (i)}
				<button type="button" role="radio" aria-checked={i === elegido} class="bloque" onclick={() => (elegido = i)}>
					<span class="etiqueta">{nombreBloque(x, i)}</span>
					<span class="valor">{formatear(tipo, [x])}</span>
				</button>
			{/each}
			<button type="button" class="agregar" onclick={agregarBloque}>+ Bloque</button>
		</div>
	{/if}

	{#if b}
		<section class="editor" aria-label={tipo === 'cardio' ? 'Minutos' : nombreBloque(b, elegido)}>
			{#if tipo !== 'cardio'}
				<header>
					<h3>{nombreBloque(b, elegido)}</h3>
					{#if b.series > 1}
						<button type="button" class="texto" onclick={desarmarElegido}>Desarmar</button>
					{/if}
					<button
						type="button"
						class="quitar"
						aria-label="Quitar {nombreBloque(b, elegido).toLowerCase()}"
						disabled={bloques.length < 2}
						onclick={quitarBloque}
					>
						<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
							<path
								d="M4 7h16M10 7V4h4v3M6 7l1 13h10l1-13M10 11v6M14 11v6"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="square"
							/>
						</svg>
					</button>
				</header>
				<Stepper valor={b.series} min={1} etiqueta="Series" oncambio={(v) => cambiar('series', v)} />
			{/if}
			{#if tipo === 'peso' || tipo === 'reps'}
				<Stepper valor={b.reps ?? 0} paso={ejercicio.saltoReps} min={1} etiqueta="Reps" oncambio={(v) => cambiar('reps', v)} />
			{/if}
			{#if tipo === 'peso'}
				<Stepper
					valor={b.kg ?? 0}
					paso={ejercicio.saltoKg}
					decimales={1}
					etiqueta="Kg"
					detalle="±{kg.format(ejercicio.saltoKg)}"
					oncambio={(v) => cambiar('kg', v)}
				/>
			{/if}
			{#if tipo === 'tiempo'}
				<Stepper valor={b.segundos ?? 0} paso={ejercicio.saltoSeg} min={1} etiqueta="Segundos" oncambio={(v) => cambiar('segundos', v)} />
			{/if}
			{#if tipo === 'cardio'}
				<Stepper valor={b.minutos ?? 0} min={1} etiqueta="Minutos" oncambio={(v) => cambiar('minutos', v)} />
			{/if}
		</section>
	{/if}

	<Boton onclick={listo}>Listo</Boton>
</Hoja>

<style>
	.bloques {
		display: grid;
		gap: var(--space-1);
	}
	.bloque {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		min-height: 56px;
		padding: 0 var(--space-4);
		border: 2px solid transparent;
		border-radius: var(--radius);
		background: var(--raised);
		color: var(--ink);
		text-align: left;
		cursor: pointer;
	}
	.bloque[aria-checked='true'] {
		border-color: var(--accent);
	}
	.etiqueta {
		flex: none;
		width: 56px;
		color: var(--ink-faint);
		font: 400 var(--fs-meta) / var(--lh-meta) var(--font-text);
	}
	.valor {
		flex: 1;
		text-align: right;
		font: 700 var(--fs-heading) / var(--lh-heading) var(--font-display);
		font-stretch: var(--stretch-condensed);
		font-variant-numeric: tabular-nums;
	}
	.agregar {
		min-height: var(--touch-min);
		border: 2px dashed var(--control);
		border-radius: var(--radius);
		background: transparent;
		color: var(--ink);
		font: 600 var(--fs-body) / var(--lh-body) var(--font-text);
		cursor: pointer;
	}
	.editor {
		display: grid;
		gap: var(--space-3);
		padding: var(--space-4);
		border-radius: var(--radius);
		background: var(--ground);
	}
	header {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}
	h3 {
		flex: 1;
		margin: 0;
		font: 600 var(--fs-heading) / var(--lh-heading) var(--font-display);
		font-stretch: var(--stretch-condensed);
	}
	.quitar {
		display: grid;
		place-items: center;
		width: var(--touch-min);
		height: var(--touch-min);
		margin-right: calc(var(--space-3) * -1);
		border: 0;
		border-radius: var(--radius);
		background: transparent;
		color: var(--ink);
		cursor: pointer;
	}
	.quitar:disabled {
		color: var(--ink-faint);
		opacity: 0.5;
		cursor: not-allowed;
	}
	.bloque:focus-visible,
	.agregar:focus-visible,
	.quitar:focus-visible {
		outline: 2px solid var(--focus);
		outline-offset: 2px;
	}
</style>
