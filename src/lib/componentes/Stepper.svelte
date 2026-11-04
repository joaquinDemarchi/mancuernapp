<script lang="ts">
	let {
		valor = $bindable(),
		paso = 1,
		min = 0,
		max = Infinity,
		decimales = 0,
		etiqueta,
		detalle,
		formatear,
		sinEtiqueta = false,
		oncambio
	}: {
		/** `null` = vacío: muestra "–" hasta el primer toque. */
		valor: number | null;
		paso?: number;
		min?: number;
		max?: number;
		decimales?: number;
		etiqueta: string;
		/** Texto chico a la derecha de la etiqueta (p. ej. el salto "±2,5"). */
		detalle?: string;
		/** Texto del valor (p. ej. M:SS); por defecto, número con `decimales`. Se puede escribir "1:15". */
		formatear?: (valor: number) => string;
		/** La etiqueta queda solo para el lector de pantalla. */
		sinEtiqueta?: boolean;
		oncambio?: (valor: number) => void;
	} = $props();

	const id = $props.id();
	const formato = $derived(new Intl.NumberFormat('es-AR', { maximumFractionDigits: decimales }));
	const texto = $derived(valor === null ? '–' : (formatear ?? formato.format)(valor));

	function fijar(nuevo: number) {
		const acotado = Math.min(max, Math.max(min, Number(nuevo.toFixed(decimales))));
		if (acotado === valor) return;
		valor = acotado;
		oncambio?.(acotado);
	}

	// Desde vacío, el primer toque arranca en el mínimo.
	const bajar = () => fijar(valor === null ? min : valor - paso);
	const subir = () => fijar(valor === null ? min : valor + paso);

	function escribir(e: Event & { currentTarget: HTMLInputElement }) {
		const t = e.currentTarget.value.replace(',', '.').trim();
		const mss = t.match(/^(\d+):(\d{1,2})$/);
		const n = mss ? Number(mss[1]) * 60 + Number(mss[2]) : Number(t);
		if (e.currentTarget.value.trim() !== '' && Number.isFinite(n)) fijar(n);
		// Si no se pudo leer o quedó igual, vuelve a mostrar el valor vigente.
		e.currentTarget.value = texto;
	}
</script>

<div class="stepper">
	<div class="etiquetas" class:oculta={sinEtiqueta}>
		<label for={id}>{etiqueta}</label>
		{#if detalle}<span>{detalle}</span>{/if}
	</div>
	<div class="fila">
		<button type="button" aria-label="Bajar {etiqueta}" disabled={valor !== null && valor <= min} onclick={bajar}
			>−</button
		>
		<input
			{id}
			type="text"
			inputmode={decimales > 0 ? 'decimal' : 'numeric'}
			value={texto}
			onfocus={(e) => e.currentTarget.select()}
			onchange={escribir}
		/>
		<button type="button" aria-label="Subir {etiqueta}" disabled={valor !== null && valor >= max} onclick={subir}
			>+</button
		>
	</div>
</div>

<style>
	.stepper {
		display: grid;
		gap: var(--space-1);
	}
	.etiquetas {
		display: flex;
		justify-content: space-between;
	}
	.oculta {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
	span {
		color: var(--ink-faint);
		font: 400 var(--fs-meta) / var(--lh-meta) var(--font-text);
	}
	label {
		color: var(--ink-muted);
		font: 400 var(--fs-meta) / var(--lh-meta) var(--font-text);
	}
	.fila {
		display: grid;
		grid-template-columns: var(--touch-primary) 1fr var(--touch-primary);
		gap: var(--space-1);
	}
	button {
		min-height: var(--touch-primary);
		border: 0;
		border-radius: var(--radius);
		background: var(--raised);
		color: var(--ink);
		font: 600 28px/1 var(--font-text);
		cursor: pointer;
	}
	button:active:not(:disabled) {
		background: var(--control);
	}
	button:disabled {
		color: var(--ink-faint);
		opacity: 0.5;
		cursor: not-allowed;
	}
	input {
		width: 100%;
		min-width: 0;
		min-height: var(--touch-primary);
		border: 0;
		border-radius: var(--radius);
		background: var(--surface);
		color: var(--ink);
		text-align: center;
		font: 700 40px/1 var(--font-display);
		font-stretch: var(--stretch-condensed);
		font-variant-numeric: tabular-nums;
	}
	button:focus-visible,
	input:focus-visible {
		outline: 2px solid var(--focus);
		outline-offset: 2px;
	}
</style>
