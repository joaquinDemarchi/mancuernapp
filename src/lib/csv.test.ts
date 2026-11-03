import { describe, expect, it } from 'vitest';
import type { Sesion } from './calculos';
import type { Ejercicio, Tipo } from './catalogo';
import { columnas, escribirCsv, leerCsv, planImport, plantillaCsv, validar } from './csv';
import type { Rutina } from './rutina';

const ej = (id: string, nombre: string, tipo: Tipo = 'peso'): Ejercicio => ({ id, nombre, tipo, saltoKg: 2.5, saltoReps: 1, saltoSeg: 5, notas: '' });
const catalogo = [ej('pb', 'Press banca'), ej('cam', 'Camilla isquiotibiales'), ej('pl', 'Plancha', 'tiempo')];
const vacio = { ejercicios: [], rutinas: [], sesiones: [] };
const csv = (...lineas: string[]) => validar(leerCsv([columnas.join(';'), ...lineas].join('\n')));

describe('leerCsv', () => {
	it('saca el BOM y respeta comillas', () => {
		expect(leerCsv('﻿a;"b;c";"d ""x"""\r\n')).toEqual([{ linea: 1, celdas: ['a', 'b;c', 'd "x"'] }]);
	});
	it('numera las líneas y saltea las vacías', () => {
		expect(leerCsv('a;b\n;\n"c\nd";e').map((f) => f.linea)).toEqual([1, 3]);
	});
});

describe('validar', () => {
	it('acepta coma y punto decimal', () => {
		const { filas } = csv('R;D;Press banca;peso;3;10;62,5;;;15/09/2026', 'R;D;Press banca;peso;3;10;62.5;;;15/09/2026');
		expect(filas.map((f) => f.kg)).toEqual([62.5, 62.5]);
	});
	it('acepta las dos fechas', () => {
		const { filas } = csv('R;D;Press banca;;3;10;60;;;15/09/2026', 'R;D;Press banca;;3;10;60;;;2026-09-15');
		expect(filas.map((f) => f.fecha)).toEqual(['2026-09-15', '2026-09-15']);
	});
	it('tipo vacío: peso con Kg, si no reps', () => {
		const { filas } = csv('R;D;Press banca;;3;10;60;;;', 'R;D;Flexiones;;3;12;;;;');
		expect(filas.map((f) => f.tipo)).toEqual(['peso', 'reps']);
	});
	it('marca cada fila con error con su línea', () => {
		const { filas, errores } = csv('R;D;Press banca;peso;3;10;60;;;', 'R;D;Press banca;peso;tres;10;60;;;', 'R;D;Press banca;pesas;3;10;60;;;', 'R;D;Press banca;peso;3;10;60;;;31/09/2026');
		expect(filas).toHaveLength(1);
		expect(errores).toEqual([
			{ linea: 3, mensaje: 'Series tiene que ser un número («tres»)' },
			{ linea: 4, mensaje: 'Tipo «pesas» no es válido: peso, reps, tiempo, cardio o calentamiento' },
			{ linea: 5, mensaje: 'La fecha «31/09/2026» no existe' }
		]);
	});
	it('rechaza otro encabezado', () => {
		expect(validar(leerCsv('Rutina;Dia\nR;D')).errores[0].linea).toBe(1);
	});
	it('acepta el encabezado sin tildes ni mayúsculas', () => {
		expect(validar(leerCsv('rutina;dia;ejercicio;tipo;series;reps;kg;segundos;minutos;fecha')).errores).toEqual([]);
	});
});

