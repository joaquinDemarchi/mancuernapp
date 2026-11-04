<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { crearEjercicio, ejercicios, guardarEjercicio, tipos, type DatosEjercicio, type Tipo } from '#lib/catalogo.ts';
	import { formatearDescanso } from '#lib/descanso.ts';
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
	let descanso: number | null = $state(null);

	// Chips: valores en texto para `OpcionesChip`; "" = sin descanso. Un valor fuera de los chips (1:15) no marca ninguno.
	const chipsDescanso = [
		{ valor: '', etiqueta: 'Sin descanso' },
		...[45, 60, 90, 120, 180].map((s) => ({ valor: String(s), etiqueta: formatearDescanso(s) }))
	];

	// Al entrar directo por URL el catálogo llega después: se completa una sola vez.
	let cargado = false;
	$effect(() => {
		const e = id && !cargado ? $ejercicios?.find((x) => x.id === id) : undefined;
		if (!e) return;
		cargado = true;
		({ nombre, tipo, saltoKg, saltoReps, saltoSeg, notas } = e);
		descanso = e.descanso ?? null;
	});

	const duplicado = $derived($ejercicios?.find((e) => e.id !== id && esDuplicado(e.nombre, nombre)));
	const titulo = $derived(id ? nombre.trim() || 'Ejercicio' : 'Nuevo ejercicio');

	function guardar() {
		if (!nombre.trim() || duplicado) return;
		const datos: DatosEjercicio = { nombre, tipo, saltoKg: saltoKg ?? 2.5, saltoReps: saltoReps ?? 1, saltoSeg: saltoSeg ?? 5, notas };
		// Escrito a mano puede no ser múltiplo de 15.
		if (descanso !== null) datos.descanso = Math.min(300, Math.max(15, Math.round(descanso / 15) * 15));
		// Sin await: Firestore lo aplica al instante en el store y confirma con el servidor después.
		if (id) guardarEjercicio(id, datos).catch(console.error);
		else crearEjercicio(nombre, tipo, datos);
		goto('/ejercicios');
	}
</script>

<main class="pantalla">
	<Cabecera {titulo} volver="/ejercicios">
		{#snippet accion()}
			{#if id}<button type="button" class="texto sutil" onclick={() => goto(`/evolucion?id=${id}`)}>Ver evolución</button>{/if}
		{/snippet}
	</Cabecera>
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

		<div class="descanso">
			<OpcionesChip
				bind:valor={() => (descanso === null ? '' : String(descanso)), (v) => (descanso = v ? Number(v) : null)}
				opciones={chipsDescanso}
				leyenda="Descanso"
			/>
			{#if descanso === null}
				<p class="meta tenue">Es el tiempo con el que abre el timer en la sesión.</p>
			{:else}
				<Stepper bind:valor={descanso} etiqueta="Descanso" sinEtiqueta paso={15} min={15} max={300} formatear={formatearDescanso} />
				<p class="meta tenue">Con − / + afinás de a 15 s.</p>
			{/if}
		</div>

		<label class="campo">
			<span>Notas</span>
			<textarea bind:value={notas}></textarea>
		</label>
	</form>
</main>
<BarraAccion><Boton disabled={!nombre.trim() || !!duplicado} onclick={guardar}>Guardar</Boton></BarraAccion>

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
	.descanso {
		display: grid;
		gap: var(--space-1);
	}
	.meta.tenue {
		color: var(--ink-faint);
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
