<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<!-- Una por pantalla: la acción principal al alcance del pulgar. -->
<div>{@render children()}</div>

<style>
	div {
		position: fixed;
		inset: auto 0 0 0;
		display: grid;
		/* Con dos botones, dos columnas iguales */
		grid-auto-flow: column;
		grid-auto-columns: 1fr;
		gap: var(--space-2);
		padding: var(--space-3) var(--space-4) calc(var(--space-3) + env(safe-area-inset-bottom, 0px));
		border-radius: var(--radius-none);
		background: var(--surface);
	}
</style>
