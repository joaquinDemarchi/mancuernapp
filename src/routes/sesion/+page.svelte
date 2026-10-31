<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { desdeObjetivo, diaMes, diasAntes, formatear, formatearVolumen, hoy, semana, sesionDeHoy, ultimaVez, volumen, type Bloque } from '#lib/calculos.ts';
	import { ejercicios, type Tipo } from '#lib/catalogo.ts';
	import { fechaCorta, formatearObjetivo, rutinaActiva, type Objetivo } from '#lib/rutina.ts';
	import { borrarSesion, guardarRegistro, quitarRegistro, sesiones, terminar } from '#lib/sesion.ts';
	import Boton from '#lib/componentes/Boton.svelte';
	import BarraAccion from '#lib/componentes/BarraAccion.svelte';
	import Cabecera from '#lib/componentes/Cabecera.svelte';
	import Hoja from '#lib/componentes/Hoja.svelte';
	import HojaAgregar from '#lib/componentes/HojaAgregar.svelte';
	import HojaAjustar from '#lib/componentes/HojaAjustar.svelte';

	$effect(() => {
		if ($rutinaActiva === null) goto('/');
	});

	// `?fecha=` carga un día anterior (por defecto hoy). La sesión de esa fecha manda (y su día);
	// si no hay, el día de `?dia=` y se crea al primer toque.
	const pedida = page.url.searchParams.get('fecha') ?? '';
	const fecha = /^\d{4}-\d{2}-\d{2}$/.test(pedida) && pedida < hoy() ? pedida : hoy();
	const cuando = fecha === hoy() ? 'Hoy' : fecha === diasAntes(1) ? 'Ayer' : diaMes(fecha);
	const deHoy = $derived($sesiones && sesionDeHoy($sesiones, fecha));
	const diaId = $derived(deHoy?.diaId ?? page.url.searchParams.get('dia'));
	const dia = $derived($rutinaActiva?.dias.find((d) => d.id === diaId) ?? $rutinaActiva?.dias[0]);
	const ctx = $derived($rutinaActiva && dia ? { rutinaId: $rutinaActiva.id, diaId: dia.id, fecha } : undefined);

	type Fila = { ejercicioId: string; objetivo?: Objetivo; extra: boolean };
	const filas = $derived.by((): Fila[] => {
		if (!dia) return [];
		const items = dia.items.map((i) => ({ ...i, extra: false }));
		const extras = (deHoy?.registros ?? [])
			.filter((r) => !dia.items.some((i) => i.ejercicioId === r.ejercicioId))
			.map((r) => ({ ejercicioId: r.ejercicioId, extra: true }));
		return [...items, ...extras];
	});
	const hechos = $derived(deHoy?.registros.length ?? 0);

	const ejercicio = (id: string) => $ejercicios?.find((e) => e.id === id);
	const tipoDe = (id: string) => ejercicio(id)?.tipo;
	const registro = (id: string) => deHoy?.registros.find((r) => r.ejercicioId === id);
	const ultima = (f: Fila) => (dia && $sesiones ? ultimaVez($sesiones, dia.id, f.ejercicioId, fecha, f.extra) : undefined);
	// Campo por campo: Firestore puede devolver las claves en otro orden.
	const clave = (bs?: Bloque[]) => JSON.stringify(bs?.map((b) => [b.series, b.reps, b.kg, b.segundos, b.minutos]));
	const iguales = (a: Bloque[], b?: Bloque[]) => clave(a) === clave(b);

	function valores(f: Fila): { texto: string; clase: string } {
		const tipo = tipoDe(f.ejercicioId) ?? 'peso';
		if (tipo === 'calentamiento') return { texto: 'Calentamiento', clase: registro(f.ejercicioId) ? 'hecho' : '' };
		const r = registro(f.ejercicioId);
		const u = ultima(f);
		if (r) {
			const ajustado = !iguales(r.bloques, u) || r.rpe !== undefined || !!r.nota;
			const rpe = r.rpe !== undefined ? ` · RPE ${r.rpe}` : '';
			const extra = f.extra ? 'Extra · ' : '';
			return { texto: extra + formatear(tipo, r.bloques) + rpe, clase: ajustado ? 'ajustado' : 'hecho' };
		}
		if (u) return { texto: `${f.extra ? 'Extra · última' : 'Última'}: ${formatear(tipo, u)}`, clase: '' };
		if (f.extra) return { texto: 'Extra', clase: '' };
		const o = formatearObjetivo(f.objetivo);
		return { texto: o ? `Primera vez · objetivo ${o}` : 'Primera vez', clase: '' };
	}

	function etiquetaCheck(f: Fila) {
		const nombre = ejercicio(f.ejercicioId)?.nombre ?? 'Ejercicio';
		if (registro(f.ejercicioId)) return `${nombre}: hecho`;
		if (tipoDe(f.ejercicioId) !== 'calentamiento' && ultima(f)) return `${nombre}: igual que la última vez`;
		return `${nombre}: cargar`;
	}

	// Ejercicio abierto en Ajustar.
	let ajustando = $state<Fila>();
	let ajustarAbierta = $state(false);
	function ajustar(f: Fila) {
		ajustando = f;
		ajustarAbierta = true;
	}

	// ✓: hecho → lo quita; con última vez → la copia; primera vez → abre Ajustar.
	function tocarCheck(f: Fila) {
		if (!ctx) return;
		if (registro(f.ejercicioId)) return quitarRegistro(ctx, f.ejercicioId);
		const u = tipoDe(f.ejercicioId) === 'calentamiento' ? [{ series: 1 }] : ultima(f);
		if (u) return guardarRegistro(ctx, { ejercicioId: f.ejercicioId, bloques: u, hecho: true });
		ajustar(f);
	}

	// Cuerpo: el calentamiento se marca/desmarca; el resto abre Ajustar.
	function tocarCuerpo(f: Fila) {
		if (tipoDe(f.ejercicioId) === 'calentamiento') tocarCheck(f);
		else ajustar(f);
	}

	// Extra: queda solo en la sesión, al final; arranca de su última vez en cualquier día o del tipo.
	let agregando = $state(false);
	function agregarExtra(id: string, tipo: Tipo) {
		if (!ctx || !$sesiones) return;
		const bloques = ultimaVez($sesiones, ctx.diaId, id, fecha, true) ?? [desdeObjetivo(tipo)];
		guardarRegistro(ctx, { ejercicioId: id, bloques, hecho: true });
	}

	let resumen = $state(false);
	const total = $derived(
		deHoy ? formatearVolumen(volumen(deHoy.registros, (id) => tipoDe(id))) : formatearVolumen(0)
	);

	let borrando = $state(false);
	function borrar() {
		if (deHoy) borrarSesion(deHoy.id);
		goto('/');
	}

	function terminarSesion() {
		if (!deHoy) return;
		if (deHoy.terminada) return goto('/');
		terminar(deHoy.id);
		resumen = true;
	}
