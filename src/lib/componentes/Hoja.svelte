<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		abierta = $bindable(false),
		titulo,
		meta,
		accion,
		children
	}: {
		abierta: boolean;
		titulo: string;
		meta?: string;
		/** Botón de texto a la izquierda de cerrar (p. ej. "Ver evolución"). */
		accion?: Snippet;
		children: Snippet;
	} = $props();

	let dialogo: HTMLDialogElement;
	const id = $props.id();

	// showModal atrapa el foco y cierra con Esc; al cerrar, el navegador devuelve el foco al botón que la abrió.
	$effect(() => {
		if (abierta && !dialogo.open) dialogo.showModal();
		if (!abierta && dialogo.open) dialogo.close();
	});

	// El contenido ocupa todo el dialog: un clic con el dialog como destino es el fondo.
	function tocarFondo(e: MouseEvent) {
		if (e.target === dialogo) abierta = false;
	}
</script>

<dialog bind:this={dialogo} aria-labelledby={id} onclose={() => (abierta = false)} onclick={tocarFondo}>
	<div class="contenido">
		<span class="manija" aria-hidden="true"></span>
		<header>
			<div class="titulos">
				<h2 {id}>{titulo}</h2>
				{#if meta}<p>{meta}</p>{/if}
			</div>
			{#if accion}{@render accion()}{/if}
			<button type="button" aria-label="Cerrar" onclick={() => (abierta = false)}>
				<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
					<path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="square" />
				</svg>
			</button>
		</header>
		{@render children()}
	</div>
</dialog>

<style>
	dialog {
		width: 100%;
		max-width: 100%;
		max-height: 90dvh;
		margin: auto 0 0;
		padding: 0;
		border: 0;
		border-radius: var(--radius) var(--radius) 0 0;
		background: var(--surface);
		color: var(--ink);
		box-shadow: var(--elevation-float);
	}
	dialog::backdrop {
		background: var(--scrim);
	}
	.contenido {
		display: grid;
		gap: var(--space-3);
		padding: var(--space-2) var(--space-4) calc(var(--space-4) + env(safe-area-inset-bottom, 0px));
	}
	.manija {
		justify-self: center;
		width: 40px;
		height: 4px;
		border-radius: 2px;
		background: var(--control);
	}
	header {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}
	.titulos {
		flex: 1;
		min-width: 0;
	}
	.titulos p {
		margin: 0;
		color: var(--ink-faint);
		font: 400 var(--fs-meta) / var(--lh-meta) var(--font-text);
	}
	h2 {
		margin: 0;
		font: 600 var(--fs-heading) / var(--lh-heading) var(--font-display);
		font-stretch: var(--stretch-condensed);
	}
	button {
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
	button:focus-visible {
		outline: 2px solid var(--focus);
		outline-offset: 2px;
	}
</style>
