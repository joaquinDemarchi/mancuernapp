<script lang="ts" generics="T extends string">
	let {
		valor = $bindable(),
		opciones,
		leyenda
	}: {
		valor: T;
		opciones: { valor: T; etiqueta: string }[];
		leyenda: string;
	} = $props();

	// Nombre del grupo de radios: las flechas recorren las opciones (comportamiento nativo).
	const nombre = $props.id();
</script>

<fieldset>
	<legend>{leyenda}</legend>
	<div>
		{#each opciones as opcion (opcion.valor)}
			<label>
				<input type="radio" name={nombre} value={opcion.valor} bind:group={valor} />
				<span>{opcion.etiqueta}</span>
			</label>
		{/each}
	</div>
</fieldset>

<style>
	fieldset {
		min-width: 0;
		margin: 0;
		padding: 0;
		border: 0;
	}
	legend {
		margin-bottom: var(--space-1);
		padding: 0;
		color: var(--ink-muted);
		font: 400 var(--fs-meta) / var(--lh-meta) var(--font-text);
	}
	div {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}
	label {
		position: relative;
	}
	input {
		position: absolute;
		inset: 0;
		margin: 0;
		opacity: 0;
	}
	span {
		display: flex;
		align-items: center;
		min-height: var(--touch-min);
		padding: 0 var(--space-4);
		border-radius: var(--radius);
		background: var(--raised);
		color: var(--ink);
		font: 600 var(--fs-body) / var(--lh-body) var(--font-text);
		cursor: pointer;
	}
	input:checked + span {
		background: var(--accent);
		color: var(--on-accent);
	}
	input:focus-visible + span {
		outline: 2px solid var(--focus);
		outline-offset: 2px;
	}
</style>