</script>

<main class="pantalla">
	{#if dia && $rutinaActiva && $sesiones && $ejercicios}
		{@const n = semana($sesiones, dia.id, deHoy)}
		<Cabecera
			titulo="{cuando}: {dia.nombre}"
			meta="{$rutinaActiva.nombre} · semana {n} · {hechos}/{filas.length} hechos"
			volver="/"
		>
			{#snippet accion()}
				{#if deHoy}<button class="texto" onclick={() => (borrando = true)}>Borrar</button>{/if}
			{/snippet}
		</Cabecera>
		<ul>
			{#each filas as f (f.ejercicioId)}
				{@const v = valores(f)}
				{@const hecho = !!registro(f.ejercicioId)}
				<li>
					<button type="button" class="cuerpo" onclick={() => tocarCuerpo(f)}>
						<span class="nombre">{ejercicio(f.ejercicioId)?.nombre ?? '…'}</span>
						<span class="valores {v.clase}">{v.texto}</span>
					</button>
					<button
						type="button"
						class="check"
						aria-pressed={hecho}
						aria-label={etiquetaCheck(f)}
						onclick={() => tocarCheck(f)}
					>
						<svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
							<path d="M4 12.5 9.5 18 20 6.5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="square" />
						</svg>
					</button>
				</li>
			{/each}
		</ul>
		<button type="button" class="agregar" onclick={() => (agregando = true)}>+ Agregar ejercicio</button>
		<HojaAgregar
			bind:abierta={agregando}
			titulo="Agregar a la sesión"
			yaEstan={new Set(filas.map((f) => f.ejercicioId))}
			contexto="sesion"
			onagregar={agregarExtra}
		/>

		{#if ajustando && ejercicio(ajustando.ejercicioId)}
			{@const f = ajustando}
			{@const e = ejercicio(f.ejercicioId)!}
			{@const u = ultima(f)}
			{#key f.ejercicioId}
				<HojaAjustar
					bind:abierta={ajustarAbierta}
					ejercicio={e}
					registro={registro(f.ejercicioId)}
					ultima={u}
					inicial={u ?? [desdeObjetivo(e.tipo, f.objetivo)]}
					onguardar={(r) => ctx && guardarRegistro(ctx, r)}
				/>
			{/key}
		{/if}

		{#if deHoy}
			<Hoja
				bind:abierta={borrando}
				titulo={cuando === 'Hoy' ? 'Sesión de hoy' : `Sesión del ${diaMes(fecha)}`}
				meta="{dia.nombre} · {fechaCorta(deHoy.fecha)} · {deHoy.terminada ? 'terminada' : 'en curso'}"
			>
				<p class="aviso" role="alert">
					{hechos === 1 ? 'Se borra el ejercicio cargado.' : `Se borran los ${hechos} ejercicios cargados.`} No se puede
					deshacer.
				</p>
				<div class="acciones">
					<Boton variante="secundario" onclick={() => (borrando = false)}>Cancelar</Boton>
					<Boton onclick={borrar}>Sí, borrar sesión</Boton>
				</div>
			</Hoja>
		{/if}

		<Hoja bind:abierta={resumen} titulo="Sesión terminada" meta="{dia.nombre} · semana {n} · {hechos} de {filas.length} ejercicios">
			<div class="volumen">
				<span class="meta">Volumen</span>
				<span class="numero">{total}</span>
			</div>
			<p class="meta">
				{cuando === 'Hoy' ? 'Queda guardada. Hasta mañana podés volver a tocarla desde el inicio.' : 'Queda guardada.'}
			</p>
			<Boton onclick={() => goto('/')}>Listo</Boton>
		</Hoja>
	{/if}
</main>
<BarraAccion>
	<Boton disabled={!hechos} onclick={terminarSesion}>{deHoy?.terminada ? 'Listo' : 'Terminar sesión'}</Boton>
</BarraAccion>

<style>
	ul {
		display: grid;
		gap: var(--space-1);
		margin: 0;
		padding: 0;
		list-style: none;
	}
	li {
		display: flex;
		align-items: stretch;
		gap: var(--space-1);
		min-height: 64px;
	}
	.cuerpo {
		display: grid;
		align-content: center;
		flex: 1;
		min-width: 0;
		padding: var(--space-2) var(--space-4);
		border: 0;
		border-radius: var(--radius);
		background: var(--surface);
		color: var(--ink);
		text-align: left;
		cursor: pointer;
	}
	.nombre {
		font: 600 var(--fs-heading) / var(--lh-heading) var(--font-display);
		font-stretch: var(--stretch-condensed);
	}
	.valores {
		color: var(--ink-faint);
		font: 400 var(--fs-meta) / var(--lh-meta) var(--font-text);
		font-variant-numeric: tabular-nums;
	}
	.valores.hecho {
		color: var(--ink);
	}
	.valores.ajustado {
		color: var(--accent-ink);
	}
	.check {
		display: grid;
		place-items: center;
		flex: none;
		width: 64px;
		border: 2px solid var(--control);
		border-radius: var(--radius);
		background: transparent;
		color: var(--ink-muted);
		cursor: pointer;
	}
	.check[aria-pressed='true'] {
		border-color: var(--accent);
		background: var(--accent);
		color: var(--on-accent);
	}
	.cuerpo:focus-visible,
	.check:focus-visible {
		outline: 2px solid var(--focus);
		outline-offset: 2px;
	}
	.agregar {
		min-height: 64px;
		margin-top: var(--space-1);
		border: 2px dashed var(--control);
		border-radius: var(--radius);
		background: transparent;
		color: var(--ink);
		font: 600 var(--fs-body) / var(--lh-body) var(--font-text);
		cursor: pointer;
	}
	.agregar:focus-visible {
		outline: 2px solid var(--focus);
		outline-offset: 2px;
	}
	.meta {
		margin: 0;
		color: var(--ink-faint);
		font: 400 var(--fs-meta) / var(--lh-meta) var(--font-text);
	}
	.aviso {
		margin: 0;
		color: var(--alto);
		font: 600 var(--fs-body) / var(--lh-body) var(--font-text);
	}
	.acciones {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-2);
	}
	.volumen {
		display: grid;
	}
	.numero {
		font: 700 var(--fs-num-xl) / var(--lh-num-xl) var(--font-display);
		font-stretch: var(--stretch-condensed);
		letter-spacing: var(--tracking-display);
		font-variant-numeric: tabular-nums;
	}
</style>
