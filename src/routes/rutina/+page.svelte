<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { ejercicios } from '#lib/catalogo.ts';
	import {
		agregarDia,
		borrarDia,
		fechaCorta,
		formatearObjetivo,
		moverDia,
		moverItem,
		renombrarDia,
		renombrarRutina,
		rutinaActiva
	} from '#lib/rutina.ts';
	import Boton from '#lib/componentes/Boton.svelte';
	import BarraAccion from '#lib/componentes/BarraAccion.svelte';
	import Cabecera from '#lib/componentes/Cabecera.svelte';
	import Hoja from '#lib/componentes/Hoja.svelte';
	import HojaAgregar from '#lib/componentes/HojaAgregar.svelte';
	import HojaObjetivo from '#lib/componentes/HojaObjetivo.svelte';
	import ListaOrdenable from '#lib/componentes/ListaOrdenable.svelte';

	// `?dia=` abre en ese día; si no existe (o se borró), el primero.
	let diaId = $state(page.url.searchParams.get('dia'));
	const dia = $derived($rutinaActiva?.dias.find((d) => d.id === diaId) ?? $rutinaActiva?.dias[0]);

	$effect(() => {
		if ($rutinaActiva === null) goto('/');
	});

	const nombreDe = (id: string) => $ejercicios?.find((e) => e.id === id)?.nombre ?? '…';
	const cantidad = (n: number) => `${n} ejercicio${n === 1 ? '' : 's'}`;

	function cambiarNombre(e: Event & { currentTarget: HTMLInputElement }) {
		const nuevo = e.currentTarget.value.trim();
		if (nuevo && nuevo !== $rutinaActiva?.nombre) renombrarRutina(nuevo);
		else e.currentTarget.value = $rutinaActiva?.nombre ?? '';
	}

	// Hoja "Renombrar": nombre del día y "Borrar día" (con confirmación si tiene ejercicios).
	let renombrando = $state(false);
	let agregando = $state(false);
	let fijando = $state(false);
	let indiceObjetivo = $state(0);
	let confirmando = $state(false);

	function abrirRenombrar() {
		confirmando = false;
		renombrando = true;
	}

	function cambiarNombreDia(e: Event & { currentTarget: HTMLInputElement }) {
		const nuevo = e.currentTarget.value.trim();
		if (dia && nuevo && nuevo !== dia.nombre) renombrarDia(dia.id, nuevo);
		else e.currentTarget.value = dia?.nombre ?? '';
	}

	function borrar() {
		if (!dia) return;
		if (dia.items.length && !confirmando) {
			confirmando = true;
			return;
		}
		borrarDia(dia.id);
		diaId = null;
		renombrando = false;
	}
</script>

