<script lang="ts">
	import { hoy } from '#lib/calculos.ts';
	import { ejercicios } from '#lib/catalogo.ts';
	import { escribirCsv, plantillaCsv } from '#lib/csv.ts';
	import { rutinas } from '#lib/rutina.ts';
	import { sesiones } from '#lib/sesion.ts';
	import Cabecera from '#lib/componentes/Cabecera.svelte';

	const cantidad = (n: number, uno: string, varios: string) => `${n} ${n === 1 ? uno : varios}`;

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
</script>

<main class="pantalla">
	<Cabecera titulo="Importar y exportar" volver="/" />

	<section>
		<h2>Sacar tus datos</h2>
		<button type="button" class="dato" disabled={!$ejercicios || !$rutinas || !$sesiones} onclick={exportar}>
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
		<h2>Traer rutinas y sesiones</h2>
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
</main>

<style>
	section {
		display: grid;
		gap: var(--space-2);
		margin-bottom: var(--space-4);
	}
	h2 {
		margin: 0;
		color: var(--ink-muted);
		font: 600 var(--fs-meta) / var(--lh-meta) var(--font-text);
	}
	.dato {
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
	.dato:disabled {
		cursor: default;
		opacity: 0.6;
	}
	.dato:focus-visible {
		outline: 2px solid var(--focus);
		outline-offset: 2px;
	}
	.dato svg {
		flex: none;
		color: var(--ink-faint);
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
</style>
