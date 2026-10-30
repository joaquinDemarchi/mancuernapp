<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		variante = 'primario',
		disabled = false,
		onclick,
		children
	}: {
		variante?: 'primario' | 'secundario';
		disabled?: boolean;
		onclick?: () => void;
		children: Snippet;
	} = $props();
</script>

<button class={variante} {disabled} {onclick}>{@render children()}</button>

<style>
	button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		/* Las dos variantes van en BarraAccion: alto de acción primaria (design.md §8) */
		min-height: var(--touch-primary);
		padding: 0 var(--space-6);
		border: 2px solid transparent;
		border-radius: var(--radius);
		font: 600 var(--fs-body) / var(--lh-body) var(--font-text);
		cursor: pointer;
		transition: transform 80ms ease-out;
		-webkit-tap-highlight-color: transparent;
	}
	.primario {
		background: var(--accent);
		color: var(--on-accent);
	}
	.secundario {
		background: transparent;
		color: var(--ink);
		border-color: var(--control);
	}
	button:active:not(:disabled) {
		transform: scale(0.97);
	}
	.secundario:active:not(:disabled) {
		background: var(--raised);
	}
	button:focus-visible {
		outline: 2px solid var(--focus);
		outline-offset: 2px;
	}
	button:disabled {
		background: var(--raised);
		color: var(--ink-faint);
		border-color: transparent;
		cursor: not-allowed;
	}
	@media (prefers-reduced-motion: reduce) {
		button {
			transition: none;
		}
		button:active:not(:disabled) {
			transform: none;
		}
	}
</style>
