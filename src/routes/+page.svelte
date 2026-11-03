<script lang="ts">
	import { goto } from '$app/navigation';
	import { app } from '#config/app';
	import { salir } from '#lib/acceso.ts';
	import { anterior as sesionAnterior, crecimiento, diaMes, diasAntes, diaSugerido, formatearPct, formatearVolumen, hoy, indicador, semana, sesionDeHoy, volumen } from '#lib/calculos.ts';
	import { ejercicios } from '#lib/catalogo.ts';
	import { crearRutina, fechaCorta, nuevaRutina, rutinaActiva, rutinas } from '#lib/rutina.ts';
	import { sesiones } from '#lib/sesion.ts';
	import Boton from '#lib/componentes/Boton.svelte';
	import BarraAccion from '#lib/componentes/BarraAccion.svelte';
	import Cabecera from '#lib/componentes/Cabecera.svelte';
	import Hoja from '#lib/componentes/Hoja.svelte';
	import Indicador from '#lib/componentes/Indicador.svelte';
	import OpcionesChip from '#lib/componentes/OpcionesChip.svelte';

	let creando = $state(false);

	async function crear() {
		creando = true;
		try {
			await crearRutina();
			goto('/rutina');
		} finally {
			creando = false;
		}
	}

	// Sin activa pero con archivadas: la nueva copia los días de la última terminada.
	const ultimaRutina = $derived($rutinas?.filter((r) => r.fin).sort((a, b) => a.fin!.localeCompare(b.fin!)).at(-1));
	const sesionesUltima = $derived($sesiones?.filter((s) => s.rutinaId === ultimaRutina?.id).length ?? 0);

	function nueva() {
		nuevaRutina();
		goto('/rutina');
	}

	function cantidad(n: number) {
		return n ? `${n} ejercicio${n === 1 ? '' : 's'}` : 'Sin ejercicios';
	}

	// Tarjeta "Hoy": la sesión de hoy si existe; si no, el día sugerido o el elegido con los chips.
	const deHoy = $derived($sesiones && sesionDeHoy($sesiones, hoy(), $rutinaActiva?.id));
	const sugerido = $derived($rutinaActiva && $sesiones && diaSugerido($rutinaActiva, $sesiones));
	let elegido = $state<string>();
	// Casi siempre se entrena el sugerido: los chips aparecen recién al tocar "Cambiar".
	let cambiarDia = $state(false);
	const diaId = $derived(deHoy?.diaId ?? elegido ?? sugerido?.id);
	const dia = $derived($rutinaActiva?.dias.find((d) => d.id === diaId));
	const ultima = $derived($sesiones?.filter((s) => s.rutinaId === $rutinaActiva?.id && s.fecha < hoy()).at(-1));

	const metaHoy = $derived.by(() => {
		if (!dia || !$sesiones) return '';
		if (deHoy?.terminada) {
			const tipoDe = (id: string) => $ejercicios?.find((e) => e.id === id)?.tipo;
			return `Terminada · ${formatearVolumen(volumen(deHoy.registros, tipoDe))}`;
		}
		if (deHoy) {
			const extras = deHoy.registros.filter((r) => !dia.items.some((i) => i.ejercicioId === r.ejercicioId));
			return `En curso · ${deHoy.registros.length} de ${dia.items.length + extras.length} hechos`;
		}
		if (!ultima) return 'Primera vez';
		const anterior = $rutinaActiva?.dias.find((d) => d.id === ultima?.diaId);
		const partes = [`Semana ${semana($sesiones, dia.id)}`, cantidad(dia.items.length)];
		if (anterior) partes.push(`la última fue ${anterior.nombre}`);
		return partes.join(' · ');
	});

	// Fila de la última sesión de la rutina antes de hoy (la de hoy ya está en la tarjeta): abre el historial.
	const reciente = $derived.by(() => {
		const s = ultima;
		if (!s || !$sesiones) return undefined;
		const tipoDe = (id: string) => $ejercicios?.find((e) => e.id === id)?.tipo;
		const vol = volumen(s.registros, tipoDe);
		const previa = sesionAnterior($sesiones, s);
		const nombre = $rutinaActiva?.dias.find((d) => d.id === s.diaId)?.nombre ?? 'Sesión';
		const pct = crecimiento(vol, previa && volumen(previa.registros, tipoDe));
		const conPct = pct === undefined ? '' : `, ${formatearPct(pct)} ${{ bajo: 'Bajo', optimo: 'Óptimo', alto: 'Alto' }[indicador(pct)]}`;
		return { fecha: diaMes(s.fecha), nombre, vol: formatearVolumen(vol), pct, etiqueta: `Historial. Última sesión: ${diaMes(s.fecha)}, ${nombre}, ${formatearVolumen(vol)}${conPct}` };
	});

	let verDias = $state(false);
	const nombreDe = (id: string) => $ejercicios?.find((e) => e.id === id)?.nombre ?? '…';

	// "Cargar un día anterior": una sesión olvidada se carga con su fecha real (entre el inicio y ayer).
	let anterior = $state(false);
	let fechaAnt = $state(diasAntes(1));
	let elegidoAnt = $state<string>();
	const fechasRapidas = $derived(
		[
			{ valor: diasAntes(1), etiqueta: 'Ayer' },
			{ valor: diasAntes(2), etiqueta: 'Anteayer' }
		].filter((f) => $rutinaActiva && f.valor >= $rutinaActiva.inicio)
	);
	const yaCargada = $derived($sesiones && sesionDeHoy($sesiones, fechaAnt, $rutinaActiva?.id));
	const diaAnt = $derived.by(() => {
		if (!$rutinaActiva || !$sesiones) return undefined;
		const id = yaCargada?.diaId ?? elegidoAnt ?? diaSugerido($rutinaActiva, $sesiones, fechaAnt)?.id;
		return $rutinaActiva.dias.find((d) => d.id === id);
	});

	// "Otra fecha" es un chip más: el campo de fecha aparece solo al elegirlo.
	let otraFecha = $state(false);
	function elegirFecha(v: string) {
		otraFecha = v === 'otra';
		if (!otraFecha) fechaAnt = v;
		elegidoAnt = undefined;
	}

	function abrirAnterior() {
		fechaAnt = diasAntes(1);
		otraFecha = false;
		elegidoAnt = undefined;
		anterior = true;
	}

	function hechoEl(id: string) {
		const s = $sesiones?.findLast((s) => s.diaId === id);
		return s ? ` · hecho el ${diaMes(s.fecha)}` : '';
	}
