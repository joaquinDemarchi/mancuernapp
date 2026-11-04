<script lang="ts">
	import { tick } from 'svelte';
	import { goto } from '$app/navigation';
	import { diaMes, hoy } from '#lib/calculos.ts';
	import { ejercicios } from '#lib/catalogo.ts';
	import { armarImport, escribirCsv, leerCsv, planImport, plantillaCsv, validar, type ErrorFila, type Plan } from '#lib/csv.ts';
	import { guardarImport, ultimoImport } from '#lib/importar.ts';
	import { rutinaActiva, rutinas } from '#lib/rutina.ts';
	import { sesiones } from '#lib/sesion.ts';
	import Boton from '#lib/componentes/Boton.svelte';
	import BarraAccion from '#lib/componentes/BarraAccion.svelte';
	import Cabecera from '#lib/componentes/Cabecera.svelte';

	const cantidad = (n: number, uno: string, varios: string) => `${n} ${n === 1 ? uno : varios}`;
	const cargado = $derived(!!$ejercicios && !!$rutinas && !!$sesiones);

	// Blob + <a download> temporal: anda offline, sin pasar por ningún servidor.
	function descargar(texto: string, nombre: string) {
		const url = URL.createObjectURL(new Blob([texto], { type: 'text/csv;charset=utf-8' }));
		const a = document.createElement('a');
		a.href = url;
		a.download = nombre;
		a.click();
		setTimeout(() => URL.revokeObjectURL(url));
	}

	function exportar() {
		if (!$ejercicios || !$rutinas || !$sesiones) return;
		descargar(escribirCsv({ ejercicios: $ejercicios, rutinas: $rutinas, sesiones: $sesiones }), `mancuernapp-${hoy()}.csv`);
	}

	// Revisión: reemplaza el contenido de la pantalla; nada se escribe hasta "Importar".
	let revision = $state<{ archivo: string; filas: number; errores: ErrorFila[]; encabezadoMal: boolean; plan?: Plan }>();
	let decisiones = $state<Record<string, 'mismo' | 'nuevo'>>({});
	let terminarActiva = $state(true);
	let abiertos = $state<string[]>([]);

	async function elegir(e: Event & { currentTarget: HTMLInputElement }) {
		const archivo = e.currentTarget.files?.[0];
		// Vaciarlo deja volver a elegir el mismo archivo después de corregirlo.
		e.currentTarget.value = '';
		if (!archivo || !$ejercicios || !$rutinas || !$sesiones) return;
		const leidas = leerCsv(await archivo.text());
		const { filas, errores } = validar(leidas);
		const plan = planImport(filas, { ejercicios: $ejercicios, rutinas: $rutinas, sesiones: $sesiones });
		const todos = [...errores, ...plan.errores].sort((a, b) => a.linea - b.linea);
		// La única fila que puede fallar en la línea del encabezado es el encabezado: entonces no se revisó nada más.
		const encabezadoMal = todos.some((e) => e.linea === leidas[0]?.linea);
		revision = { archivo: archivo.name, filas: Math.max(leidas.length - 1, 0), errores: todos, encabezadoMal, plan: todos.length ? undefined : plan };
		decisiones = {};
		terminarActiva = true;
		abiertos = [];
		// El input que tenía el foco ya no está: el foco va al título de la revisión.
		await tick();
		document.querySelector<HTMLElement>('main h2')?.focus();
	}

	function cancelar() {
		revision = undefined;
	}

	// Sin pantalla de éxito: vuelve al inicio, que ya muestra lo importado desde la caché local.
	function importar() {
		if (!revision?.plan) return;
		const opciones = { decisiones, terminarActiva, activa: $rutinaActiva?.id, hoy: hoy(), nuevoId: () => crypto.randomUUID() };
		guardarImport(armarImport(revision.plan, opciones));
		ultimoImport.set(`Importado: ${titulo}`);
		goto('/');
	}

	const plan = $derived(revision?.plan);
	const dudosos = $derived(plan?.ejercicios.filter((e) => !e.existente && e.parecidos.length) ?? []);
	const faltan = $derived(dudosos.filter((e) => !decisiones[e.nombre]).length);
	const nuevos = $derived(plan?.ejercicios.filter((e) => !e.existente && !e.parecidos.length) ?? []);
	const existentes = $derived(plan?.ejercicios.filter((e) => e.existente) ?? []);
	const salteadas = $derived(plan?.rutinas.flatMap((r) => r.salteadas.map((f) => `${r.nombre}: ${diaMes(f)} ya tiene sesión`)) ?? []);
	const rutinasNuevas = $derived(plan?.rutinas.filter((r) => !r.existente).length ?? 0);
	const sesionesNuevas = $derived(plan?.rutinas.reduce((n, r) => n + r.sesiones.length, 0) ?? 0);
	// Con una activa, una rutina nueva sin fechas obliga a elegir: terminar la activa o guardarla archivada.
	const nuevaActiva = $derived(plan?.rutinas.find((r) => !r.existente && r.estado === 'activa'));
	const lineasConError = $derived(new Set(revision?.errores.map((e) => e.linea)).size);
	const nadaNuevo = $derived(!rutinasNuevas && !sesionesNuevas);

	const titulo = $derived(
		rutinasNuevas
			? cantidad(rutinasNuevas, 'rutina nueva', 'rutinas nuevas') + (sesionesNuevas ? ` y ${cantidad(sesionesNuevas, 'sesión', 'sesiones')}` : '')
			: cantidad(sesionesNuevas, 'sesión', 'sesiones')
	);
	const detalle = $derived(
		[
			{ id: 'nuevos', titulo: cantidad(nuevos.length, 'ejercicio nuevo', 'ejercicios nuevos'), lineas: nuevos.map((e) => e.nombre) },
			{
				id: 'existentes',
				titulo: `${existentes.length} ${existentes.length === 1 ? 'ya está' : 'ya están'} en tu catálogo`,
				lineas: existentes.map((e) => e.existente!.nombre)
			},
			{ id: 'salteadas', titulo: cantidad(salteadas.length, 'fecha se saltea', 'fechas se saltean'), lineas: salteadas }
		].filter((d) => d.lineas.length)
	);
	const resumir = (lineas: string[], hasta = 3) => lineas.slice(0, hasta).join(', ') + (lineas.length > hasta ? '…' : '');
	const plegar = (id: string) => (abiertos = abiertos.includes(id) ? abiertos.filter((a) => a !== id) : [...abiertos, id]);