describe('planImport', () => {
	it('arma los bloques de una sesión en orden', () => {
		const { filas } = csv('Rutina 1;Día 1;Press banca;peso;3;10;60;;;15/09/2026', 'Rutina 1;Día 1;Press banca;peso;1;8;70;;;15/09/2026');
		const plan = planImport(filas, vacio);
		expect(plan.rutinas[0].sesiones).toEqual([
			{ fecha: '2026-09-15', dia: 'Día 1', diaId: undefined, registros: [{ ejercicio: 'Press banca', bloques: [{ series: 3, reps: 10, kg: 60 }, { series: 1, reps: 8, kg: 70 }] }] }
		]);
	});
	it('rutina nueva sin fechas: activa, días en orden y objetivos', () => {
		const { filas } = csv('Rutina 5;Día 1;Press banca;peso;4;10;;;;', 'Rutina 5;Día 2;Plancha;tiempo;3;;;40;;', 'Rutina 5;Día 1;Remo;peso;;;;;;');
		const r = planImport(filas, vacio).rutinas[0];
		expect(r.estado).toBe('activa');
		expect(r.inicio).toBeUndefined();
		expect(r.dias).toEqual([
			{ nombre: 'Día 1', items: [{ ejercicio: 'Press banca', objetivo: { series: 4, reps: 10 } }, { ejercicio: 'Remo' }] },
			{ nombre: 'Día 2', items: [{ ejercicio: 'Plancha', objetivo: { series: 3, segundos: 40 } }] }
		]);
	});
	it('rutina inexistente con fechas: archivada con inicio y fin', () => {
		const { filas } = csv('Rutina 1;Día 1;Press banca;;3;10;60;;;22/09/2026', 'Rutina 1;Día 1;Press banca;;3;10;60;;;08/09/2026', 'Rutina 1;Día 2;Press banca;;3;10;60;;;15/09/2026');
		const r = planImport(filas, vacio).rutinas[0];
		expect([r.estado, r.inicio, r.fin]).toEqual(['archivada', '2026-09-08', '2026-09-22']);
		expect(r.dias.map((d) => d.nombre)).toEqual(['Día 1', 'Día 2']);
		expect(r.sesiones).toHaveLength(3);
	});
	it('saltea una fecha que ya tiene sesión en esa rutina', () => {
		const rutina: Rutina = { id: 'r1', nombre: 'Rutina 2', inicio: '2026-09-24', estado: 'activa', dias: [{ id: 'd1', nombre: 'Día 1', items: [] }] };
		const sesion: Sesion = { id: 's1', rutinaId: 'r1', diaId: 'd1', fecha: '2026-10-29', creada: 0, terminada: true, registros: [] };
		const { filas } = csv('rutina 2;dia 1;Press banca;;3;10;60;;;29/10/2026', 'Rutina 2;Día 1;Press banca;;3;10;60;;;30/10/2026');
		const r = planImport(filas, { ejercicios: catalogo, rutinas: [rutina], sesiones: [sesion] }).rutinas[0];
		expect(r.existente).toBe('r1');
		expect(r.salteadas).toEqual(['2026-10-29']);
		expect(r.sesiones.map((s) => [s.fecha, s.dia, s.diaId])).toEqual([['2026-10-30', 'Día 1', 'd1']]);
	});
	it('empareja por nombre normalizado y deja los parecidos sin emparejar', () => {
		const { filas } = csv('R;D;press  banca;;3;10;60;;;', 'R;D;Camilla isquio;;3;12;;;;', 'R;D;Burpees;;3;12;;;;');
		const [press, camilla, burpees] = planImport(filas, { ...vacio, ejercicios: catalogo }).ejercicios;
		expect(press.existente?.id).toBe('pb');
		expect(camilla.existente).toBeUndefined();
		expect(camilla.parecidos.map((e) => e.id)).toEqual(['cam']);
		expect([burpees.existente, burpees.parecidos]).toEqual([undefined, []]);
	});
});

