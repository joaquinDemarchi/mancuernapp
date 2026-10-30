<script lang="ts">
	import { goto } from '$app/navigation';
	import { app } from '#config/app';
	import { salir } from '#lib/acceso.ts';
	import Boton from '#lib/componentes/Boton.svelte';
	import BarraAccion from '#lib/componentes/BarraAccion.svelte';
	import Cabecera from '#lib/componentes/Cabecera.svelte';
</script>

<main class="pantalla">
	<Cabecera titulo={app.nombre}>
		{#snippet accion()}<button class="texto" onclick={salir}>Salir</button>{/snippet}
	</Cabecera>
	<div class="vacio">
		<p class="titulo">Todavía no hay rutina</p>
		<p>Armá los días con ejercicios de tu catálogo.</p>
	</div>
</main>
<BarraAccion>
	<Boton variante="secundario" onclick={() => goto('/ejercicios')}>Ejercicios</Boton>
	<!-- Sin acción hasta la tarea 4.1 -->
	<Boton>Crear rutina</Boton>
</BarraAccion>

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
		font: 600 var(--fs-heading) / var(--lh-heading) var(--font-display);
		color: var(--ink);
	}
</style>
