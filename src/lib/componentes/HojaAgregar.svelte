<script lang="ts">
	import { tick } from 'svelte';
	import { crearEjercicio, describir, ejercicios, tipos, type Tipo } from '#lib/catalogo.ts';
	import { coincide, esDuplicado, parecidos } from '#lib/texto.ts';
	import Boton from '#lib/componentes/Boton.svelte';
	import Hoja from '#lib/componentes/Hoja.svelte';
	import OpcionesChip from '#lib/componentes/OpcionesChip.svelte';

	let {
		abierta = $bindable(false),
		titulo,
		yaEstan,
		contexto,
		onagregar
	}: {
		abierta: boolean;
		titulo: string;
		/** Ids que no se pueden volver a agregar. */
		yaEstan: Set<string>;
		contexto: 'dia' | 'sesion';
		/** Con el tipo: un ejercicio recién creado todavía puede no estar en el store. */
		onagregar: (ejercicioId: string, tipo: Tipo) => void;
	} = $props();

	const yaEsta = $derived(contexto === 'dia' ? 'ya está en este día' : 'ya está en la sesión');

	// Dos pasos en la misma hoja: buscar en el catálogo o crear uno nuevo.
	let paso: 'buscar' | 'nuevo' = $state('buscar');
	let busqueda = $state('');
	let nombre = $state('');
	let tipo: Tipo = $state('peso');
	let buscador: HTMLInputElement | undefined = $state();

	// Cada vez que se abre arranca limpia, con el foco en el buscador.
	$effect(() => {
		if (!abierta) return;
		paso = 'buscar';
		busqueda = '';
		tick().then(() => buscador?.focus());
	});

	const catalogo = $derived($ejercicios ?? []);
	const similares = $derived(parecidos(busqueda, catalogo));
	const resultados = $derived([
		...similares,
		...catalogo.filter((e) => !similares.includes(e) && coincide(e.nombre, busqueda))
	]);
	const exacto = $derived(catalogo.find((e) => esDuplicado(e.nombre, busqueda)));
	const duplicadoNuevo = $derived(catalogo.find((e) => esDuplicado(e.nombre, nombre)));

	function agregar(id: string, tipo: Tipo) {
		if (yaEstan.has(id)) return;
		onagregar(id, tipo);
		abierta = false;
	}

	async function volverABuscar() {
		paso = 'buscar';
		await tick();
		buscador?.focus();
	}

	function irANuevo() {
		nombre = busqueda.trim();
		tipo = 'peso';
		paso = 'nuevo';
	}

	// Sin await: sin señal las escrituras no resuelven hasta sincronizar.
	function crearYAgregar() {
		if (!nombre.trim() || duplicadoNuevo) return;
		onagregar(crearEjercicio(nombre, tipo), tipo);
		abierta = false;
	}
</script>

