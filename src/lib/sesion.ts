import { collection, deleteDoc, doc, onSnapshot, query, serverTimestamp, setDoc, updateDoc, where, type Unsubscribe } from 'firebase/firestore';
import { get, writable } from 'svelte/store';
import { sesion } from './acceso';
import { ordenar, sesionDeHoy, type Registro, type Sesion } from './calculos';
import { db } from './firebase';
import { rutinaActiva } from './rutina';

export type { Bloque, Registro, Sesion } from './calculos';
/** Con qué rutina y día se crea la sesión en el primer toque. */
export type Contexto = { rutinaId: string; diaId: string; fecha: string };

/** Sesiones de la rutina activa, de la más vieja a la más nueva; `undefined` mientras carga. */
export const sesiones = writable<Sesion[] | undefined>(undefined);

function coleccion() {
	const s = get(sesion);
	if (s.estado !== 'con-sesion') throw new Error('Sin sesión');
	return collection(db, 'users', s.usuario.uid, 'sesiones');
}

// Una suscripción por rutina: se rehace solo si cambia el id (no en cada edición de la rutina).
let desuscribir: Unsubscribe | undefined;
let rutinaId: string | undefined;
rutinaActiva.subscribe((r) => {
	if (r?.id === rutinaId) return;
	desuscribir?.();
	desuscribir = undefined;
	rutinaId = r?.id;
	sesiones.set(undefined);
	if (!rutinaId) return;
	desuscribir = onSnapshot(query(coleccion(), where('rutinaId', '==', rutinaId)), (snap) => {
		const lista = snap.docs.map((d) => {
			// 'estimate': las creadas sin señal todavía no tienen la hora del servidor.
			const datos = d.data({ serverTimestamps: 'estimate' });
			return { ...datos, id: d.id, creada: datos.creada?.toMillis() ?? Date.now() } as Sesion;
		});
		sesiones.set(ordenar(lista));
	});
});

// Firestore no acepta `undefined` (rpe o nota vacíos): se limpian con JSON.
const limpio = (registros: Registro[]): Registro[] => JSON.parse(JSON.stringify(registros));

/**
 * Escribe los registros de la sesión de esa fecha (hoy o un día anterior); si todavía no existe, la crea.
 * Actualiza el store al instante para que dos toques seguidos vean la misma sesión.
 * Sin `await`: sin señal la promesa no resuelve hasta sincronizar.
 */
function escribir(ctx: Contexto, cambio: (registros: Registro[]) => Registro[]) {
	const lista = get(sesiones) ?? [];
	const actual = sesionDeHoy(lista, ctx.fecha);
	if (actual) {
		const registros = limpio(cambio(actual.registros));
		// Sin ejercicios no queda sesión (destildar el único = no haber empezado).
		if (!registros.length) return borrarSesion(actual.id);
		sesiones.set(lista.map((s) => (s.id === actual.id ? { ...s, registros } : s)));
		updateDoc(doc(coleccion(), actual.id), { registros }).catch(console.error);
		return;
	}
	const registros = limpio(cambio([]));
	if (!registros.length) return;
	const ref = doc(coleccion());
	const nueva = { rutinaId: ctx.rutinaId, diaId: ctx.diaId, fecha: ctx.fecha, terminada: false, registros };
	sesiones.set(ordenar([...lista, { ...nueva, id: ref.id, creada: Date.now() }]));
	setDoc(ref, { ...nueva, creada: serverTimestamp() }).catch(console.error);
}

/** Guarda (o reemplaza) el registro de ese ejercicio; los nuevos van al final. */
export function guardarRegistro(ctx: Contexto, registro: Registro) {
	escribir(ctx, (rs) =>
		rs.some((r) => r.ejercicioId === registro.ejercicioId)
			? rs.map((r) => (r.ejercicioId === registro.ejercicioId ? registro : r))
			: [...rs, registro]
	);
}

export function quitarRegistro(ctx: Contexto, ejercicioId: string) {
	escribir(ctx, (rs) => rs.filter((r) => r.ejercicioId !== ejercicioId));
}

export function terminar(id: string) {
	updateDoc(doc(coleccion(), id), { terminada: true }).catch(console.error);
}

export function borrarSesion(id: string) {
	sesiones.update((l) => l?.filter((s) => s.id !== id));
	deleteDoc(doc(coleccion(), id)).catch(console.error);
}
