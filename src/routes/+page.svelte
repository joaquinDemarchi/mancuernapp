<script lang="ts">
	// Página mínima para probar el acceso (tarea 3.3); la reemplaza la 4.2.
	import { entrar, salir, sesion } from '#lib/acceso.ts';
</script>

{#if $sesion.estado === 'sin-sesion'}
	{#if $sesion.mensaje}<p>{$sesion.mensaje}</p>{/if}
	<button onclick={entrar}>Entrar con Google</button>
{:else if $sesion.estado === 'con-sesion'}
	<p>{$sesion.usuario.email}</p>
	<button onclick={salir}>Cerrar sesión</button>
{/if}
