<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { crearEjercicio, ejercicios, guardarEjercicio, tipos, type Tipo } from '#lib/catalogo.ts';
	import { esDuplicado } from '#lib/texto.ts';
	import Boton from '#lib/componentes/Boton.svelte';
	import BarraAccion from '#lib/componentes/BarraAccion.svelte';
	import Cabecera from '#lib/componentes/Cabecera.svelte';
	import OpcionesChip from '#lib/componentes/OpcionesChip.svelte';
	import Stepper from '#lib/componentes/Stepper.svelte';

	// `?id=` edita; sin id es nuevo.
	const id = page.url.searchParams.get('id');

	let nombre = $state('');
	let tipo: Tipo = $state('peso');
	let saltoKg: number | null = $state(2.5);
	let saltoReps: number | null = $state(1);
	let saltoSeg: number | null = $state(5);
	let notas = $state('');

	// Al entrar directo por URL el catálogo llega después: se completa una sola vez.
	let cargado = false;
	$effect(() => {
		const e = id && !cargado ? $ejercicios?.find((x) => x.id === id) : undefined;
		if (!e) return;
		cargado = true;
		({ nombre, tipo, saltoKg, saltoReps, saltoSeg, notas } = e);
	});

	const duplicado = $derived($ejercicios?.find((e) => e.id !== id && esDuplicado(e.nombre, nombre)));
	const titulo = $derived(id ? nombre.trim() || 'Ejercicio' : 'Nuevo ejercicio');

	function guardar() {
		if (!nombre.trim() || duplicado) return;
		const datos = { nombre, tipo, saltoKg: saltoKg ?? 2.5, saltoReps: saltoReps ?? 1, saltoSeg: saltoSeg ?? 5, notas };
		// Sin await: Firestore lo aplica al instante en el store y confirma con el servidor después.
		(id ? guardarEjercicio(id, datos) : crearEjercicio(nombre, tipo, datos)).catch(console.error);
		goto('/ejercicios');
	}
</script>

<main class="pantalla">
	<Cabecera {titulo} volver="/ejercicios" />
	<form
		onsubmit={(e) => {
			e.preventDefault();
			guardar();
		}}
	>
		<label class="campo">
			<span>Nombre</span>
			<input bind:value={nombre} autocomplete="off" aria-invalid={!!duplicado} aria-describedby="error-nombre" />
		</label>
		<p id="error-nombre" class="error" role="alert">{#if duplicado}Ya existe «{duplicado.nombre}»{/if}</p>

		<OpcionesChip bind:valor={tipo} opciones={tipos} leyenda="Tipo" />

		{#if tipo === 'peso' || tipo === 'reps' || tipo === 'tiempo'}
			<div class="saltos" class:una={tipo !== 'peso'}>
				{#if tipo === 'peso'}
					<Stepper bind:valor={saltoKg} etiqueta="Salto kg" paso={0.5} min={0.5} decimales={1} />
				{/if}
				{#if tipo === 'peso' || tipo === 'reps'}
					<Stepper bind:valor={saltoReps} etiqueta="Salto reps" min={1} />
				{/if}
				{#if tipo === 'tiempo'}
					<Stepper bind:valor={saltoSeg} etiqueta="Salto de segundos" paso={5} min={5} />
				{/if}
			</div>
			{#if tipo === 'peso'}<p class="meta">Mancuernas: 1 kg. Barra y máquinas: 2,5 kg.</p>{/if}
		{/if}

		<label class="campo">
			<span>Notas</span>
			<textarea bind:value={notas}></textarea>
		</label>
	</form>
</main>
<BarraAccion><Boton disabled={!nombre.trim()} onclick={guardar}>Guardar</Boton></BarraAccion>

<style>
	form {
		display: grid;
		gap: var(--space-4);
	}
	.campo {
		display: grid;
		gap: var(--space-1);
	}
	.campo span,
	.meta {
		margin: 0;
		color: var(--ink-muted);
		font: 400 var(--fs-meta) / var(--lh-meta) var(--font-text);
	}
	input,
	textarea {
		min-height: var(--touch-primary);
		padding: var(--space-3);
		border: 2px solid var(--control);
		border-radius: var(--radius);
		background: transparent;
		color: var(--ink);
		font: 400 var(--fs-body) / var(--lh-body) var(--font-text);
	}
	textarea {
		min-height: 88px;
		resize: vertical;
	}
	input:focus-visible,
	textarea:focus-visible {
		outline: 2px solid var(--focus);
		outline-offset: 2px;
	}
	input[aria-invalid='true'] {
		border-color: var(--alto);
	}
	.error {
		margin: calc(var(--space-3) * -1) 0 0;
		color: var(--alto);
		font: 600 var(--fs-meta) / var(--lh-meta) var(--font-text);
	}
	.error:empty {
		display: none;
	}
	.saltos {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-3);
	}
	.saltos.una {
		grid-template-columns: 1fr;
	}
</style>
