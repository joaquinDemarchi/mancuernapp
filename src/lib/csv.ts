// CSV propio de import/export (design.md §4): funciones puras, la UI solo muestra el plan y lo escribe.
import type { Bloque, Sesion } from './calculos';
import type { Ejercicio, Tipo } from './catalogo';
import type { Objetivo, Rutina } from './rutina';
import { esDuplicado, normalizar, parecidos } from './texto';

export const columnas = ['Rutina', 'Día', 'Ejercicio', 'Tipo', 'Series', 'Reps', 'Kg', 'Segundos', 'Minutos', 'Fecha', 'Descanso'];
const tiposValidos: Tipo[] = ['peso', 'reps', 'tiempo', 'cardio', 'calentamiento'];
const numericas = ['series', 'reps', 'kg', 'segundos', 'minutos'] as const;

export type Fila = { linea: number; celdas: string[] };
export type ErrorFila = { linea: number; mensaje: string };
export type FilaValida = {
	linea: number;
	rutina: string;
	dia: string;
	ejercicio: string;
	tipo: Tipo;
	series?: number;
	reps?: number;
	kg?: number;
	segundos?: number;
	minutos?: number;
	fecha?: string; // AAAA-MM-DD
	descanso?: number; // segundos
};

/**
 * Saca el BOM y separa por `;` o `,` (el que tenga el encabezado) respetando comillas; cada fila con la línea donde empieza.
 * Saltea filas vacías y comentarios (primera celda que empieza con `#`).
 */
