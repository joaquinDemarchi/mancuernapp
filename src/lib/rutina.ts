import { addDoc, collection, deleteField, doc, onSnapshot, setDoc, updateDoc, writeBatch, type Unsubscribe } from 'firebase/firestore';
import { derived, get, writable } from 'svelte/store';
import { sesion } from './acceso';
import { copiarDias } from './calculos';
import { db } from './firebase';
import { mover } from './orden';

/** Misma forma que un bloque de sesión, sin kg. */
export type Objetivo = { series?: number; reps?: number; segundos?: number; minutos?: number };
export type Item = { ejercicioId: string; objetivo?: Objetivo };
export type Dia = { id: string; nombre: string; items: Item[] };
export type Rutina = {
	id: string;
	nombre: string;
	inicio: string; // AAAA-MM-DD
	fin?: string; // AAAA-MM-DD, al archivarla
	estado: 'activa' | 'archivada';
	dias: Dia[];
};

/** Todas las rutinas del usuario, ordenadas por inicio; `undefined` mientras llega la primera lectura. */
export const rutinas = writable<Rutina[] | undefined>(undefined);

/** `undefined` mientras llega la primera lectura; `null` si no hay rutina activa. */
export const rutinaActiva = derived(rutinas, (rs) => (rs ? (rs.find((r) => r.estado === 'activa') ?? null) : undefined));

function coleccion() {
	const s = get(sesion);
	if (s.estado !== 'con-sesion') throw new Error('Sin sesión');
	return collection(db, 'users', s.usuario.uid, 'rutinas');
}

// La suscripción vive mientras haya sesión.
let desuscribir: Unsubscribe | undefined;
sesion.subscribe((s) => {
	desuscribir?.();
	desuscribir = undefined;
	rutinas.set(undefined);
	if (s.estado !== 'con-sesion') return;
	desuscribir = onSnapshot(coleccion(), (snap) => {
		const rs = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Rutina);
		rutinas.set(rs.sort((a, b) => a.inicio.localeCompare(b.inicio)));
	});
});

function hoy() {
	const f = new Date();
	return `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, '0')}-${String(f.getDate()).padStart(2, '0')}`;
}

/** "2026-10-30" → "30/10/2026" */
export function fechaCorta(iso: string) {
	return iso.split('-').reverse().join('/');
}

export async function crearRutina() {
	const nueva: Omit<Rutina, 'id'> = {
		nombre: 'Rutina 1',
		inicio: hoy(),
		estado: 'activa',
		dias: [{ id: crypto.randomUUID(), nombre: 'Día 1', items: [] }]
	};
	return (await addDoc(coleccion(), nueva)).id;
}

/** Archiva la activa con fin hoy (sin esperar respuesta: anda offline). */
export function terminarRutina() {
	return updateDoc(doc(coleccion(), actual().id), { estado: 'archivada', fin: hoy() });
}

/** Crea "Rutina N+1" activa copiando los días de la última archivada y devuelve su id. */
export function nuevaRutina() {
	const rs = get(rutinas) ?? [];
	const ultima = rs.filter((r) => r.fin).sort((a, b) => a.fin!.localeCompare(b.fin!)).at(-1);
	const ref = doc(coleccion());
	const nueva: Omit<Rutina, 'id'> = {
		nombre: `Rutina ${rs.length + 1}`,
		inicio: hoy(),
		estado: 'activa',
		dias: ultima ? copiarDias(ultima.dias) : [{ id: crypto.randomUUID(), nombre: 'Día 1', items: [] }]
	};
	setDoc(ref, nueva);
	return ref.id;
}

/** La elegida vuelve a ser la activa y la activa (si hay) se archiva, en un solo batch: nunca quedan dos activas. */
export function volverARutina(id: string) {
	const batch = writeBatch(db);
	const activa = get(rutinaActiva);
	if (activa) batch.update(doc(coleccion(), activa.id), { estado: 'archivada', fin: hoy() });
	batch.update(doc(coleccion(), id), { estado: 'activa', fin: deleteField() });
	return batch.commit();
}

function actual(): Rutina {
	const r = get(rutinaActiva);
	if (!r) throw new Error('No hay rutina activa');
	return r;
}

// Guardado instantáneo: cada operación reescribe el array completo (un solo usuario, sin conflictos).
function guardarDias(dias: Dia[]) {
	return updateDoc(doc(coleccion(), actual().id), { dias });
}

function cambiarDia(diaId: string, cambio: (d: Dia) => Dia) {
	return guardarDias(actual().dias.map((d) => (d.id === diaId ? cambio(d) : d)));
}

export function renombrarRutina(nombre: string) {
	return updateDoc(doc(coleccion(), actual().id), { nombre: nombre.trim() });
}

/** Agrega "Día N" al final y devuelve su id. */
export function agregarDia() {
	const dias = actual().dias;
	const id = crypto.randomUUID();
	guardarDias([...dias, { id, nombre: `Día ${dias.length + 1}`, items: [] }]);
	return id;
}

export function renombrarDia(diaId: string, nombre: string) {
	return cambiarDia(diaId, (d) => ({ ...d, nombre: nombre.trim() }));
}

export function borrarDia(diaId: string) {
	return guardarDias(actual().dias.filter((d) => d.id !== diaId));
}

export function moverDia(desde: number, hasta: number) {
	return guardarDias(mover(actual().dias, desde, hasta));
}

export function agregarItem(diaId: string, ejercicioId: string) {
	return cambiarDia(diaId, (d) => ({ ...d, items: [...d.items, { ejercicioId }] }));
}

export function quitarItem(diaId: string, indice: number) {
	return cambiarDia(diaId, (d) => ({ ...d, items: d.items.filter((_, i) => i !== indice) }));
}

export function moverItem(diaId: string, desde: number, hasta: number) {
	return cambiarDia(diaId, (d) => ({ ...d, items: mover(d.items, desde, hasta) }));
}

/** Sin objetivo (o vacío) se borra la clave: Firestore no acepta `undefined`. */
export function fijarObjetivo(diaId: string, indice: number, objetivo?: Objetivo) {
	return cambiarDia(diaId, (d) => ({
		...d,
		items: d.items.map((it, i) => {
			if (i !== indice) return it;
			const { objetivo: _, ...resto } = it;
			return objetivo && Object.keys(objetivo).length ? { ...resto, objetivo } : resto;
		})
	}));
}

/** "4×10", "3×40 s", "15 min"; vacío sin objetivo. */
export function formatearObjetivo(o?: Objetivo): string {
	if (!o) return '';
	if (o.minutos) return `${o.minutos} min`;
	if (o.series && o.segundos) return `${o.series}×${o.segundos} s`;
	if (o.series && o.reps) return `${o.series}×${o.reps}`;
	return '';
}