<Hoja bind:abierta titulo={paso === 'buscar' ? titulo : 'Nuevo ejercicio'}>
	{#if paso === 'buscar'}
		<label class="buscador">
			<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
				<circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="2.5" />
				<path d="M15.5 15.5 21 21" stroke="currentColor" stroke-width="2.5" stroke-linecap="square" />
			</svg>
			<input
				bind:this={buscador}
				bind:value={busqueda}
				type="search"
				placeholder="Buscar o crear"
				aria-label="Buscar ejercicio"
				autocomplete="off"
			/>
		</label>

		{#if resultados.length}
			<h3>En tu catálogo</h3>
			<ul>
				{#each resultados as e (e.id)}
					<li>
						<button type="button" class="fila" aria-disabled={yaEstan.has(e.id)} onclick={() => agregar(e.id, e.tipo)}>
							<span class="textos">
								<span class="nombre">{e.nombre}</span>
								<span class="meta">{yaEstan.has(e.id) ? yaEsta : describir(e)}</span>
							</span>
							{#if !yaEstan.has(e.id)}
								<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
									<path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.5" stroke-linecap="square" />
								</svg>
							{/if}
						</button>
					</li>
				{/each}
			</ul>
		{/if}

		{#if busqueda.trim() && !exacto}
			<h3>Nuevo</h3>
			<button type="button" class="fila crear" onclick={irANuevo}>
				<span class="textos">
					<span class="nombre">Crear «{busqueda.trim()}»</span>
					{#if similares.length}<span class="meta">¿No es el mismo que «{similares[0].nombre}»?</span>{/if}
				</span>
			</button>
		{/if}
	{:else}
		<button type="button" class="texto volver" onclick={volverABuscar}>← Volver a la búsqueda</button>
		<label class="campo">
			<span>Nombre</span>
			<input bind:value={nombre} autocomplete="off" aria-invalid={!!duplicadoNuevo} />
		</label>
		{#if duplicadoNuevo}<p class="error" role="alert">Ya existe «{duplicadoNuevo.nombre}»</p>{/if}
		<OpcionesChip bind:valor={tipo} opciones={tipos} leyenda="Tipo" />
		{#if tipo === 'peso'}
			<p class="meta">Saltos por defecto: 2,5 kg y ±1 rep. Se cambian después en Ejercicios.</p>
		{:else if tipo === 'reps' || tipo === 'tiempo'}
			<p class="meta">Salto por defecto: {tipo === 'reps' ? '±1 rep' : '±5 s'}. Se cambia después en Ejercicios.</p>
		{/if}
		<Boton disabled={!nombre.trim() || !!duplicadoNuevo} onclick={crearYAgregar}>Crear y agregar</Boton>
	{/if}
</Hoja>

<style>
	.buscador {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		min-height: var(--touch-primary);
		padding: 0 var(--space-3);
		border: 2px solid var(--control);
		border-radius: var(--radius);
		color: var(--ink-muted);
	}
	.buscador:focus-within {
		outline: 2px solid var(--focus);
		outline-offset: 2px;
	}
	.buscador input {
		flex: 1;
		min-width: 0;
		min-height: 0;
		padding: 0;
		border: 0;
		outline: 0;
	}
	input {
		min-height: var(--touch-primary);
		padding: var(--space-3);
		border: 2px solid var(--control);
		border-radius: var(--radius);
		background: transparent;
		color: var(--ink);
		font: 400 var(--fs-body) / var(--lh-body) var(--font-text);
	}
	.campo input:focus-visible {
		outline: 2px solid var(--focus);
		outline-offset: 2px;
	}
	input[aria-invalid='true'] {
		border-color: var(--alto);
	}
	.campo {
		display: grid;
		gap: var(--space-1);
	}
	h3,
	.campo span,
	.meta {
		margin: 0;
		color: var(--ink-faint);
		font: 400 var(--fs-meta) / var(--lh-meta) var(--font-text);
	}
	h3,
	.campo span {
		color: var(--ink-muted);
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
		justify-content: space-between;
		gap: var(--space-2);
		width: 100%;
		min-height: 64px;
		padding: var(--space-2) var(--space-4);
		border: 0;
		border-radius: var(--radius);
		background: var(--raised);
		color: var(--ink);
		text-align: left;
		cursor: pointer;
	}
	.fila[aria-disabled='true'] {
		cursor: default;
	}
	.fila[aria-disabled='true'] .nombre {
		color: var(--ink-muted);
	}
	.fila:focus-visible {
		outline: 2px solid var(--focus);
		outline-offset: 2px;
	}
	.crear {
		border: 2px dashed var(--control);
		background: transparent;
	}
	.textos {
		display: grid;
	}
	.nombre {
		font: 600 var(--fs-heading) / var(--lh-heading) var(--font-display);
		font-stretch: var(--stretch-condensed);
	}
	.volver {
		justify-self: start;
		margin-left: calc(var(--space-3) * -1);
	}
	.error {
		margin: calc(var(--space-2) * -1) 0 0;
		color: var(--alto);
		font: 600 var(--fs-meta) / var(--lh-meta) var(--font-text);
	}
</style>
