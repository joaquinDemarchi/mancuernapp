<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { desdePeriodo, diaMes, hoy, mejoresMarcas, porSemana, progreso, racha, type Periodo } from '#lib/calculos.ts';
	import { ejercicios } from '#lib/catalogo.ts';
	import { rutinaActiva } from '#lib/rutina.ts';
	import { sesiones } from '#lib/sesion.ts';
	import Cabecera from '#lib/componentes/Cabecera.svelte';
	import Indicador from '#lib/componentes/Indicador.svelte';
	import OpcionesChip from '#lib/componentes/OpcionesChip.svelte';

	const listo = $derived($sesiones !== undefined && $rutinaActiva !== undefined && $ejercicios !== null);

	const opciones = $derived([
		...($rutinaActiva ? [{ valor: 'rutina' as const, etiqueta: 'Rutina activa' }] : []),
		{ valor: '3m' as const, etiqueta: '3 meses' },
		{ valor: 'todo' as const, etiqueta: 'Todo' }
	]);

	// El período vive en la URL: al volver de la evolución (history.back()) sigue el elegido.
	const periodo = $derived.by((): Periodo => {
		const p = page.url.searchParams.get('periodo');
		if (p === '3m' || p === 'todo' || (p === 'rutina' && $rutinaActiva)) return p;
		return $rutinaActiva ? 'rutina' : '3m';
	});
	function elegir(p: Periodo) {
		goto(`/resumen?periodo=${p}`, { replace: true, reset: false });
	}

	const desde = $derived(desdePeriodo(periodo, $rutinaActiva));
	const delPeriodo = $derived(($sesiones ?? []).filter((s) => !desde || s.fecha >= desde));
	const tipoDe = (id: string) => $ejercicios?.find((e) => e.id === id)?.tipo;
	const semanas = $derived(porSemana(delPeriodo, tipoDe, desde));
	const semanasSeguidas = $derived(racha($sesiones ?? []));
	const promedio = $derived(semanas.length ? delPeriodo.length / semanas.length : 0);
	const progresos = $derived(progreso(delPeriodo, $ejercicios ?? []));
	const marcas = $derived(mejoresMarcas(delPeriodo, $ejercicios ?? []));

	const nombre = (id: string) => $ejercicios?.find((e) => e.id === id)?.nombre ?? '';
	const unDecimal = new Intl.NumberFormat('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
	const recienEmpezada = $derived(periodo === 'rutina' && $rutinaActiva && $rutinaActiva.inicio >= hoy() ? $rutinaActiva : undefined);
</script>

<main class="pantalla">
	<Cabecera titulo="Resumen" volver="/" />
	{#if listo}
		<div class="periodo">
			<OpcionesChip leyenda="Período" {opciones} bind:valor={() => periodo, elegir} />
		</div>

		<section class="tarjeta constancia">
			<div>
				<span class="num" class:apagado={!semanasSeguidas}>{semanasSeguidas}</span>
				<span class="meta">
					{semanasSeguidas === 1 ? 'semana seguida yendo' : semanasSeguidas ? 'semanas seguidas yendo' : 'semanas seguidas'}
				</span>
			</div>
			<div>
				<span class="num">{unDecimal.format(promedio)}</span>
				<span class="meta">sesiones por semana</span>
			</div>
		</section>

		{#if delPeriodo.length}
			<section class="tarjeta">
				<h2>Progreso por ejercicio</h2>
				<p class="meta">Última vez vs primera vez del período</p>
				{#if progresos.length}
					<ul>
						{#each progresos as p (p.ejercicioId)}
							<li>
								<a class="fila" href="/evolucion?id={p.ejercicioId}">
									<span class="label">{nombre(p.ejercicioId)}</span>
									<Indicador pct={p.pct} chico conPct />
									<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
										<path d="m9 5 7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="square" />
									</svg>
								</a>
							</li>
						{/each}
					</ul>
				{:else}
					<p class="meta">Hacé un ejercicio de peso dos veces en este período para ver su progreso.</p>
				{/if}
			</section>

			{#if marcas.length}
				<section class="tarjeta">
					<h2>Mejores marcas</h2>
					<ul>
						{#each marcas as m (m.ejercicioId)}
							<li class="marca">
								<span class="textos">
									<span class="label">{nombre(m.ejercicioId)}</span>
									<span class="meta">
										{m.marcas[1] ? `${m.marcas[1].etiqueta}: ${m.marcas[1].valor} · ${diaMes(m.marcas[1].fecha)}` : m.marcas[0].etiqueta}
									</span>
								</span>
								<span class="valor">
									<span class="cifra">{m.marcas[0].valor}</span>
									<span class="meta">{diaMes(m.marcas[0].fecha)}</span>
								</span>
							</li>
						{/each}
					</ul>
				</section>
			{/if}
		{:else}
			<div class="vacio">
				<p class="titulo">No hay sesiones en este período</p>
				<p class="meta">
					{recienEmpezada ? `${recienEmpezada.nombre} empezó hace poco. Mirá “3 meses” o “Todo”.` : 'Cuando cargues una sesión, aparece acá.'}
				</p>
			</div>
		{/if}
	{/if}
</main>

<style>
	main {
		gap: var(--space-4);
	}
	/* Los chips del mismo ancho */
	.periodo :global(label) {
		flex: 1;
	}
	.periodo :global(label span) {
		justify-content: center;
		padding: 0 var(--space-1);
		white-space: nowrap;
	}
	.tarjeta {
		padding: var(--space-4);
		border-radius: var(--radius);
		background: var(--surface);
	}
	.constancia {
		display: flex;
		gap: var(--space-4);
	}
	.constancia div {
		display: grid;
		flex: 1;
	}
	.num {
		font: 700 var(--fs-num-l) / var(--lh-num-l) var(--font-display);
		font-stretch: var(--stretch-condensed);
		font-variant-numeric: tabular-nums;
	}
	.apagado {
		color: var(--ink-muted);
	}
	h2 {
		margin: 0;
		font: 600 var(--fs-heading) / var(--lh-heading) var(--font-display);
		font-stretch: var(--stretch-condensed);
	}
	p {
		margin: 0;
	}
	.meta {
		color: var(--ink-muted);
		font: 400 var(--fs-meta) / var(--lh-meta) var(--font-text);
		font-variant-numeric: tabular-nums;
	}
	.label {
		font: 600 var(--fs-body) / var(--lh-body) var(--font-text);
	}
	ul {
		margin: var(--space-2) 0 0;
		padding: 0;
		list-style: none;
	}
	li {
		border-top: 1px solid var(--raised);
	}
	.fila {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		min-height: var(--touch-primary);
		color: var(--ink);
		text-decoration: none;
	}
	.fila .label {
		flex: 1;
		min-width: 0;
	}
	.fila svg {
		flex: none;
		color: var(--ink-faint);
	}
	.fila:focus-visible {
		outline: 2px solid var(--focus);
		outline-offset: 2px;
	}
	.marca {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		min-height: 56px;
		padding: var(--space-2) 0;
	}
	.textos {
		display: grid;
		flex: 1;
		min-width: 0;
	}
	.valor {
		display: grid;
		justify-items: end;
		text-align: right;
	}
	.cifra {
		font: 700 var(--fs-heading) / var(--lh-heading) var(--font-display);
		font-stretch: var(--stretch-condensed);
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
	}
	.vacio {
		display: grid;
		gap: var(--space-1);
		margin: var(--space-8) 0;
		text-align: center;
	}
	.vacio .titulo {
		font: 600 var(--fs-heading) / var(--lh-heading) var(--font-display);
		font-stretch: var(--stretch-condensed);
	}
</style>
