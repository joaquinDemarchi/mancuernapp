import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { writable } from 'svelte/store';
import { app } from '#config/app';
import { auth, db } from './firebase';

export type Sesion =
	| { estado: 'cargando' }
	| { estado: 'sin-sesion'; mensaje?: string }
	| { estado: 'con-sesion'; usuario: User };

export const sesion = writable<Sesion>({ estado: 'cargando' });

// Se completa al rechazar una cuenta, para mostrarlo cuando onAuthStateChanged informe el cierre.
let mensajePendiente: string | undefined;

export function emailPermitido(email: string | null): boolean {
	return !!email && app.listaBlanca.includes(email.toLowerCase());
}

// Crea users/{uid} solo la primera vez; los ingresos siguientes no lo pisan.
// No se espera: sin señal no debe bloquear la entrada.
export function asegurarUsuario(usuario: User) {
	const ref = doc(db, 'users', usuario.uid);
	getDoc(ref)
		.then((d) => {
			if (d.exists()) return;
			return setDoc(ref, {
				email: usuario.email,
				nombre: usuario.displayName ?? '',
				rol: 'usuario',
				ajustes: {}
			});
		})
		.catch(console.error);
}

// Popup y no redirect: el redirect falla con cookies de terceros bloqueadas.
export async function entrar() {
	try {
		await signInWithPopup(auth, new GoogleAuthProvider());
	} catch {
		// Popup cerrado o bloqueado: se queda en el login sin mensaje.
		sesion.set({ estado: 'sin-sesion' });
	}
}

export function salir() {
	return signOut(auth);
}

onAuthStateChanged(auth, async (usuario) => {
	if (!usuario) {
		sesion.set({ estado: 'sin-sesion', mensaje: mensajePendiente });
		mensajePendiente = undefined;
		return;
	}
	if (!emailPermitido(usuario.email)) {
		mensajePendiente = 'Esta cuenta no tiene acceso';
		await salir();
		return;
	}
	asegurarUsuario(usuario);
	sesion.set({ estado: 'con-sesion', usuario });
});