describe('escribirCsv', () => {
	const ejercicios = [ej('pb', 'Press banca'), ej('pl', 'Plancha; frontal', 'tiempo'), ej('cal', 'Movilidad', 'calentamiento')];
	const rutinas: Rutina[] = [
		{ id: 'r0', nombre: 'Rutina 1', inicio: '2026-09-08', fin: '2026-09-15', estado: 'archivada', dias: [{ id: 'a1', nombre: 'Día 1', items: [{ ejercicioId: 'pb' }] }] },
		{
			id: 'r1',
			nombre: 'Rutina 2',
			inicio: '2026-09-24',
			estado: 'activa',
			dias: [
				{ id: 'd1', nombre: 'Día 1', items: [{ ejercicioId: 'cal' }, { ejercicioId: 'pb', objetivo: { series: 4, reps: 10 } }] },
				{ id: 'd2', nombre: 'Día 2', items: [{ ejercicioId: 'pl', objetivo: { series: 3, segundos: 40 } }] }
			]
		}
	];
	const s = (id: string, rutinaId: string, diaId: string, fecha: string, registros: Sesion['registros']): Sesion => ({ id, rutinaId, diaId, fecha, creada: 0, terminada: true, registros });
	const sesiones = [
		s('s1', 'r0', 'a1', '2026-09-08', [{ ejercicioId: 'pb', bloques: [{ series: 3, reps: 10, kg: 60 }], hecho: true }]),
		s('s2', 'r0', 'a1', '2026-09-15', [{ ejercicioId: 'pb', bloques: [{ series: 3, reps: 10, kg: 62.5 }, { series: 1, reps: 8, kg: 70 }], hecho: true }]),
		s('s3', 'r1', 'd2', '2026-10-29', [{ ejercicioId: 'pl', bloques: [{ series: 3, segundos: 45 }], hecho: true }]),
		s('s4', 'r1', 'd1', '2026-10-30', [
			{ ejercicioId: 'cal', bloques: [{ series: 1 }], hecho: true },
			{ ejercicioId: 'pb', bloques: [{ series: 4, reps: 10, kg: 42.5 }], hecho: true }
		])
	];
	const texto = escribirCsv({ ejercicios, rutinas, sesiones });

	it('BOM, «;», coma decimal y fecha DD/MM/AAAA', () => {
		expect(texto.startsWith('﻿Rutina;Día;Ejercicio;')).toBe(true);
		expect(texto).toContain('Rutina 1;Día 1;Press banca;peso;3;10;62,5;;;15/09/2026\r\n');
		expect(texto).toContain('"Plancha; frontal"');
	});

	it('ida y vuelta: escribirCsv → leerCsv → planImport da los mismos datos', () => {
		const { filas, errores } = validar(leerCsv(texto));
		expect(errores).toEqual([]);
		const plan = planImport(filas, vacio);
		const nombre = (id: string) => ejercicios.find((e) => e.id === id)!.nombre;
		const porNombre = (xs: { nombre: string; tipo: Tipo }[]) => xs.map((e) => [e.nombre, e.tipo]).sort();
		expect(porNombre(plan.ejercicios)).toEqual(porNombre(ejercicios));
		expect(plan.rutinas.map((r) => r.nombre)).toEqual(['Rutina 1', 'Rutina 2']);
		for (const [i, r] of rutinas.entries()) {
			expect(plan.rutinas[i].dias).toEqual(r.dias.map((d) => ({ nombre: d.nombre, items: d.items.map((it) => (it.objetivo ? { ejercicio: nombre(it.ejercicioId), objetivo: it.objetivo } : { ejercicio: nombre(it.ejercicioId) })) })));
			expect(plan.rutinas[i].sesiones).toEqual(
				sesiones
					.filter((x) => x.rutinaId === r.id)
					.map((x) => ({
						fecha: x.fecha,
						dia: r.dias.find((d) => d.id === x.diaId)!.nombre,
						diaId: undefined,
						registros: x.registros.map((reg) => ({ ejercicio: nombre(reg.ejercicioId), bloques: reg.bloques }))
					}))
			);
		}
	});
});

describe('plantillaCsv', () => {
	it('es válida y arma una rutina con una sesión', () => {
		const texto = plantillaCsv();
		expect(texto).toContain('Rutina 1;Día 1;Press banca;peso;1;8;62,5;;;15/09/2026');
		const { filas, errores } = validar(leerCsv(texto));
		expect(errores).toEqual([]);
		const [r] = planImport(filas, vacio).rutinas;
		expect([r.nombre, r.dias.length, r.sesiones.length]).toEqual(['Rutina 1', 2, 1]);
	});
});
