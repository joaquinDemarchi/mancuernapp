<script lang="ts">
	import { diaMes, formatearVolumen, type Vez } from '#lib/calculos.ts';

	let {
		veces,
		nombre,
		nombreRutina
	}: {
		/** De la más vieja a la más nueva, con volumen. */
		veces: Vez[];
		nombre: string;
		nombreRutina: (rutinaId: string) => string;
	} = $props();

	// viewBox fijo; puntos equiespaciados por vez (no por fecha) y escala Y de mínimo a máximo con margen.
	const ancho = 320;
	const alto = 140;
	const margenX = 12;
	const arriba = 24;
	const abajo = 16;

	const puntos = $derived.by(() => {
		const vs = veces.map((v) => v.volumen ?? 0);
		const min = Math.min(...vs);
		const max = Math.max(...vs);
		const holgura = (max - min) * 0.15 || 1;
		const [lo, hi] = [min - holgura, max + holgura];
		const paso = veces.length > 1 ? (ancho - 2 * margenX) / (veces.length - 1) : 0;
		return veces.map((v, i) => ({
			x: veces.length > 1 ? margenX + i * paso : ancho / 2,
			y: arriba + (1 - ((v.volumen ?? 0) - lo) / (hi - lo)) * (alto - arriba - abajo),
			cambio: i > 0 && v.rutinaId !== veces[i - 1].rutinaId,
			rutinaId: v.rutinaId
		}));
	});

	const primera = $derived(veces[0]);
	const ultima = $derived(veces.at(-1)!);
	const etiqueta = $derived(
		veces.length === 1
			? `Volumen de ${nombre}: ${formatearVolumen(ultima.volumen ?? 0)} el ${diaMes(ultima.fecha)}, 1 vez`
			: `Volumen de ${nombre}: de ${formatearVolumen(primera.volumen ?? 0)} el ${diaMes(primera.fecha)} a ${formatearVolumen(ultima.volumen ?? 0)} el ${diaMes(ultima.fecha)}, ${veces.length} veces`
	);
</script>

<figure>
	<svg viewBox="0 0 {ancho} {alto}" role="img" aria-label={etiqueta}>
		<line class="base" x1="0" x2={ancho} y1={alto - abajo / 2} y2={alto - abajo / 2} />
		{#each puntos as p, i (i)}
			{#if p.cambio}
				{@const x = (puntos[i - 1].x + p.x) / 2}
				<line class="cambio" x1={x} x2={x} y1="4" y2={alto - abajo / 2} />
				<!-- Cerca del borde derecho, el nombre va a la izquierda de la línea para no salirse. -->
				{@const derecha = x > ancho * 0.7}
				<text x={derecha ? x - 4 : x + 4} y="14" text-anchor={derecha ? 'end' : 'start'}>{nombreRutina(p.rutinaId)}</text>
			{/if}
		{/each}
		{#if puntos.length > 1}
			<polyline points={puntos.map((p) => `${p.x},${p.y}`).join(' ')} />
		{/if}
		{#each puntos as p, i (i)}
			<circle cx={p.x} cy={p.y} r={i === puntos.length - 1 ? 6 : 4} />
		{/each}
	</svg>
	<figcaption aria-hidden="true">
		{#if veces.length > 1}
			<span><b>{formatearVolumen(primera.volumen ?? 0)}</b> · {diaMes(primera.fecha)}</span>
		{/if}
		<span class="ultimo"><b>{formatearVolumen(ultima.volumen ?? 0)}</b> · {diaMes(ultima.fecha)}</span>
	</figcaption>
</figure>

<style>
	figure {
		display: grid;
		gap: var(--space-2);
		margin: 0;
		padding: var(--space-4);
		border-radius: var(--radius);
		background: var(--surface);
	}
	svg {
		display: block;
		width: 100%;
		height: auto;
		overflow: visible;
	}
	.base {
		stroke: var(--raised);
		stroke-width: 2;
	}
	.cambio {
		stroke: var(--control);
		stroke-width: 1.5;
		stroke-dasharray: 4 4;
	}
	text {
		fill: var(--ink-faint);
		font: 400 12px var(--font-text);
	}
	polyline {
		fill: none;
		stroke: var(--accent-ink);
		stroke-width: 3;
		stroke-linejoin: round;
	}
	circle {
		fill: var(--accent-ink);
	}
	figcaption {
		display: flex;
		justify-content: space-between;
		color: var(--ink-muted);
		font: 400 var(--fs-meta) / var(--lh-meta) var(--font-text);
		font-variant-numeric: tabular-nums;
	}
	b {
		color: var(--ink);
		font-weight: 600;
	}
	.ultimo {
		margin-left: auto;
	}
</style>