export function leerCsv(texto: string): Fila[] {
	const filas: Fila[] = [];
	let celdas: string[] = [];
	let celda = '';
	let comillas = false;
	let linea = 1;
	let inicio = 1;
	const t = texto.replace(/^﻿/, '');
	const primera = t.split('\n').find((l) => l.trim() && !/^"?#/.test(l.trim())) ?? '';
	const separador = !primera.includes(';') && primera.includes(',') ? ',' : ';';
	const cerrarFila = () => {
		celdas.push(celda);
		if (celdas.some((c) => c.trim()) && !celdas[0].trim().startsWith('#')) filas.push({ linea: inicio, celdas });
		celdas = [];
		celda = '';
	};
	for (let i = 0; i < t.length; i++) {
		const c = t[i];
		if (comillas) {
			if (c === '"' && t[i + 1] === '"') {
				celda += '"';
				i++;
			} else if (c === '"') comillas = false;
			else {
				if (c === '\n') linea++;
				celda += c;
			}
		} else if (c === '"') comillas = true;
		else if (c === separador) {
			celdas.push(celda);
			celda = '';
		} else if (c === '\n' || c === '\r') {
			if (c === '\r' && t[i + 1] === '\n') i++;
			cerrarFila();
			linea++;
			inicio = linea;
		} else celda += c;
	}
	if (celda || celdas.length) cerrarFila();
	return filas;
}

/** `62,5` o `62.5`; `undefined` si no es un número. */
function numero(s: string) {
	return /^\d+([.,]\d+)?$/.test(s) ? Number(s.replace(',', '.')) : undefined;
}

/** `DD/MM/AAAA` o `AAAA-MM-DD` → `AAAA-MM-DD`; `null` si tiene el formato pero no existe. */
function fechaIso(s: string): string | null | undefined {
	const dma = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
	const amd = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
	if (!dma && !amd) return undefined;
	const [d, mes, a] = dma ? [+dma[1], +dma[2], +dma[3]] : [+amd![3], +amd![2], +amd![1]];
	const f = new Date(a, mes - 1, d);
	if (f.getFullYear() !== a || f.getMonth() !== mes - 1 || f.getDate() !== d) return null;
	return `${a}-${String(mes).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

/** `DÃ­a` → `Día`: UTF-8 que se leyó como Latin-1 y se volvió a guardar. Si no se puede arreglar, queda igual. */
function sinMojibake(s: string) {
	if (!/[Â-ï][\x80-¿]/.test(s) || /[^\x00-ÿ]/.test(s)) return s;
	const arreglado = new TextDecoder().decode(Uint8Array.from(s, (c) => c.charCodeAt(0)));
	return arreglado.includes('�') ? s : arreglado;
}

/** Encabezado exacto (sin importar mayúsculas, tildes, BOM ni mojibake), números, fechas y tipo de cada fila. */
export function validar(filas: Fila[]): { filas: FilaValida[]; errores: ErrorFila[] } {
	const [encabezado, ...resto] = filas;
	// Descanso es opcional: los archivos de antes tienen 10 columnas.
	const conDescanso = !!encabezado?.celdas[10]?.trim();
	const esperadas = conDescanso ? columnas : columnas.slice(0, 10);
	const titulos = (encabezado?.celdas ?? []).map(sinMojibake);
	const mal = esperadas.findIndex((c, i) => normalizar(titulos[i] ?? '') !== normalizar(c));
	if (mal >= 0) {
		const motivo =
			titulos.length < 2
				? 'El encabezado no tiene columnas: separalas con «;» o «,»'
				: `La columna ${mal + 1} del encabezado dice «${titulos[mal]?.trim() ?? ''}» y tiene que ser «${columnas[mal]}»`;
		return { filas: [], errores: [{ linea: encabezado?.linea ?? 1, mensaje: `${motivo}. El encabezado es: ${columnas.join('; ')}` }] };
	}
	const validas: FilaValida[] = [];
	const errores: ErrorFila[] = [];
	for (const { linea, celdas } of resto) {
		const [rutina, dia, ejercicio, tipo, series, reps, kg, segundos, minutos, fecha, descanso] = columnas.map((_, i) => (celdas[i] ?? '').trim());
		const error = (mensaje: string) => errores.push({ linea, mensaje });
		if (!rutina) { error('Falta la rutina'); continue; }
		if (!dia) { error('Falta el día'); continue; }
		if (!ejercicio) { error('Falta el ejercicio'); continue; }
		const fila: FilaValida = { linea, rutina, dia, ejercicio, tipo: kg ? 'peso' : 'reps' };
		const valores = { series, reps, kg, segundos, minutos };
		let bien = true;
		for (const campo of numericas) {
			if (!valores[campo]) continue;
			const n = numero(valores[campo]);
			if (n === undefined) {
				error(`${columnas[numericas.indexOf(campo) + 4]} tiene que ser un número («${valores[campo]}»)`);
				bien = false;
			} else fila[campo] = n;
		}
		if (tipo) {
			const t = tiposValidos.find((v) => v === normalizar(tipo));
			if (t) fila.tipo = t;
			else {
				error(`Tipo «${tipo}» no es válido: peso, reps, tiempo, cardio o calentamiento`);
				bien = false;
			}
		}
		if (fecha) {
			const f = fechaIso(fecha);
			if (f) fila.fecha = f;
			else {
				error(f === null ? `La fecha «${fecha}» no existe` : `La fecha «${fecha}» tiene que ser DD/MM/AAAA`);
				bien = false;
			}
		}
		if (descanso) {
			if (/^\d+$/.test(descanso) && +descanso >= 15 && +descanso <= 300) fila.descanso = +descanso;
			else {
				error(`Descanso tiene que ser un número entero de segundos entre 15 y 300 («${descanso}»)`);
				bien = false;
			}
		}
		if (bien) validas.push(fila);
	}
	return { filas: validas, errores };
}

export type PlanEjercicio = { nombre: string; tipo: Tipo; existente?: Ejercicio; parecidos: Ejercicio[]; descanso?: number };
export type PlanDia = { nombre: string; items: { ejercicio: string; objetivo?: Objetivo }[] };
export type PlanSesion = { fecha: string; dia: string; diaId?: string; registros: { ejercicio: string; bloques: Bloque[] }[] };
export type PlanRutina = {
	nombre: string;
	/** Id si ya existe: solo suma sesiones (sus filas sin fecha se ignoran). */
	existente?: string;
	/** Nueva sin sesiones: activa (inicio hoy, lo pone la UI); nueva con sesiones: archivada con inicio y fin. */
	estado: 'activa' | 'archivada';
	inicio?: string;
	fin?: string;
	dias: PlanDia[];
	sesiones: PlanSesion[];
	/** Fechas que ya tienen sesión en esa rutina. */
	salteadas: string[];
};
export type Plan = { ejercicios: PlanEjercicio[]; rutinas: PlanRutina[]; errores: ErrorFila[] };

/** Agrupa las filas en rutinas, días y sesiones y empareja ejercicios con el catálogo. No genera ids. */
export function planImport(
	filas: FilaValida[],
	datos: { ejercicios: Ejercicio[]; rutinas: Rutina[]; sesiones: Sesion[] }
): Plan {
	const ejercicios: PlanEjercicio[] = [];
	const rutinas: PlanRutina[] = [];
	const errores: ErrorFila[] = [];
	const buscar = <T extends { nombre: string }>(lista: T[], nombre: string) => lista.find((x) => esDuplicado(x.nombre, nombre));

	for (const f of filas) {
		let r = buscar(rutinas, f.rutina);
		if (!r) {
			const existente = buscar(datos.rutinas, f.rutina);
			r = { nombre: existente?.nombre ?? f.rutina, existente: existente?.id, estado: 'activa', dias: [], sesiones: [], salteadas: [] };
			rutinas.push(r);
		}
		const existente = datos.rutinas.find((x) => x.id === r.existente);
		const diaExistente = existente && buscar(existente.dias, f.dia);
		if (existente && !diaExistente) {
			if (f.fecha) errores.push({ linea: f.linea, mensaje: `${existente.nombre} no tiene «${f.dia}»` });
			continue;
		}
		if (existente && !f.fecha) continue;
		let e = buscar(ejercicios, f.ejercicio);
		if (!e) {
			const delCatalogo = buscar(datos.ejercicios, f.ejercicio);
			e = { nombre: f.ejercicio, tipo: f.tipo, existente: delCatalogo, parecidos: delCatalogo ? [] : parecidos(f.ejercicio, datos.ejercicios) };
			ejercicios.push(e);
		}
		// El primer descanso no vacío (solo se usa si el ejercicio es nuevo).
		e.descanso ??= f.descanso;
		const nombre = e.nombre;
		const nombreDia = diaExistente?.nombre ?? buscar(r.dias, f.dia)?.nombre ?? f.dia;
		if (!existente) {
			let d = buscar(r.dias, f.dia);
			if (!d) r.dias.push((d = { nombre: f.dia, items: [] }));
			// Sin fecha: objetivo del ejercicio en el día. Con fecha, el día igual tiene que listarlo.
			if (!d.items.some((i) => i.ejercicio === nombre)) {
				const objetivo = f.fecha ? undefined : sinVacios({ series: f.series, reps: f.reps, segundos: f.segundos, minutos: f.minutos });
				d.items.push(objetivo ? { ejercicio: nombre, objetivo } : { ejercicio: nombre });
			}
		}
		if (!f.fecha) continue;
		if (existente && datos.sesiones.some((s) => s.rutinaId === existente.id && s.fecha === f.fecha)) {
			if (!r.salteadas.includes(f.fecha)) r.salteadas.push(f.fecha);
			continue;
		}
		let s = r.sesiones.find((x) => x.fecha === f.fecha && x.dia === nombreDia);
		if (!s) r.sesiones.push((s = { fecha: f.fecha, dia: nombreDia, diaId: diaExistente?.id, registros: [] }));
		let reg = s.registros.find((x) => x.ejercicio === nombre);
		if (!reg) s.registros.push((reg = { ejercicio: nombre, bloques: [] }));
		reg.bloques.push(sinVacios({ series: f.series ?? 1, reps: f.reps, kg: f.kg, segundos: f.segundos, minutos: f.minutos }) as Bloque);
	}

	for (const r of rutinas) {
		if (r.existente || !r.sesiones.length) continue;
		const fechas = r.sesiones.map((s) => s.fecha).sort();
		r.estado = 'archivada';
		r.inicio = fechas[0];
		r.fin = fechas.at(-1);
	}
	return { ejercicios, rutinas, errores };
}

/** Saca las claves `undefined` (Firestore no las acepta); vacío → `undefined`. */
function sinVacios<T extends object>(o: T): T | undefined {
	const limpio = Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined)) as T;
	return Object.keys(limpio).length ? limpio : undefined;
}

const formato = new Intl.NumberFormat('es-AR', { useGrouping: false, maximumFractionDigits: 3 });

function celda(v: string | number | undefined) {
	const s = v === undefined ? '' : typeof v === 'number' ? formato.format(v) : v;
	return /[;"\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** Todo como CSV para Excel: estructura de cada rutina (sin fecha) y cada bloque de cada sesión (con fecha). */
export function escribirCsv(datos: { ejercicios: Ejercicio[]; rutinas: Rutina[]; sesiones: Sesion[] }): string {
	const ej = (id: string) => datos.ejercicios.find((e) => e.id === id);
	const filas: (string | number | undefined)[][] = [columnas];
	for (const r of datos.rutinas) {
		for (const d of r.dias) {
			for (const it of d.items) {
				const o = it.objetivo;
				filas.push([r.nombre, d.nombre, ej(it.ejercicioId)?.nombre, ej(it.ejercicioId)?.tipo, o?.series, o?.reps, undefined, o?.segundos, o?.minutos, '', ej(it.ejercicioId)?.descanso]);
			}
		}
		const deLaRutina = datos.sesiones.filter((s) => s.rutinaId === r.id).sort((a, b) => a.fecha.localeCompare(b.fecha));
		for (const s of deLaRutina) {
			const dia = r.dias.find((d) => d.id === s.diaId)?.nombre ?? 'Día';
			const fecha = s.fecha.split('-').reverse().join('/');
			for (const reg of s.registros) {
				for (const b of reg.bloques) {
					filas.push([r.nombre, dia, ej(reg.ejercicioId)?.nombre, ej(reg.ejercicioId)?.tipo, b.series, b.reps, b.kg, b.segundos, b.minutos, fecha, undefined]);
				}
			}
		}
	}
	return '﻿' + filas.map((f) => f.map(celda).join(';')).join('\r\n') + '\r\n';
}

/** Encabezado y filas de ejemplo: los días de una rutina (sin fecha) y una sesión hecha (con fecha). */
export function plantillaCsv(): string {
	const ej = (id: string, nombre: string, tipo: Tipo, descanso?: number): Ejercicio => ({ id, nombre, tipo, saltoKg: 2.5, saltoReps: 1, saltoSeg: 5, notas: '', ...(descanso && { descanso }) });
	return escribirCsv({
		ejercicios: [ej('pb', 'Press banca', 'peso', 90), ej('sen', 'Sentadilla', 'peso', 120), ej('pl', 'Plancha', 'tiempo')],
		rutinas: [
			{
				id: 'r',
				nombre: 'Rutina 1',
				inicio: '',
				estado: 'activa',
				dias: [
					{ id: 'd1', nombre: 'Día 1', items: [{ ejercicioId: 'pb', objetivo: { series: 4, reps: 10 } }, { ejercicioId: 'sen', objetivo: { series: 3, reps: 12 } }] },
					{ id: 'd2', nombre: 'Día 2', items: [{ ejercicioId: 'pl', objetivo: { series: 3, segundos: 40 } }] }
				]
			}
		],
		sesiones: [
			{
				id: 's',
				rutinaId: 'r',
				diaId: 'd1',
				fecha: '2026-09-15',
				creada: 0,
				terminada: true,
				registros: [{ ejercicioId: 'pb', bloques: [{ series: 3, reps: 10, kg: 60 }, { series: 1, reps: 8, kg: 62.5 }], hecho: true }]
			}
		]
	});
}

/** Lo que el import escribe, ya con ids (sin `creada`: la pone el servidor). */
export type Escrituras = {
	ejercicios: Ejercicio[];
	rutinas: Rutina[];
	/** La activa que se termina porque la nueva ocupa su lugar. */
	archivar?: { id: string; fin: string };
	sesiones: Omit<Sesion, 'creada'>[];
};

/** Completa el plan con las elecciones de la revisión y genera los ids (design.md §5). */
export function armarImport(
	plan: Plan,
	o: { decisiones: Record<string, 'mismo' | 'nuevo'>; terminarActiva: boolean; activa?: string; hoy: string; nuevoId: () => string }
): Escrituras {
	const salida: Escrituras = { ejercicios: [], rutinas: [], sesiones: [] };
	const ejercicioId: Record<string, string> = {};
	for (const e of plan.ejercicios) {
		const id = e.existente?.id ?? (o.decisiones[e.nombre] === 'mismo' ? e.parecidos[0]?.id : undefined);
		if (id) ejercicioId[e.nombre] = id;
		else {
			ejercicioId[e.nombre] = o.nuevoId();
			const nuevo: Ejercicio = { id: ejercicioId[e.nombre], nombre: e.nombre, tipo: e.tipo, saltoKg: 2.5, saltoReps: 1, saltoSeg: 5, notas: '' };
			if (e.descanso) nuevo.descanso = e.descanso;
			salida.ejercicios.push(nuevo);
		}
	}
	// Una sola activa: la primera rutina nueva sin fechas, si no hay activa o se elige terminarla.
	let lugarLibre = !o.activa || o.terminarActiva;
	for (const r of plan.rutinas) {
		const rutinaId = r.existente ?? o.nuevoId();
		const diaId: Record<string, string> = {};
		if (!r.existente) {
			const dias = r.dias.map((d) => {
				diaId[d.nombre] = o.nuevoId();
				const items = d.items.map((it) => (it.objetivo ? { ejercicioId: ejercicioId[it.ejercicio], objetivo: it.objetivo } : { ejercicioId: ejercicioId[it.ejercicio] }));
				return { id: diaId[d.nombre], nombre: d.nombre, items };
			});
			if (r.estado === 'archivada') salida.rutinas.push({ id: rutinaId, nombre: r.nombre, inicio: r.inicio!, fin: r.fin, estado: 'archivada', dias });
			else if (lugarLibre) {
				salida.rutinas.push({ id: rutinaId, nombre: r.nombre, inicio: o.hoy, estado: 'activa', dias });
				if (o.activa) salida.archivar = { id: o.activa, fin: o.hoy };
				lugarLibre = false;
			} else salida.rutinas.push({ id: rutinaId, nombre: r.nombre, inicio: o.hoy, fin: o.hoy, estado: 'archivada', dias });
		}
		for (const s of r.sesiones) {
			salida.sesiones.push({
				id: o.nuevoId(),
				rutinaId,
				diaId: s.diaId ?? diaId[s.dia],
				fecha: s.fecha,
				terminada: true,
				registros: s.registros.map((reg) => ({ ejercicioId: ejercicioId[reg.ejercicio], bloques: reg.bloques, hecho: true }))
			});
		}
	}
	return salida;
}
