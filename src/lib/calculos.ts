// Funciones puras de la sesión: qué mostrar a partir de la rutina y las sesiones guardadas.
import type { Tipo } from './catalogo';
import type { Dia, Objetivo } from './rutina';

export type Bloque = { series: number; reps?: number; kg?: number; segundos?: number; minutos?: number };
export type Registro = { ejercicioId: string; bloques: Bloque[]; hecho: true; rpe?: number; nota?: string };
export type Sesion = {
	id: string;
	rutinaId: string;
	diaId: string;
	fecha: string; // AAAA-MM-DD local
	/** Milisegundos de `creada` (estimado si todavía no sincronizó). */
	creada: number;
	terminada: boolean;
	registros: Registro[];
};

/** Fecha local `AAAA-MM-DD` (no `toISOString()`: en UTC de noche ya es mañana). */
export function hoy(f = new Date()) {
	return `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, '0')}-${String(f.getDate()).padStart(2, '0')}`;
}

/** Copia ordenada de la más vieja a la más nueva. */
export function ordenar(sesiones: readonly Sesion[]) {
	return [...sesiones].sort((a, b) => a.fecha.localeCompare(b.fecha) || a.creada - b.creada);
}

export function sesionDeHoy(sesiones: readonly Sesion[], fecha = hoy()) {
	return sesiones.find((s) => s.fecha === fecha);
}

/** El día siguiente al de la última sesión anterior a `antesDe`; si no hay o ese día ya no existe, el primero. */
export function diaSugerido(rutina: { dias: Dia[] }, sesiones: readonly Sesion[], antesDe = hoy()): Dia | undefined {
	const ultima = ordenar(sesiones.filter((s) => s.fecha < antesDe)).at(-1);
	const i = ultima ? rutina.dias.findIndex((d) => d.id === ultima.diaId) : -1;
	if (i < 0) return rutina.dias[0];
	return rutina.dias[(i + 1) % rutina.dias.length];
}

/** Bloques de la última vez antes de `antesDe` en ese día (o en cualquier día, para extras). */
export function ultimaVez(
	sesiones: readonly Sesion[],
	diaId: string,
	ejercicioId: string,
	antesDe = hoy(),
	cualquierDia = false
): Bloque[] | undefined {
	const previas = ordenar(sesiones.filter((s) => s.fecha < antesDe && (cualquierDia || s.diaId === diaId)));
	for (let i = previas.length - 1; i >= 0; i--) {
		const r = previas[i].registros.find((r) => r.ejercicioId === ejercicioId);
		if (r) return r.bloques;
	}
	return undefined;
}

/** N-ésima vez que se hace ese día, contando la actual (si todavía no existe, la cantidad + 1). */
export function semana(sesiones: readonly Sesion[], diaId: string, sesion?: Sesion) {
	const delDia = ordenar(sesiones.filter((s) => s.diaId === diaId));
	const i = sesion ? delDia.findIndex((s) => s.id === sesion.id) : -1;
	return i < 0 ? delDia.length + 1 : i + 1;
}

/** Bloque inicial de la primera vez: series y reps/segundos/minutos del objetivo, sin kg. */
export function desdeObjetivo(tipo: Tipo, o: Objetivo = {}): Bloque {
	if (tipo === 'calentamiento') return { series: 1 };
	if (tipo === 'cardio') return { series: 1, minutos: o.minutos ?? 10 };
	const series = o.series ?? 3;
	if (tipo === 'tiempo') return { series, segundos: o.segundos ?? 30 };
	if (tipo === 'reps') return { series, reps: o.reps ?? 10 };
	return { series, reps: o.reps ?? 10, kg: 0 };
}

/** Reemplaza el bloque `i` de N series por N bloques de 1 serie con los mismos valores. */
export function desarmar(bloques: readonly Bloque[], i: number): Bloque[] {
	const b = bloques[i];
	if (!b) return [...bloques];
	const sueltas = Array.from({ length: b.series }, () => ({ ...b, series: 1 }));
	return [...bloques.slice(0, i), ...sueltas, ...bloques.slice(i + 1)];
}

/** Σ series × reps × kg de los registros de tipo peso. */
export function volumen(registros: readonly Registro[], tipoDe: (ejercicioId: string) => Tipo | undefined) {
	return registros
		.filter((r) => tipoDe(r.ejercicioId) === 'peso')
		.flatMap((r) => r.bloques)
		.reduce((t, b) => t + b.series * (b.reps ?? 0) * (b.kg ?? 0), 0);
}

const numero = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 });

/** `3×10 · 60 kg + 1×8 · 70 kg`, `3×12`, `3×40 s`, `15 min`, `Calentamiento`. */
export function formatear(tipo: Tipo, bloques: readonly Bloque[]) {
	if (tipo === 'calentamiento') return 'Calentamiento';
	return bloques
		.map((b) => {
			if (tipo === 'cardio') return `${numero.format(b.minutos ?? 0)} min`;
			if (tipo === 'tiempo') return `${b.series}×${b.segundos} s`;
			if (tipo === 'reps') return `${b.series}×${b.reps}`;
			return `${b.series}×${b.reps} · ${numero.format(b.kg ?? 0)} kg`;
		})
		.join(' + ');
}
