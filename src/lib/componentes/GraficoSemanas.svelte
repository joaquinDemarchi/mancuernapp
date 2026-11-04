<script lang="ts">
	import { diaMes, hoy, lunes, type Semana } from '#lib/calculos.ts';

	let { semanas }: { semanas: Semana[] } = $props();

	// Con más de 13 semanas: barras finas, sin kg ni sesiones, y 5 marcas de mes debajo.
	const angosto = $derived(semanas.length > 13);
	const maximo = $derived(Math.max(...semanas.map((s) => s.volumen), 0));
	const alto = (v: number) => (maximo ? Math.max(2, Math.round((v / maximo) * 96)) : 2);
	const actual = lunes(hoy());

	const miles = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 });
	const mes = new Intl.DateTimeFormat('es-AR', { month: 'short' });

	const marcas = $derived.by(() => {
		if (!angosto) return [];
		const n = semanas.length;
		return [0, 1, 2, 3, 4].map((k) => {
			const i = Math.round((k * (n - 1)) / 4);
			const [a, m, d] = semanas[i].semana.split('-').map(Number);
			return { izquierda: ((i + 0.5) / n) * 100, texto: mes.format(new Date(a, m - 1, d)).replace('.', '') };
		});
	});
	const enCurso = $derived(semanas.at(-1)?.semana === actual);
</script>

<div class="grafico" class:angosto aria-hidden="true">
	{#each semanas as s (s.semana)}
		<div class="columna">
			{#if !angosto}<span class="kg">{s.volumen ? miles.format(s.volumen / 1000) : '0'}</span>{/if}
			<div class="dibujo">
				<div class="barra" class:actual={s.semana === actual} style:height="{alto(s.volumen)}px"></div>
			</div>
			{#if !angosto}
				<span class="fecha">{diaMes(s.semana)}</span>
				<span class="sesiones">{s.sesiones}</span>
			{/if}
		</div>
	{/each}
</div>
{#if angosto}
	<div class="meses" aria-hidden="true">
		{#each marcas as m, i (i)}<span style:left="{m.izquierda}%">{m.texto}</span>{/each}
	</div>
{/if}
<p class="nota">
	Semanas de lunes a domingo{angosto ? '' : ' · abajo, sesiones de cada semana'}{enCurso ? ` · la del ${diaMes(actual)} está en curso` : ''}
</p>
<ul class="oculto">
	{#each semanas as s (s.semana)}
		<li>Semana del {diaMes(s.semana)}: {miles.format(s.volumen)} kg, {s.sesiones} {s.sesiones === 1 ? 'sesión' : 'sesiones'}</li>
	{/each}
</ul>

<style>
	.grafico {
		display: flex;
		align-items: flex-end;
		gap: var(--space-1);
		margin-top: var(--space-3);
	}
	.angosto {
		gap: 2px;
	}
	.angosto .barra {
		width: 100%;
	}
	.columna {
		display: grid;
		flex: 1;
		justify-items: center;
		min-width: 0;
	}
	.kg {
		height: 20px;
		color: var(--ink-muted);
		font: 400 var(--fs-meta) / var(--lh-meta) var(--font-text);
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
	}
	.dibujo {
		display: flex;
		align-items: flex-end;
		justify-content: center;
		width: 100%;
		height: 96px;
		border-bottom: 1px solid var(--control);
	}
	.barra {
		width: 70%;
		border-radius: 2px 2px 0 0;
		background: var(--accent);
	}
	.barra.actual {
		background: var(--control);
	}
	/* Condensada (como los números de la app) para que "27/10" entre en semanas angostas */
	.fecha {
		margin-top: var(--space-1);
		color: var(--ink-muted);
		font: 400 var(--fs-meta) / var(--lh-meta) var(--font-display);
		font-stretch: var(--stretch-condensed);
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
	}
	.sesiones {
		font: 600 var(--fs-body) / var(--lh-body) var(--font-text);
		font-variant-numeric: tabular-nums;
	}
	.meses {
		position: relative;
		height: var(--lh-meta);
		margin-top: var(--space-1);
	}
	.meses span {
		position: absolute;
		transform: translateX(-50%);
		color: var(--ink-muted);
		font: 400 var(--fs-meta) / var(--lh-meta) var(--font-text);
		white-space: nowrap;
	}
	.meses span:first-child {
		transform: none;
	}
	.meses span:last-child {
		transform: translateX(-100%);
	}
	.nota {
		margin: var(--space-2) 0 0;
		color: var(--ink-muted);
		font: 400 var(--fs-meta) / var(--lh-meta) var(--font-text);
	}
	/* Visualmente oculto, pero legible por lectores de pantalla */
	.oculto {
		position: absolute;
		width: 1px;
		height: 1px;
		margin: 0;
		padding: 0;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
</style>