<main class="pantalla">
	<Cabecera titulo="Editar rutina" volver="/" />
	{#if $rutinaActiva && dia}
		<label class="campo">
			<span>Nombre · desde {fechaCorta($rutinaActiva.inicio)}</span>
			<input class="nombre-rutina" value={$rutinaActiva.nombre} onchange={cambiarNombre} autocomplete="off" />
		</label>

		<div class="pestanas">
			<!-- Mantener apretado el chip ~300 ms lo arrastra; un toque corto elige el día. -->
			<ListaOrdenable
				items={$rutinaActiva.dias}
				clave={(d) => d.id}
				nombre={(d) => d.nombre}
				eje="x"
				demora={300}
				rol="tablist"
				etiqueta="Días"
				onmover={moverDia}
			>
				{#snippet fila(d, manija)}
					<button
						{...manija}
						type="button"
						role="tab"
						aria-selected={d.id === dia.id}
						tabindex={d.id === dia.id ? 0 : -1}
						aria-controls="dia-panel"
						onclick={() => (diaId = d.id)}>{d.nombre}</button
					>
				{/snippet}
			</ListaOrdenable>
			<button type="button" class="mas" aria-label="Agregar día" onclick={() => (diaId = agregarDia())}>
				<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
					<path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.5" stroke-linecap="square" />
				</svg>
			</button>
		</div>

		<div id="dia-panel" role="tabpanel" aria-label={dia.nombre}>
			<div class="encabezado">
				<p class="meta">{dia.nombre} · {cantidad(dia.items.length)}</p>
				<button type="button" class="texto" onclick={abrirRenombrar}>Renombrar</button>
			</div>
			{#if dia.items.length}
				<ListaOrdenable
					items={dia.items.map((item, indice) => ({ ...item, indice }))}
					clave={(it) => it.ejercicioId}
					nombre={(it) => nombreDe(it.ejercicioId)}
					onmover={(desde, hasta) => moverItem(dia.id, desde, hasta)}
				>
					{#snippet fila(item, manija)}
						<div class="item">
							<button {...manija} type="button" class="manija" aria-label="Mover {nombreDe(item.ejercicioId)}">
								<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
									<path d="M5 9h14M5 15h14" stroke="currentColor" stroke-width="2.5" stroke-linecap="square" />
								</svg>
							</button>
							<button
								type="button"
								class="fila"
								onclick={() => {
									indiceObjetivo = item.indice;
									fijando = true;
								}}
							>
								<span class="nombre">{nombreDe(item.ejercicioId)}</span>
								<span class="objetivo">{formatearObjetivo(item.objetivo)}</span>
							</button>
						</div>
					{/snippet}
				</ListaOrdenable>
			{:else}
				<p class="vacio">Este día no tiene ejercicios</p>
			{/if}
		</div>

		<Hoja bind:abierta={renombrando} titulo="Renombrar día">
			<label class="campo">
				<span>Nombre del día</span>
				<input value={dia.nombre} onchange={cambiarNombreDia} autocomplete="off" />
			</label>
			{#if $rutinaActiva.dias.length > 1}
				{#if confirmando}
					<p class="aviso" role="alert">
						«{dia.nombre}» tiene {cantidad(dia.items.length)}. Tocá de nuevo para borrarlo.
					</p>
				{/if}
				<Boton variante="secundario" onclick={borrar}>{confirmando ? 'Sí, borrar día' : 'Borrar día'}</Boton>
			{/if}
		</Hoja>
		<HojaAgregar bind:abierta={agregando} {dia} />
		<HojaObjetivo bind:abierta={fijando} {dia} indice={indiceObjetivo} />
	{/if}
</main>
<BarraAccion><Boton onclick={() => (agregando = true)}>Agregar ejercicio</Boton></BarraAccion>

<style>
	.campo {
		display: grid;
		gap: var(--space-1);
		margin-bottom: var(--space-4);
	}
	.campo span,
	.meta {
		margin: 0;
		color: var(--ink-muted);
		font: 400 var(--fs-meta) / var(--lh-meta) var(--font-text);
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
	.nombre-rutina {
		font: 600 var(--fs-heading) / var(--lh-heading) var(--font-display);
		font-stretch: var(--stretch-condensed);
	}
	input:focus-visible,
	button:focus-visible {
		outline: 2px solid var(--focus);
		outline-offset: 2px;
	}
	.pestanas {
		display: flex;
		gap: var(--space-2);
		margin-bottom: var(--space-3);
		overflow-x: auto;
	}
	[role='tab'] {
		/* Mantener apretado arrastra: sin menú contextual ni selección */
		-webkit-touch-callout: none;
		user-select: none;
	}
	[role='tab'],
	.mas {
		flex: none;
		min-width: var(--touch-min);
		min-height: var(--touch-min);
		padding: 0 var(--space-4);
		border: 0;
		border-radius: var(--radius);
		background: var(--raised);
		color: var(--ink);
		font: 600 var(--fs-body) / var(--lh-body) var(--font-text);
		white-space: nowrap;
		cursor: pointer;
	}
	[role='tab'][aria-selected='true'] {
		background: var(--accent);
		color: var(--on-accent);
	}
	.mas {
		display: grid;
		place-items: center;
		padding: 0;
	}
	.encabezado {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: var(--space-2);
	}
	.item {
		display: flex;
		border-radius: var(--radius);
		background: var(--surface);
	}
	.manija {
		flex: none;
		display: grid;
		place-items: center;
		width: var(--touch-min);
		min-height: 64px;
		border: 0;
		border-radius: var(--radius);
		background: transparent;
		color: var(--ink-muted);
		cursor: grab;
		/* Solo la manija bloquea el scroll: el resto de la fila se desplaza normal */
		touch-action: none;
	}
	.fila {
		flex: 1;
		min-width: 0;
		display: flex;
		width: 100%;
		border: 0;
		color: var(--ink);
		text-align: left;
		cursor: pointer;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-2);
		min-height: 64px;
		padding: var(--space-2) var(--space-4) var(--space-2) 0;
		border-radius: var(--radius);
		background: transparent;
	}
	.nombre {
		font: 600 var(--fs-heading) / var(--lh-heading) var(--font-display);
		font-stretch: var(--stretch-condensed);
	}
	.objetivo {
		flex: none;
		color: var(--ink-muted);
		font: 700 var(--fs-heading) / var(--lh-heading) var(--font-display);
		font-stretch: var(--stretch-condensed);
		font-variant-numeric: tabular-nums;
	}
	.vacio {
		padding: var(--space-6) 0;
		text-align: center;
		color: var(--ink-muted);
		margin: 0;
	}
	.aviso {
		margin: 0;
		color: var(--alto);
		font: 600 var(--fs-meta) / var(--lh-meta) var(--font-text);
	}
</style>
