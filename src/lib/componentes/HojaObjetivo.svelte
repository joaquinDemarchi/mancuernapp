<script lang="ts">
	import { untrack } from 'svelte';
	import { ejercicios, tipos } from '#lib/catalogo.ts';
	import { fijarObjetivo, quitarItem, type Dia, type Objetivo } from '#lib/rutina.ts';
	import Boton from '#lib/componentes/Boton.svelte';
	import Hoja from '#lib/componentes/Hoja.svelte';
	import Stepper from '#lib/componentes/Stepper.svelte';

	let { abierta = $bindable(false), dia, indice }: { abierta: boolean; dia: Dia; indice: number } = $props();

	const item = $derived(dia.items[indice]);
	const ejercicio = $derived($ejercicios?.find((e) => e.id === item?.ejercicioId));
	const tipo = $derived(ejercicio?.tipo ?? 'peso');

	// Vacíos ("–") hasta el primer toque; se cargan del item cada vez que se abre.
	let series: number | null = $state(null);
	let reps: number | null = $state(null);
	let segundos: number | null = $state(null);
	let minutos: number | null = $state(null);

	$effect(() => {
		if (!abierta) return;
		// Solo al abrir: el eco de Firestore de cada guardado no debe pisar lo que se está tocando.
		const o = untrack(() => item?.objetivo);
		series = o?.series ?? null;
		reps = o?.reps ?? null;
		segundos = o?.segundos ?? null;
		minutos = o?.minutos ?? null;
	});

	// Guardado instantáneo: cada toque reescribe el objetivo con los valores ya tocados.
	function guardar() {
		const o: Objetivo = {};
		if (series !== null) o.series = series;
		if (reps !== null) o.reps = reps;
		if (segundos !== null) o.segundos = segundos;
		if (minutos !== null) o.minutos = minutos;
		fijarObjetivo(dia.id, indice, o);
	}

	function quitar() {
		quitarItem(dia.id, indice);
		abierta = false;
	}
</script>

<Hoja
	bind:abierta
	titulo={ejercicio?.nombre ?? ''}
	meta="{dia.nombre} · {tipos.find((t) => t.valor === tipo)?.etiqueta}"
>
	{#if tipo === 'calentamiento'}
		<p>Calentamiento: no lleva objetivo.</p>
	{:else}
		<p>Objetivo (opcional). Es el punto de partida la primera vez que cargues este ejercicio.</p>
		{#if tipo === 'peso' || tipo === 'reps'}
			<Stepper bind:valor={series} etiqueta="Series" min={1} max={10} oncambio={guardar} />
			<Stepper bind:valor={reps} etiqueta="Reps" min={1} max={50} oncambio={guardar} />
		{:else if tipo === 'tiempo'}
			<Stepper bind:valor={series} etiqueta="Series" min={1} max={10} oncambio={guardar} />
			<Stepper bind:valor={segundos} etiqueta="Segundos" paso={5} min={5} max={600} oncambio={guardar} />
		{:else}
			<Stepper bind:valor={minutos} etiqueta="Minutos" min={1} max={180} oncambio={guardar} />
		{/if}
	{/if}
	<div class="acciones">
		<Boton variante="secundario" onclick={quitar}>Quitar del día</Boton>
		<Boton onclick={() => (abierta = false)}>Listo</Boton>
	</div>
</Hoja>

<style>
	p {
		margin: 0;
		color: var(--ink-muted);
		font: 400 var(--fs-body) / var(--lh-body) var(--font-text);
	}
	.acciones {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-2);
		margin-top: var(--space-2);
	}
</style>
