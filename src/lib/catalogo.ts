import { collection, deleteField, doc, onSnapshot, updateDoc, setDoc, type Unsubscribe } from 'firebase/firestore';
import { get, writable } from 'svelte/store';
import { sesion } from './acceso';
import { db } from './firebase';

export type Tipo = 'peso' | 'reps' | 'tiempo' | 'cardio' | 'calentamiento';

export const tipos: { valor: Tipo; etiqueta: string }[] = [
	{ valor: 'peso', etiqueta: 'Peso' },
	{ valor: 'reps', etiqueta: 'Reps' },
	{ valor: 'tiempo', etiqueta: 'Tiempo' },
	{ valor: 'cardio', etiqueta: 'Cardio' },
	{ valor: 'calentamiento', etiqueta: 'Calentamiento' }
];

export type DatosEjercicio = {
	nombre: string;
	tipo: Tipo;
	saltoKg: number;
	saltoReps: number;
	saltoSeg: number;
	notas: string;
	/** Segundos (15–300, de a 15) con los que abre el timer; ausente = sin descanso. */
	descanso?: number;
};
export type Ejercicio = DatosEjercicio & { id: string };

/** `null` mientras llega la primera lectura. */
export const ejercicios = writable<Ejercicio[] | null>(null);

function coleccion() {
	const s = get(sesion);
	if (s.estado !== 'con-sesion') throw new Error('Sin sesión');
	return collection(db, 'users', s.usuario.uid, 'ejercicios');
}

// La suscripción vive mientras haya sesión.
let desuscribir: Unsubscribe | undefined;
sesion.subscribe((s) => {
	desuscribir?.();
	desuscribir = undefined;
	ejercicios.set(null);
	if (s.estado !== 'con-sesion') return;
	desuscribir = onSnapshot(coleccion(), (snap) => {
		const lista = snap.docs.map((d) => ({ id: d.id, ...(d.data() as DatosEjercicio) }));
		lista.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
		ejercicios.set(lista);
	});
});

const formatoKg = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 });

/** "Peso · 2,5 kg · ±1 rep", "Tiempo · ±5 s", "Cardio". */
export function describir(e: DatosEjercicio): string {
	const tipo = tipos.find((t) => t.valor === e.tipo)?.etiqueta ?? e.tipo;
	const reps = `±${e.saltoReps} rep${e.saltoReps === 1 ? '' : 's'}`;
	if (e.tipo === 'peso') return `${tipo} · ${formatoKg.format(e.saltoKg)} kg · ${reps}`;
	if (e.tipo === 'reps') return `${tipo} · ${reps}`;
	if (e.tipo === 'tiempo') return `${tipo} · ±${e.saltoSeg} s`;
	return tipo;
}

/** Crea con los saltos por defecto y devuelve el id al instante (sin señal, la escritura queda pendiente). */
export function crearEjercicio(nombre: string, tipo: Tipo, datos: Partial<DatosEjercicio> = {}) {
	const nuevo: DatosEjercicio = { nombre: nombre.trim(), tipo, saltoKg: 2.5, saltoReps: 1, saltoSeg: 5, notas: '', ...datos };
	const ref = doc(coleccion());
	setDoc(ref, nuevo).catch(console.error);
	return ref.id;
}

export function guardarEjercicio(id: string, datos: DatosEjercicio) {
	// Sin descanso se borra la clave (Firestore no acepta `undefined`).
	return updateDoc(doc(coleccion(), id), { ...datos, nombre: datos.nombre.trim(), descanso: datos.descanso ?? deleteField() });
}

export function porId(id: string): Ejercicio | undefined {
	return get(ejercicios)?.find((e) => e.id === id);
}
