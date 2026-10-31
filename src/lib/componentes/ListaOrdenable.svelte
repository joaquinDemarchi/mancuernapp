<script lang="ts" module>
	/** Lo que la fila pone en su manija (o en el elemento que hace de manija). */
	export type Manija = {
		onpointerdown: (e: PointerEvent) => void;
		onkeydown: (e: KeyboardEvent) => void;
		'data-manija': string;
	};
</script>

<script lang="ts" generics="T">
	import { tick, type Snippet } from 'svelte';
	import { mover } from '#lib/orden.ts';

	let {
		items,
		clave,
		nombre,
		eje = 'y',
		demora = 0,
		rol,
		etiqueta,
		onmover,
		fila
	}: {
		items: T[];
		clave: (item: T) => string;
		/** Para anunciar la nueva posición. */
		nombre: (item: T) => string;
		eje?: 'x' | 'y';
		/** ms apretando antes de arrastrar (las pestañas: el chip es la manija y un toque corto lo elige). */
		demora?: number;
		rol?: string;
		etiqueta?: string;
		/** Una sola llamada al soltar (una escritura). */
		onmover: (desde: number, hasta: number) => void;
		fila: Snippet<[item: T, manija: Manija]>;
	} = $props();

	// Orden local mientras se arrastra y hasta que vuelve el nuevo `items` de Firestore.
	let orden: T[] | null = $state(null);
	const vista = $derived(orden ?? items);
	$effect(() => {
		items;
		orden = null;
	});

	let contenedor: HTMLElement;
	let arrastrando: string | null = $state(null);
	let desplazamiento = $state(0);
	let anuncio = $state('');

	const horizontal = $derived(eje === 'x');
	const pos = (e: PointerEvent) => (horizontal ? e.clientX : e.clientY);
	const ranura = (k: string) => contenedor.querySelector<HTMLElement>(`[data-ranura="${CSS.escape(k)}"]`)!;
	const inicioDe = (el: HTMLElement) => (horizontal ? el.offsetLeft : el.offsetTop);
	const largoDe = (el: HTMLElement) => (horizontal ? el.offsetWidth : el.offsetHeight);

	let punteroInicial = 0;
	let ranuraInicial = 0;
	let desde = 0;

	// Con touch-action en la manija (o tras la demora) el navegador ya no hace scroll.
	const bloquearScroll = (e: TouchEvent) => e.preventDefault();

	function iniciar(e: PointerEvent, k: string) {
		if (e.button !== 0) return;
		const objetivo = e.currentTarget as HTMLElement;
		const x0 = e.clientX;
		const y0 = e.clientY;
		const id = e.pointerId;

		const arrancar = () => {
			desde = vista.findIndex((it) => clave(it) === k);
			orden = [...vista];
			arrastrando = k;
			desplazamiento = 0;
			punteroInicial = horizontal ? x0 : y0;
			ranuraInicial = inicioDe(ranura(k));
			try {
				objetivo.setPointerCapture(id);
			} catch {
				// El puntero ya se soltó.
			}
			window.addEventListener('touchmove', bloquearScroll, { passive: false });
		};

		let espera: ReturnType<typeof setTimeout> | undefined;
		if (demora) espera = setTimeout(arrancar, demora);
		else arrancar();

		const moverPuntero = (ev: PointerEvent) => {
			if (ev.pointerId !== id) return;
			if (!arrastrando) {
				// Se movió antes de la demora: es scroll o un toque, no arrastre.
				if (Math.hypot(ev.clientX - x0, ev.clientY - y0) > 8) terminar();
				return;
			}
			seguir(pos(ev));
		};

		const terminar = () => {
			clearTimeout(espera);
			window.removeEventListener('pointermove', moverPuntero);
			window.removeEventListener('pointerup', terminar);
			window.removeEventListener('pointercancel', terminar);
			window.removeEventListener('touchmove', bloquearScroll);
			if (!arrastrando) return;
			const hasta = vista.findIndex((it) => clave(it) === arrastrando);
			arrastrando = null;
			desplazamiento = 0;
			// El clic que sigue al soltar no debe elegir ni abrir nada.
			const tragar = (c: MouseEvent) => {
				c.stopPropagation();
				c.preventDefault();
			};
			window.addEventListener('click', tragar, { capture: true, once: true });
			// Si no hubo clic (p. ej. táctil), que no se trague el siguiente toque real.
			setTimeout(() => window.removeEventListener('click', tragar, true), 100);
			if (hasta !== desde) onmover(desde, hasta);
			else orden = null;
		};

		window.addEventListener('pointermove', moverPuntero);
		window.addEventListener('pointerup', terminar);
		window.addEventListener('pointercancel', terminar);
	}

	async function seguir(puntero: number) {
		const k = arrastrando!;
		const el = ranura(k);
		desplazamiento = puntero - punteroInicial - (inicioDe(el) - ranuraInicial);
		const i = vista.findIndex((it) => clave(it) === k);
		const centro = inicioDe(el) + desplazamiento + largoDe(el) / 2;
		const vecina = (j: number) => {
			const v = vista[j] && ranura(clave(vista[j]));
			return v ? inicioDe(v) + largoDe(v) / 2 : null;
		};
		// Se intercambia al cruzar la mitad de la vecina.
		const siguiente = vecina(i + 1);
		const anterior = vecina(i - 1);
		let j = i;
		if (siguiente !== null && centro > siguiente) j = i + 1;
		else if (anterior !== null && centro < anterior) j = i - 1;
		if (j === i) return;
		orden = mover(vista, i, j);
		await tick();
		desplazamiento = puntero - punteroInicial - (inicioDe(ranura(k)) - ranuraInicial);
	}

	async function teclado(e: KeyboardEvent, k: string) {
		const atras = horizontal ? 'ArrowLeft' : 'ArrowUp';
		const adelante = horizontal ? 'ArrowRight' : 'ArrowDown';
		if (e.key !== atras && e.key !== adelante) return;
		e.preventDefault();
		const i = vista.findIndex((it) => clave(it) === k);
		const j = e.key === atras ? i - 1 : i + 1;
		if (j < 0 || j >= vista.length) return;
		orden = mover(vista, i, j);
		onmover(i, j);
		anuncio = `${nombre(vista[j])}: posición ${j + 1} de ${vista.length}`;
		// Al mover el nodo el navegador le saca el foco: se lo devolvemos.
		await tick();
		contenedor.querySelector<HTMLElement>(`[data-manija="${CSS.escape(k)}"]`)?.focus();
	}