</script>

<main class="pantalla">
	{#if revision}
		<Cabecera
			titulo="Revisar import"
			meta="{revision.archivo} · {cantidad(revision.filas, 'fila', 'filas')}"
			volver="/datos"
			onvolver={cancelar}
			etiquetaVolver="Cancelar"
		/>
		{#if revision.errores.length}
			<h2 class="titulo-error" role="alert" tabindex="-1">{cantidad(lineasConError, 'fila con error', 'filas con error')}</h2>
			<p class="explica">Corregilas en el archivo y volvé a elegirlo. No se guardó nada.</p>
			<ul class="errores">
				{#each revision.errores as e, i (i)}
					<li><span class="fila">Fila {e.linea}</span> {e.mensaje}</li>
				{/each}
			</ul>
			{#if !revision.encabezadoMal && revision.filas > lineasConError}
				<p class="meta">
					{revision.filas - lineasConError === 1 ? 'La otra fila está bien.' : `Las otras ${revision.filas - lineasConError} filas están bien.`}
				</p>
			{/if}
		{:else if plan}
			<section class="resumen">
				<h2 tabindex="-1">{nadaNuevo ? 'Nada para importar' : titulo}</h2>
				{#if nadaNuevo}
					<p class="meta">{salteadas.length ? 'Todas las fechas ya tienen sesión.' : 'El archivo no tiene filas para importar.'}</p>
				{/if}
				{#each plan.rutinas as r (r.nombre)}
					<p class="meta">
						<span class="nombre">{r.nombre}</span>
						{#if r.existente}
							· {cantidad(r.sesiones.length, 'sesión más', 'sesiones más')}
						{:else if r.estado === 'archivada'}
							· archivada · {cantidad(r.sesiones.length, 'sesión', 'sesiones')}
						{:else}
							· nueva · {cantidad(r.dias.length, 'día', 'días')}
						{/if}
					</p>
				{/each}
			</section>

			{#if dudosos.length || (nuevaActiva && $rutinaActiva)}
				<section>
					<h2 class="seccion">Para decidir</h2>
					{#each dudosos as e (e.nombre)}
						<div class="caja">
							<span class="nombre">{e.nombre}</span>
							<span class="meta">¿Es «{e.parecidos[0].nombre}» de tu catálogo?</span>
							{#if e.parecidos.length > 1}
								<span class="meta">También se parece a {e.parecidos.slice(1).map((p) => `«${p.nombre}»`).join(', ')}</span>
							{/if}
							<div class="chips">
								<button type="button" aria-pressed={decisiones[e.nombre] === 'mismo'} onclick={() => (decisiones[e.nombre] = 'mismo')}>
									Es el mismo
								</button>
								<button type="button" aria-pressed={decisiones[e.nombre] === 'nuevo'} onclick={() => (decisiones[e.nombre] = 'nuevo')}>
									Crear nuevo
								</button>
							</div>
						</div>
					{/each}
					{#if nuevaActiva && $rutinaActiva}
						<fieldset class="caja">
							<legend>Tenés {$rutinaActiva.nombre} activa</legend>
							<label class="radio">
								<input type="radio" name="activa" value={true} bind:group={terminarActiva} />
								<span>
									Terminar {$rutinaActiva.nombre} y empezar esta
									<span class="meta">{$rutinaActiva.nombre} pasa al historial con fin hoy</span>
								</span>
							</label>
							<label class="radio">
								<input type="radio" name="activa" value={false} bind:group={terminarActiva} />
								<span>
									Guardarla archivada
									<span class="meta">Seguís con {$rutinaActiva.nombre}; la activás después desde el historial</span>
								</span>
							</label>
						</fieldset>
					{/if}
				</section>
			{/if}

			{#if detalle.length}
				<section>
					<h2 class="seccion">Detalle</h2>
					{#each detalle as d (d.id)}
						{@const abierto = abiertos.includes(d.id)}
						<button type="button" class="plegable" aria-expanded={abierto} aria-controls="detalle-{d.id}" onclick={() => plegar(d.id)}>
							<span class="textos">
								<span class="titulo">{d.titulo}</span>
								{#if !abierto}<span class="meta">{resumir(d.lineas)}</span>{/if}
							</span>
							<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
								<path d={abierto ? 'm6 15 6-6 6 6' : 'm6 9 6 6 6-6'} fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="square" />
							</svg>
						</button>
						{#if abierto}
							<ul class="lineas" id="detalle-{d.id}">
								{#each d.lineas as l, i (i)}<li>{l}</li>{/each}
							</ul>
						{/if}
					{/each}
				</section>
			{/if}
		{/if}
	{:else}
		<Cabecera titulo="Importar y exportar" volver="/" />

		<section>
			<h2 class="seccion">Sacar tus datos</h2>
			<button type="button" class="dato" disabled={!cargado} onclick={exportar}>
				<span class="textos">
					<span class="titulo">Exportar todo</span>
					<span class="meta">
						{cantidad($rutinas?.length ?? 0, 'rutina', 'rutinas')} · {cantidad($sesiones?.length ?? 0, 'sesión', 'sesiones')} · un CSV para Excel
					</span>
				</span>
				<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
					<path d="M12 4v11m-5-5 5 5 5-5M5 20h14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="square" />
				</svg>
			</button>
		</section>

		<section>
			<h2 class="seccion">Traer rutinas y sesiones</h2>
			<label class="dato" class:deshabilitado={!cargado}>
				<input class="oculto" type="file" accept=".csv,text/csv" disabled={!cargado} onchange={elegir} />
				<span class="textos">
					<span class="titulo">Importar CSV</span>
					<span class="meta">Antes de guardar ves qué se crea</span>
				</span>
				<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
					<path d="M12 20V9m-5 5 5-5 5 5M5 4h14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="square" />
				</svg>
			</label>
			<button type="button" class="dato" onclick={() => descargar(plantillaCsv(), 'mancuernapp-plantilla.csv')}>
				<span class="textos">
					<span class="titulo">Descargar plantilla</span>
					<span class="meta">Columnas y filas de ejemplo para llenar</span>
				</span>
				<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
					<path d="M12 4v11m-5-5 5 5 5-5M5 20h14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="square" />
				</svg>
			</button>
		</section>

		<p class="meta">
			Filas sin fecha arman los días de una rutina; filas con fecha son sesiones hechas. Separador «;» y coma decimal.
		</p>
	{/if}
</main>
{#if revision}
	<BarraAccion>
		<div class="barra">
			{#if revision.errores.length}
				<Boton variante="secundario" onclick={cancelar}>Cancelar</Boton>
				<label class="boton-archivo">
					<input class="oculto" type="file" accept=".csv,text/csv" onchange={elegir} />
					Elegir otro archivo
				</label>
			{:else}
				{#if faltan}<p class="meta falta">Falta decidir {cantidad(faltan, 'ejercicio', 'ejercicios')}</p>{/if}
				<Boton variante="secundario" onclick={cancelar}>Cancelar</Boton>
				<Boton disabled={faltan > 0 || nadaNuevo} onclick={importar}>Importar</Boton>
			{/if}
		</div>
	</BarraAccion>
{/if}

<style>
	section {
		display: grid;
		gap: var(--space-2);
		margin-bottom: var(--space-4);
	}
	.dato,
	.plegable {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		width: 100%;
		min-height: 56px;
		padding: var(--space-2) var(--space-4);
		border: 0;
		border-radius: var(--radius);
		background: var(--surface);
		color: var(--ink);
		text-align: left;
		cursor: pointer;
	}
	.plegable {
		min-height: 64px;
	}
	.dato:disabled,
	.dato.deshabilitado {
		cursor: default;
		opacity: 0.6;
	}
	.dato:focus-visible,
	.plegable:focus-visible,
	label:has(.oculto:focus-visible) {
		outline: 2px solid var(--focus);
		outline-offset: 2px;
	}
	.dato svg,
	.plegable svg {
		flex: none;
		color: var(--ink-faint);
	}
	/* Visualmente oculto, pero enfocable y legible por lectores de pantalla */
	.oculto {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
	.textos {
		display: grid;
		flex: 1;
		min-width: 0;
	}
	.titulo {
		font: 600 var(--fs-body) / var(--lh-body) var(--font-text);
	}
	.meta {
		margin: 0;
		color: var(--ink-faint);
		font: 400 var(--fs-meta) / var(--lh-meta) var(--font-text);
	}
	.nombre {
		color: var(--ink);
		font: 600 var(--fs-body) / var(--lh-body) var(--font-text);
	}
	.resumen {
		gap: var(--space-1);
		padding: var(--space-4);
		border-radius: var(--radius);
		background: var(--surface);
	}
	h2 {
		margin: 0 0 var(--space-1);
		font: 600 var(--fs-heading) / var(--lh-heading) var(--font-display);
		font-stretch: var(--stretch-condensed);
	}
	h2:focus {
		outline: none;
	}
	h2.seccion {
		margin: 0;
		color: var(--ink-muted);
		font: 600 var(--fs-meta) / var(--lh-meta) var(--font-text);
		font-stretch: normal;
	}
	.caja {
		display: grid;
		gap: var(--space-1);
		min-width: 0;
		margin: 0;
		padding: var(--space-3) var(--space-4);
		border: 0;
		border-radius: var(--radius);
		background: var(--surface);
	}
	.chips {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-2);
		margin-top: var(--space-1);
	}
	.chips button {
		min-height: var(--touch-min);
		border: 0;
		border-radius: var(--radius);
		background: var(--raised);
		color: var(--ink);
		font: 600 var(--fs-body) / var(--lh-body) var(--font-text);
		cursor: pointer;
	}
	.chips button[aria-pressed='true'] {
		background: var(--accent);
		color: var(--on-accent);
	}
	.chips button:focus-visible {
		outline: 2px solid var(--focus);
		outline-offset: 2px;
	}
	legend {
		float: left;
		width: 100%;
		margin-bottom: var(--space-1);
		padding: 0;
		color: var(--ink);
		font: 600 var(--fs-body) / var(--lh-body) var(--font-text);
	}
	.radio {
		display: flex;
		align-items: flex-start;
		gap: var(--space-3);
		min-height: var(--touch-min);
		padding: var(--space-2) 0;
		color: var(--ink);
		font: 400 var(--fs-body) / var(--lh-body) var(--font-text);
		cursor: pointer;
	}
	.radio input {
		flex: none;
		width: 22px;
		height: 22px;
		margin: 1px 0 0;
		accent-color: var(--accent);
	}
	.radio > span {
		display: grid;
	}
	.lineas {
		display: grid;
		gap: var(--space-1);
		margin: 0;
		padding: 0 var(--space-4);
		list-style: none;
		color: var(--ink-muted);
		font: 400 var(--fs-body) / var(--lh-body) var(--font-text);
	}
	.titulo-error {
		margin-top: var(--space-2);
	}
	.explica {
		margin: 0 0 var(--space-3);
		color: var(--ink-muted);
		font: 400 var(--fs-body) / var(--lh-body) var(--font-text);
	}
	.errores {
		display: grid;
		gap: var(--space-1);
		margin: 0 0 var(--space-3);
		padding: 0;
		list-style: none;
	}
	.errores li {
		display: grid;
		padding: var(--space-3) var(--space-4);
		border-radius: var(--radius);
		background: var(--alto-tint);
		color: var(--ink);
		font: 400 var(--fs-body) / var(--lh-body) var(--font-text);
	}
	.errores .fila {
		color: var(--alto);
		font-weight: 600;
	}
	.barra {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-2);
	}
	.falta {
		grid-column: 1 / -1;
		text-align: center;
	}
	/* El input de archivo no se puede abrir desde un botón propio sin JS: el label hace de botón primario. */
	.boton-archivo {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: var(--touch-primary);
		padding: 0 var(--space-4);
		border-radius: var(--radius);
		background: var(--accent);
		color: var(--on-accent);
		font: 600 var(--fs-body) / var(--lh-body) var(--font-text);
		text-align: center;
		cursor: pointer;
	}
</style>
