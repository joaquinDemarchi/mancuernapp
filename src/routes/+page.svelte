<script lang="ts">
	// Página mínima para probar el acceso (tarea 3.3); la reemplaza la 4.2.
	import { entrar, salir, sesion } from '#lib/acceso.ts';
	import Boton from '#lib/componentes/Boton.svelte';
	import BarraAccion from '#lib/componentes/BarraAccion.svelte';
</script>

{#if $sesion.estado === 'sin-sesion'}
	{#if $sesion.mensaje}<p>{$sesion.mensaje}</p>{/if}
	<BarraAccion><Boton onclick={entrar}>Entrar con Google</Boton></BarraAccion>
{:else if $sesion.estado === 'con-sesion'}
	<p>{$sesion.usuario.email}</p>
	<BarraAccion><Boton variante="secundario" onclick={salir}>Cerrar sesión</Boton></BarraAccion>
{/if}