</script>

<div class="lista" class:horizontal bind:this={contenedor} role={rol} aria-label={etiqueta}>
	{#each vista as item (clave(item))}
		{@const k = clave(item)}
		<div class="ranura" class:hueco={arrastrando === k} data-ranura={k} role={rol ? 'presentation' : undefined}>
			<div
				class="contenido"
				class:elevado={arrastrando === k}
				style:transform={arrastrando === k
					? horizontal
						? `translateX(${desplazamiento}px)`
						: `translateY(${desplazamiento}px)`
					: undefined}
			>
				{@render fila(item, { onpointerdown: (e) => iniciar(e, k), onkeydown: (e) => teclado(e, k), 'data-manija': k })}
			</div>
		</div>
	{/each}
</div>
<p class="anuncio" aria-live="polite">{anuncio}</p>

<style>
	.lista {
		position: relative;
		display: grid;
		gap: var(--space-1);
	}
	.horizontal {
		display: flex;
		gap: var(--space-2);
	}
	.ranura {
		position: relative;
		border-radius: var(--radius);
	}
	.hueco {
		outline: 2px dashed var(--control);
		outline-offset: -2px;
	}
	.contenido {
		position: relative;
	}
	.elevado {
		z-index: 1;
		border-radius: var(--radius);
		background: var(--raised);
		/* Sobre el hueco, sin transición: sigue al dedo */
		box-shadow: var(--elevation-float);
	}
	.anuncio {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
</style>
