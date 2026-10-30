<script lang="ts">
	import { app } from '#config/app';
	import { entrar, salir, sesion } from '#lib/acceso.ts';
	import Boton from '#lib/componentes/Boton.svelte';
	import BarraAccion from '#lib/componentes/BarraAccion.svelte';
	import icono from '../../design/icon/icon-192.png?no-inline';
</script>

<!-- Mientras carga solo se ve el fondo, así no parpadea el login. -->
{#if $sesion.estado === 'sin-sesion'}
	<main>
		<img src={icono} alt="" width="96" height="96" />
		<h1>{app.nombre}</h1>
		{#if $sesion.mensaje}<p role="alert">{$sesion.mensaje}</p>{/if}
	</main>
	<BarraAccion><Boton onclick={entrar}>Entrar con Google</Boton></BarraAccion>
{:else if $sesion.estado === 'con-sesion'}
	<main>
		<h1>{app.nombre}</h1>
		<p class="vacio">Todavía no hay rutina</p>
	</main>
	<BarraAccion><Boton variante="secundario" onclick={salir}>Cerrar sesión</Boton></BarraAccion>
{/if}

<style>
	main {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		min-height: 100dvh;
		box-sizing: border-box;
		/* Abajo deja lugar a la BarraAccion: botón + paddings + inset seguro */
		padding: var(--space-8) var(--space-4)
			calc(var(--touch-primary) + var(--space-3) * 2 + var(--space-4) + env(safe-area-inset-bottom, 0px));
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
	.vacio {
		margin: auto 0;
		text-align: center;
		color: var(--ink-muted);
	}
</style>
