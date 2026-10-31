// Prototipo descartable (prototipo-flujo-carga): datos falsos en memoria, se borra con el MVP 2.
import type { Tipo } from '#lib/catalogo.ts';

export type Bloque = { series: number; reps?: number; kg?: number; segundos?: number; minutos?: number };
export type EjercicioP = {
	id: string;
	nombre: string;
	tipo: Tipo;
	saltoKg: number;
	saltoReps: number;
	saltoSeg: number;
	/** Lo que se hizo la última vez que tocó este día. */
	ultima: Bloque[];
};
export type DiaP = { id: string; nombre: string; ejercicios: EjercicioP[] };

function ej(id: string, nombre: string, tipo: Tipo, ultima: Bloque[], saltoKg = 2.5): EjercicioP {
	return { id, nombre, tipo, saltoKg, saltoReps: 1, saltoSeg: 5, ultima };
}

export const dias: DiaP[] = [
	{
		id: 'd1',
		nombre: 'Día 1',
		ejercicios: [
			ej('d1-cal', 'Bici', 'calentamiento', [{ series: 1 }]),
			ej('d1-pm', 'Peso muerto rumano', 'peso', [{ series: 4, reps: 10, kg: 50 }]),
			ej('d1-hip', 'Hip thrust', 'peso', [{ series: 3, reps: 12, kg: 70 }]),
			ej('d1-cam', 'Camilla isquio', 'peso', [{ series: 3, reps: 12, kg: 25 }])
		]
	},
	{
		id: 'd2',
		nombre: 'Día 2',
		ejercicios: [
			ej('d2-mov', 'Movilidad de hombros', 'calentamiento', [{ series: 1 }]),
			ej('d2-sen', 'Sentadilla', 'peso', [
				{ series: 1, reps: 12, kg: 40 },
				{ series: 3, reps: 8, kg: 60 }
			]),
			ej('d2-pb', 'Press banca', 'peso', [{ series: 4, reps: 10, kg: 40 }]),
			ej('d2-remo', 'Remo con mancuerna', 'peso', [{ series: 3, reps: 12, kg: 14 }], 1),
			ej('d2-fon', 'Fondos', 'reps', [{ series: 3, reps: 12 }]),
			ej('d2-pla', 'Plancha', 'tiempo', [{ series: 3, segundos: 40 }]),
			ej('d2-cin', 'Cinta', 'cardio', [{ series: 1, minutos: 15 }])
		]
	},
	{
		id: 'd3',
		nombre: 'Día 3',
		ejercicios: [
			ej('d3-cal', 'Soga', 'calentamiento', [{ series: 1 }]),
			ej('d3-mil', 'Press militar', 'peso', [{ series: 4, reps: 8, kg: 30 }]),
			ej('d3-lat', 'Vuelos laterales', 'peso', [{ series: 3, reps: 15, kg: 6 }], 1),
			ej('d3-bic', 'Curl bíceps con banda', 'reps', [{ series: 3, reps: 15 }])
		]
	}
];

/** La última sesión fue el Día 1, así que la rotación sugiere el Día 2. */
export const diaSugerido = 'd2';

const UMBRAL_OPTIMO = 10;

export const volumen = (bloques: Bloque[]) => bloques.reduce((t, b) => t + b.series * (b.reps ?? 0) * (b.kg ?? 0), 0);

export function indicador(pct: number) {
	if (pct < 0) return { clase: 'bajo', texto: 'Bajo' };
	if (pct <= UMBRAL_OPTIMO) return { clase: 'optimo', texto: 'Óptimo' };
	return { clase: 'alto', texto: 'Alto' };
}

const numero = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 });
export const n = (x: number) => numero.format(x);

export function formatear(tipo: Tipo, bloques: Bloque[]) {
	if (tipo === 'calentamiento') return 'Calentamiento';
	return bloques
		.map((b) => {
			if (tipo === 'cardio') return `${n(b.minutos ?? 0)} min`;
			if (tipo === 'tiempo') return `${b.series}×${b.segundos} s`;
			if (tipo === 'reps') return `${b.series}×${b.reps}`;
			return `${b.series}×${b.reps} · ${n(b.kg ?? 0)} kg`;
		})
		.join(' + ');
}
