<script lang="ts">
	import { onDestroy } from 'svelte';
	import { formatearDescanso, restante } from '#lib/descanso.ts';

	// Flotante de /sesion: botón que abre el mini timer. Vive con la pantalla (al salir se corta).
	let { proximo }: { proximo?: { nombre: string; descanso?: number } } = $props();

	const PASO = 15;
	// Última duración usada en esta pantalla (en memoria).
	let ultima = $state<number>();
	// `nombre` solo si la duración salió del catálogo. Se guarda la hora de fin, no un contador.
	let timer = $state<{ nombre?: string; duracion: number; fin: number }>();
	let ahora = $state(Date.now());

	const sugerida = $derived(
		proximo?.descanso ? { nombre: proximo.nombre, duracion: proximo.descanso } : { duracion: ultima ?? 90 }
	);
	const falta = $derived(timer ? restante(timer.fin, ahora) : 0);
	const termino = $derived(!!timer && falta === 0);

	let tick: ReturnType<typeof setInterval> | undefined;
	let lock: WakeLockSentinel | undefined;

	function pedirPantalla() {
		navigator.wakeLock
			?.request('screen')
			.then((l) => {
				// Si terminó mientras llegaba, se suelta enseguida.
				if (timer && !termino) {
					lock?.release().catch(() => {});
					lock = l;
				}
				else l.release().catch(() => {});
			})
			.catch(() => {});
	}
	function soltarPantalla() {
		lock?.release().catch(() => {});
		lock = undefined;
	}

	function arrancar(nombre: string | undefined, duracion: number) {
		ahora = Date.now();
		timer = { nombre, duracion, fin: ahora + duracion * 1000 };
		ultima = duracion;
		clearInterval(tick);
		tick = setInterval(() => (ahora = Date.now()), 250);
		pedirPantalla();
	}

	function ajustar(d: number) {
		if (!timer) return;
		const duracion = Math.max(PASO, timer.duracion + d);
		ahora = Date.now();
		timer = { ...timer, duracion, fin: Math.max(ahora, timer.fin + (duracion - timer.duracion) * 1000) };
		ultima = duracion;
	}

	function cerrar() {
		clearInterval(tick);
		timer = undefined;
		soltarPantalla();
	}

	// Al llegar a 0: vibra una sola vez (si se puede) y suelta la pantalla.
	$effect(() => {
		if (!termino) return;
		clearInterval(tick);
		soltarPantalla();
		navigator.vibrate?.([200, 100, 200]);
	});

	// Con la pantalla apagada los intervalos se frenan: al volver se recalcula y se vuelve a pedir la pantalla.
	function alVolver() {
		if (document.visibilityState !== 'visible') return;
		ahora = Date.now();
		if (timer && !termino) pedirPantalla();
	}

	onDestroy(() => {
		clearInterval(tick);
		soltarPantalla();
	});
</script>

<svelte:document onvisibilitychange={alVolver} />

{#if !timer}
	<button
		type="button"
		class="flotante abrir"
		aria-label="Abrir descanso de {formatearDescanso(sugerida.duracion)}"
		onclick={() => arrancar(sugerida.nombre, sugerida.duracion)}
	>
		<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="square" aria-hidden="true">
			<circle cx="12" cy="14" r="7.5" />
			<path d="M12 14V10M9.5 3h5" />
		</svg>
		{formatearDescanso(sugerida.duracion)}
	</button>
{:else if termino}
	<div class="flotante caja termino" role="status">
		<div class="arriba">
			<span class="meta">Descanso de {formatearDescanso(timer.duracion)}</span>
			<span class="tiempo">Terminó</span>
		</div>
		<div class="botones">
			<button type="button" class="secundario" onclick={() => timer && arrancar(timer.nombre, timer.duracion)}>Otra vez</button>
			<button type="button" class="de-texto" onclick={cerrar}>Cerrar</button>
		</div>
	</div>
{:else}
	<div class="flotante caja" role="timer" aria-label="Descanso">
		<div class="arriba">
			<div class="lectura">
				<span class="meta">{timer.nombre ?? 'Descanso'}</span>
				<span class="tiempo">{formatearDescanso(falta)}</span>
			</div>
			<button type="button" class="de-texto" onclick={cerrar}>Saltar</button>
		</div>
		<div class="botones">
			<button type="button" class="secundario" aria-label="Restar 15 segundos" onclick={() => ajustar(-PASO)}>−15 s</button>
			<button type="button" class="secundario" aria-label="Sumar 15 segundos" onclick={() => ajustar(PASO)}>+15 s</button>
		</div>
	</div>
{/if}

<style>
	/* Abajo a la derecha, arriba de la BarraAccion (su alto + space-2) */
	.flotante {
		position: fixed;
		right: var(--space-4);
		bottom: calc(var(--touch-primary) + var(--space-3) * 2 + env(safe-area-inset-bottom, 0px) + var(--space-2));
		border-radius: var(--radius);
		background: var(--raised);
		color: var(--ink);
		box-shadow: var(--elevation-float);
	}
	button {
		min-height: var(--touch-min);
		border-radius: var(--radius);
		font: 600 var(--fs-body) / var(--lh-body) var(--font-text);
		cursor: pointer;
	}
	button:focus-visible {
		outline: 2px solid var(--focus);
		outline-offset: 2px;
	}
	.abrir {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		min-height: var(--touch-primary);
		padding: 0 var(--space-4);
		border: 0;
		font-variant-numeric: tabular-nums;
	}
	.caja {
		display: grid;
		gap: var(--space-2);
		width: 244px;
		padding: var(--space-2) var(--space-2) var(--space-2) var(--space-4);
	}
	.arriba {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-2);
	}
	.lectura,
	.termino .arriba {
		display: grid;
		min-width: 0;
	}
	.meta {
		overflow: hidden;
		color: var(--ink-muted);
		font: 400 var(--fs-meta) / var(--lh-meta) var(--font-text);
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.tiempo {
		font: 700 var(--fs-num-l) / var(--lh-num-l) var(--font-display);
		font-stretch: var(--stretch-condensed);
		font-variant-numeric: tabular-nums;
	}
	.botones {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-2);
	}
	.secundario {
		border: 2px solid var(--control);
		background: transparent;
		color: var(--ink);
	}
	.de-texto {
		padding: 0 var(--space-3);
		border: 0;
		background: transparent;
		color: var(--ink);
	}
	/* Terminó: invertida, sirve en los dos temas */
	.termino {
		background: var(--ink);
		color: var(--ground);
	}
	.termino .meta,
	.termino .de-texto {
		color: var(--ground);
	}
	.termino .secundario {
		border-color: var(--ground);
		color: var(--ground);
	}
</style>