</script>

<main class="pantalla">
	<!-- Con rutina, el título es la rutina (sin "MancuernApp" encima); sin rutina, el nombre de la app. -->
	<Cabecera
		titulo={$rutinaActiva === undefined ? '' : ($rutinaActiva?.nombre ?? app.nombre)}
		meta={$rutinaActiva ? `Rutina activa · desde ${fechaCorta($rutinaActiva.inicio)}` : undefined}
	>
		{#snippet accion()}<button class="texto sutil" onclick={salir}>Salir</button>{/snippet}
	</Cabecera>
	{#if $rutinaActiva}
		{#if dia}
			<section class="hoy" aria-label="Hoy">
				<div class="encabezado">
					<div>
						<h3>Hoy: {dia.nombre}</h3>
						<p class="meta">{metaHoy}</p>
					</div>
					{#if !deHoy && $rutinaActiva.dias.length > 1}
						<button class="texto sutil" aria-expanded={cambiarDia} onclick={() => (cambiarDia = !cambiarDia)}>Cambiar</button>
					{/if}
				</div>
				{#if cambiarDia && !deHoy && $rutinaActiva.dias.length > 1}
					<OpcionesChip
						bind:valor={() => dia.id, (v) => (elegido = v)}
						opciones={$rutinaActiva.dias.map((d) => ({ valor: d.id, etiqueta: d.nombre }))}
						leyenda="Cambiar el día"
					/>
				{/if}
				{#if deHoy?.terminada}
					<Boton variante="secundario" onclick={() => goto(`/sesion?dia=${dia.id}`)}>Ver sesión</Boton>
				{:else}
					<Boton onclick={() => goto(`/sesion?dia=${dia.id}`)}>{deHoy ? 'Seguir' : 'Empezar'} {dia.nombre}</Boton>
				{/if}
			</section>
		{/if}
		{#if reciente}
			<a class="ultima" href="/historial" aria-label={reciente.etiqueta}>
				<span class="fecha">{reciente.fecha}</span>
				<span class="datos">
					<span class="label">Última: {reciente.nombre}</span>
					<span class="meta">{reciente.vol} · ver historial</span>
				</span>
				{#if reciente.pct !== undefined}<Indicador pct={reciente.pct} chico conPct />{/if}
			</a>
		{/if}
		<div class="enlaces">
			<!-- Los días solo para mirar; editar va por "Editar rutina", que también queda plegado acá. -->
			<button class="texto sutil" aria-expanded={verDias} onclick={() => (verDias = !verDias)}>
				{verDias ? 'Ocultar rutina' : 'Ver rutina'}
			</button>
			{#if fechasRapidas.length}
				<button class="texto sutil" onclick={abrirAnterior}>Cargar un día anterior</button>
			{/if}
			<a class="texto sutil" href="/datos">Importar y exportar</a>
		</div>
		{#if verDias}
			<ul>
				{#each $rutinaActiva.dias as dia (dia.id)}
					<li>
						<span class="nombre">{dia.nombre}</span>
						<span class="meta">{cantidad(dia.items.length)}{hechoEl(dia.id)}</span>
						{#if dia.items.length}
							<span class="ejercicios">{dia.items.map((i) => nombreDe(i.ejercicioId)).join(' · ')}</span>
						{/if}
					</li>
				{/each}
			</ul>
			<div class="acciones">
				<Boton variante="secundario" onclick={() => goto('/ejercicios')}>Ejercicios</Boton>
				<Boton variante="secundario" onclick={() => goto('/rutina')}>Editar rutina</Boton>
			</div>
		{/if}
		<Hoja bind:abierta={anterior} titulo="Cargar un día anterior">
			<OpcionesChip
				bind:valor={() => (otraFecha ? 'otra' : fechaAnt), elegirFecha}
				opciones={[...fechasRapidas, { valor: 'otra', etiqueta: 'Otra fecha' }]}
				leyenda="Fecha"
			/>
			{#if otraFecha}
				<label class="campo">
					<span>Elegí la fecha</span>
					<input
						type="date"
						min={$rutinaActiva.inicio}
						max={diasAntes(1)}
						value={fechaAnt}
						onchange={(e) => {
							const v = e.currentTarget.value;
							if (v && v >= $rutinaActiva.inicio && v <= diasAntes(1)) fechaAnt = v;
							else e.currentTarget.value = fechaAnt;
							elegidoAnt = undefined;
						}}
					/>
				</label>
			{/if}
			{#if diaAnt}
				{#if yaCargada}
					<p class="meta">El {diaMes(fechaAnt)} ya tiene una sesión de {diaAnt.nombre}.</p>
					<Boton onclick={() => goto(`/sesion?dia=${diaAnt.id}&fecha=${fechaAnt}`)}>Abrir la sesión del {diaMes(fechaAnt)}</Boton>
				{:else}
					{#if $rutinaActiva.dias.length > 1}
						<OpcionesChip
							bind:valor={() => diaAnt.id, (v) => (elegidoAnt = v)}
							opciones={$rutinaActiva.dias.map((d) => ({ valor: d.id, etiqueta: d.nombre }))}
							leyenda="Día"
						/>
					{/if}
					<Boton onclick={() => goto(`/sesion?dia=${diaAnt.id}&fecha=${fechaAnt}`)}>Cargar {diaAnt.nombre} del {diaMes(fechaAnt)}</Boton>
				{/if}
			{/if}
		</Hoja>
	{:else if $rutinaActiva === null && ultimaRutina}
		<div class="vacio">
			<h2 class="titulo">Sin rutina activa</h2>
			<p>
				{ultimaRutina.nombre} terminó el {diaMes(ultimaRutina.fin!)} con {sesionesUltima}
				{sesionesUltima === 1 ? 'sesión' : 'sesiones'}.
			</p>
			<p class="meta">
				La nueva arranca con {ultimaRutina.dias.length === 1 ? 'su día' : `sus ${ultimaRutina.dias.length} días`} y ejercicios;
				después la cambiás.
			</p>
			<div class="enlaces-vacio">
				<a class="texto sutil" href="/historial">Historial</a>
				<a class="texto sutil" href="/datos">Importar y exportar</a>
			</div>
		</div>
	{:else if $rutinaActiva === null}
		<div class="vacio">
			<p class="titulo">Todavía no hay rutina</p>
			<p>Armá los días con ejercicios de tu catálogo.</p>
			<div class="enlaces-vacio">
				<a class="texto sutil" href="/datos">Importar y exportar</a>
			</div>
		</div>
	{/if}
</main>
{#if $rutinaActiva === null && ultimaRutina}
	<BarraAccion><Boton onclick={nueva}>Nueva rutina</Boton></BarraAccion>
{:else if !$rutinaActiva}
	<BarraAccion>
		<Boton variante="secundario" onclick={() => goto('/ejercicios')}>Ejercicios</Boton>
		<Boton disabled={creando || $rutinaActiva === undefined} onclick={crear}>Crear rutina</Boton>
	</BarraAccion>
{/if}

<style>
	.vacio {
		margin: auto 0;
		text-align: center;
	}
	p {
		margin: 0;
		font: 400 var(--fs-body) / var(--lh-body) var(--font-text);
		color: var(--ink-muted);
	}
	.titulo {
		margin: 0;
		font: 600 var(--fs-heading) / var(--lh-heading) var(--font-display);
		color: var(--ink);
	}
	.meta {
		font: 400 var(--fs-meta) / var(--lh-meta) var(--font-text);
		color: var(--ink-faint);
	}
	.vacio .meta {
		margin-top: var(--space-2);
	}
	.enlaces-vacio {
		display: flex;
		justify-content: center;
		margin-top: var(--space-3);
	}
	a.texto {
		display: inline-flex;
		align-items: center;
		text-decoration: none;
	}
	.acciones {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-2);
		margin-top: var(--space-3);
	}
	.hoy {
		display: grid;
		gap: var(--space-3);
		margin-bottom: var(--space-4);
		padding: var(--space-4);
		border-radius: var(--radius);
		background: var(--raised);
	}
	.encabezado {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--space-2);
	}
	.encabezado .texto {
		margin: calc(var(--space-3) * -1) calc(var(--space-3) * -1) 0 0;
	}
	h3 {
		margin: 0;
		font: 600 var(--fs-heading) / var(--lh-heading) var(--font-display);
		font-stretch: var(--stretch-condensed);
	}
	/* Chips no elegidos en --surface: sobre la tarjeta --raised no se verían */
	.hoy :global(input:not(:checked) + span) {
		background: var(--surface);
	}
	ul {
		display: grid;
		gap: var(--space-1);
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.ultima {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		min-height: 64px;
		margin-bottom: var(--space-2);
		padding: var(--space-2) var(--space-4);
		border-radius: var(--radius);
		background: var(--surface);
		color: var(--ink);
		text-decoration: none;
	}
	.ultima:focus-visible {
		outline: 2px solid var(--focus);
		outline-offset: 2px;
	}
	.ultima .fecha {
		flex: none;
		width: 52px;
		font: 600 var(--fs-heading) / var(--lh-heading) var(--font-display);
		font-stretch: var(--stretch-condensed);
		font-variant-numeric: tabular-nums;
	}
	.ultima .datos {
		display: grid;
		flex: 1;
		min-width: 0;
	}
	.ultima .label {
		font: 600 var(--fs-body) / var(--lh-body) var(--font-text);
	}
	.enlaces {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		margin: 0 calc(var(--space-3) * -1);
	}
	.campo {
		display: grid;
		gap: var(--space-1);
	}
	.campo span {
		color: var(--ink-muted);
		font: 400 var(--fs-meta) / var(--lh-meta) var(--font-text);
	}
	input {
		min-height: var(--touch-min);
		padding: 0 var(--space-3);
		border: 2px solid var(--control);
		border-radius: var(--radius);
		background: transparent;
		color: var(--ink);
		font: 400 var(--fs-body) / var(--lh-body) var(--font-text);
		color-scheme: dark light;
	}
	input:focus-visible {
		outline: 2px solid var(--focus);
		outline-offset: 2px;
	}
	li {
		display: grid;
		padding: var(--space-3) var(--space-4);
		border-radius: var(--radius);
		background: var(--surface);
	}
	.ejercicios {
		color: var(--ink-muted);
		font: 400 var(--fs-meta) / var(--lh-meta) var(--font-text);
	}
	.nombre {
		font: 600 var(--fs-heading) / var(--lh-heading) var(--font-display);
		font-stretch: var(--stretch-condensed);
	}
</style>
