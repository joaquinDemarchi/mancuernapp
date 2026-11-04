import { collection, doc, serverTimestamp, writeBatch, type WriteBatch } from 'firebase/firestore';
import { get, writable } from 'svelte/store';
import { sesion } from './acceso';
import type { Escrituras } from './csv';
import { db } from './firebase';

/** Texto de confirmación que el inicio muestra unos segundos al volver de importar. */
export const ultimoImport = writable<string | undefined>();

/**
 * Escribe el import en lotes de hasta 450 operaciones (el límite de Firestore es 500).
 * Sin `await`: sin señal la promesa no resuelve hasta sincronizar; los stores se actualizan
 * igual desde la caché local.
 */
export function guardarImport(e: Escrituras) {
	const s = get(sesion);
	if (s.estado !== 'con-sesion') throw new Error('Sin sesión');
	const ref = (coleccion: string, id: string) => doc(collection(db, 'users', s.usuario.uid, coleccion), id);

	// La activa se archiva primero: así nunca quedan dos activas.
	const operaciones: ((b: WriteBatch) => void)[] = [];
	const archivar = e.archivar;
	if (archivar) operaciones.push((b) => b.update(ref('rutinas', archivar.id), { estado: 'archivada', fin: archivar.fin }));
	for (const { id, ...datos } of e.ejercicios) operaciones.push((b) => b.set(ref('ejercicios', id), datos));
	for (const { id, ...datos } of e.rutinas) operaciones.push((b) => b.set(ref('rutinas', id), datos));
	for (const { id, ...datos } of e.sesiones) operaciones.push((b) => b.set(ref('sesiones', id), { ...datos, creada: serverTimestamp() }));

	for (let i = 0; i < operaciones.length; i += 450) {
		const lote = writeBatch(db);
		for (const op of operaciones.slice(i, i + 450)) op(lote);
		lote.commit().catch(console.error);
	}
}
