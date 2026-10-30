<script lang="ts">
	import { app } from '#config/app';
	import { entrar, sesion } from '#lib/acceso.ts';
	import Boton from '#lib/componentes/Boton.svelte';
	import BarraAccion from '#lib/componentes/BarraAccion.svelte';
	import icono from '../../../design/icon/icon-192.png?no-inline';

	let mensaje = $derived($sesion.estado === 'sin-sesion' ? $sesion.mensaje : undefined);
</script>

<main class="pantalla">
	<img src={icono} alt="" width="96" height="96" />
	<h1>{app.nombre}</h1>
	{#if mensaje}<p role="alert">{mensaje}</p>{/if}
</main>
<BarraAccion><Boton onclick={entrar}>Entrar con Google</Boton></BarraAccion>

<style>
	main {
		gap: var(--space-4);
		padding-top: var(--space-8);
	}
	img {
		border-radius: var(--radius);
	}
	h1 {
		margin: 0;
		font: 700 var(--fs-title) / var(--lh-title) var(--font-display);
		font-stretch: var(--stretch-condensed);
	}
	p {
		margin: 0;
		font: 400 var(--fs-body) / var(--lh-body) var(--font-text);
	}
</style>
