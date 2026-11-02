<script lang="ts">
	import { formatearPct, indicador } from '#lib/calculos.ts';

	let {
		pct,
		chico = false,
		conPct = false
	}: {
		pct: number;
		/** Chico para filas (24 px); grande para el resumen (32 px). */
		chico?: boolean;
		/** Muestra el % dentro de la pastilla: "● Óptimo · +5 %" grande, "● +5 % Óptimo" chico. */
		conPct?: boolean;
	} = $props();

	const nivel = $derived(indicador(pct));
	const forma = { bajo: '▼', optimo: '●', alto: '▲' };
	const palabra = { bajo: 'Bajo', optimo: 'Óptimo', alto: 'Alto' };
</script>

<!-- Forma y palabra además del color: se entiende en gris. -->
<span class="indicador {nivel}" class:chico>
	<span aria-hidden="true">{forma[nivel]}</span>
	{#if conPct && chico}{formatearPct(pct)}&nbsp;{/if}{palabra[nivel]}{#if conPct && !chico}&nbsp;· {formatearPct(pct)}{/if}
</span>

<style>
	.indicador {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1);
		height: 32px;
		padding: 0 var(--space-3);
		border-radius: var(--radius);
		font: 600 var(--fs-body) / var(--lh-body) var(--font-text);
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
	}
	.chico {
		height: 24px;
		padding: 0 var(--space-2);
		font: 600 var(--fs-meta) / var(--lh-meta) var(--font-text);
	}
	.bajo {
		background: var(--bajo-tint);
		color: var(--bajo);
	}
	.optimo {
		background: var(--optimo-tint);
		color: var(--optimo);
	}
	.alto {
		background: var(--alto-tint);
		color: var(--alto);
	}
</style>
