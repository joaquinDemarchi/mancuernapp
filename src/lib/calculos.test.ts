import { describe, expect, it } from 'vitest';
import type { Tipo } from './catalogo';
import {
	anterior,
	crecimiento,
	desarmar,
	desdeObjetivo,
	diaMes,
	diasAntes,
	diaSugerido,
	evolucion,
	formatear,
	formatearPct,
	formatearVolumen,
	hoy,
	indicador,
	semana,
	sesionDeHoy,
	ultimaVez,
	volumen,
	volumenEjercicio,
	type Registro,
	type Sesion
} from './calculos';

const rutina = {
	id: 'r1',
	dias: [
		{ id: 'd1', nombre: 'Día 1', items: [] },
		{ id: 'd2', nombre: 'Día 2', items: [] },
		{ id: 'd3', nombre: 'Día 3', items: [] }
	]
};

let n = 0;
function s(diaId: string, fecha: string, registros: Registro[] = [], creada = 0): Sesion {
	return { id: `s${n++}`, rutinaId: 'r1', diaId, fecha, creada, terminada: true, registros };
}
const r = (ejercicioId: string, series: number, reps: number, kg: number): Registro => ({
	ejercicioId,
	bloques: [{ series, reps, kg }],
	hecho: true
});

describe('hoy', () => {
	it('usa la fecha local', () => {
		expect(hoy(new Date(2026, 0, 5, 23, 30))).toBe('2026-01-05');
	});
});

describe('diasAntes', () => {
	it('cruza el mes', () => {
		expect(diasAntes(1, new Date(2026, 10, 1, 9))).toBe('2026-10-31');
		expect(diasAntes(2, new Date(2026, 10, 1, 9))).toBe('2026-10-30');
	});
});

describe('sesionDeHoy', () => {
	it('encuentra la de hoy o nada', () => {
		const ss = [s('d1', '2026-10-29'), s('d2', '2026-10-31')];
		expect(sesionDeHoy(ss, '2026-10-31')).toBe(ss[1]);
		expect(sesionDeHoy(ss, '2026-10-30')).toBeUndefined();
	});
	it('con rutina, ignora las de otra', () => {
		const otra = { ...s('a1', '2026-10-31'), rutinaId: 'r0' };
		expect(sesionDeHoy([otra], '2026-10-31', 'r1')).toBeUndefined();
		expect(sesionDeHoy([otra], '2026-10-31')).toBe(otra);
	});
});

describe('diaSugerido', () => {
	it('sin sesiones, el primero', () => {
		expect(diaSugerido(rutina, [], '2026-10-31')?.id).toBe('d1');
	});
	it('el siguiente al de la última sesión', () => {
		const ss = [s('d2', '2026-10-29'), s('d1', '2026-10-27')];
		expect(diaSugerido(rutina, ss, '2026-10-31')?.id).toBe('d3');
	});
	it('después del último vuelve al primero', () => {
		expect(diaSugerido(rutina, [s('d3', '2026-10-30')], '2026-10-31')?.id).toBe('d1');
	});
	it('si el día de la última ya no existe, el primero', () => {
		expect(diaSugerido(rutina, [s('borrado', '2026-10-30')], '2026-10-31')?.id).toBe('d1');
	});
	it('ignora la sesión de hoy', () => {
		const ss = [s('d1', '2026-10-30'), s('d2', '2026-10-31')];
		expect(diaSugerido(rutina, ss, '2026-10-31')?.id).toBe('d2');
	});
	it('ignora las sesiones de otra rutina', () => {
		const ss = [s('d1', '2026-10-27'), { ...s('a1', '2026-10-30'), rutinaId: 'r0' }];
		expect(diaSugerido(rutina, ss, '2026-10-31')?.id).toBe('d2');
	});
	it('mismo día: desempata por creada', () => {
		const ss = [s('d2', '2026-10-30', [], 2), s('d1', '2026-10-30', [], 1)];
		expect(diaSugerido(rutina, ss, '2026-10-31')?.id).toBe('d3');
	});
});

describe('ultimaVez', () => {
	const ss = [
		s('d2', '2026-10-20', [r('pb', 4, 10, 37.5)]),
		s('d2', '2026-10-27', [r('pb', 4, 10, 40)]),
		s('d1', '2026-10-29', [r('pb', 3, 8, 50), r('remo', 3, 12, 14)]),
		s('d2', '2026-10-31', [r('pb', 4, 10, 42.5)])
	];
	it('la última del mismo día, antes de hoy', () => {
		expect(ultimaVez(ss, 'd2', 'pb', '2026-10-31')).toEqual([{ series: 4, reps: 10, kg: 40 }]);
	});
	it('nunca hecho en ese día', () => {
		expect(ultimaVez(ss, 'd2', 'remo', '2026-10-31')).toBeUndefined();
	});
	it('extra: en cualquier día', () => {
		expect(ultimaVez(ss, 'd2', 'remo', '2026-10-31', true)).toEqual([{ series: 3, reps: 12, kg: 14 }]);
		expect(ultimaVez(ss, 'd2', 'pb', '2026-10-31', true)).toEqual([{ series: 3, reps: 8, kg: 50 }]);
	});
});

describe('semana', () => {
	const ss = [s('d2', '2026-10-20'), s('d1', '2026-10-22'), s('d2', '2026-10-27')];
	it('sin sesión actual: cantidad + 1', () => {
		expect(semana(ss, 'd2')).toBe(3);
		expect(semana(ss, 'd3')).toBe(1);
	});
	it('con sesión actual: la cuenta', () => {
		const actual = s('d2', '2026-10-31');
		expect(semana([...ss, actual], 'd2', actual)).toBe(3);
		expect(semana(ss, 'd2', ss[0])).toBe(1);
	});
});

describe('desdeObjetivo', () => {
	it('toma el objetivo sin kg', () => {
		expect(desdeObjetivo('peso', { series: 4, reps: 10 })).toEqual({ series: 4, reps: 10, kg: 0 });
		expect(desdeObjetivo('tiempo', { series: 3, segundos: 40 })).toEqual({ series: 3, segundos: 40 });
		expect(desdeObjetivo('cardio', { minutos: 15 })).toEqual({ series: 1, minutos: 15 });
		expect(desdeObjetivo('calentamiento')).toEqual({ series: 1 });
	});
});

describe('desarmar', () => {
	it('3×10 · 40 → tres 1×10 · 40', () => {
		const b = { series: 3, reps: 10, kg: 40 };
		const uno = { series: 1, reps: 10, kg: 40 };
		expect(desarmar([b], 0)).toEqual([uno, uno, uno]);
	});
	it('mantiene los otros bloques en su lugar', () => {
		const a = { series: 1, reps: 12, kg: 20 };
		const b = { series: 2, reps: 8, kg: 60 };
		expect(desarmar([a, b], 1)).toEqual([a, { ...b, series: 1 }, { ...b, series: 1 }]);
	});
});

describe('volumen', () => {
	const tipos: Record<string, Tipo> = { pb: 'peso', sen: 'peso', fon: 'reps' };
	it('4×10·40 + 3×10·60 = 3400, solo peso', () => {
		const regs = [r('pb', 4, 10, 40), r('sen', 3, 10, 60), r('fon', 3, 12, 10)];
		expect(volumen(regs, (id) => tipos[id])).toBe(3400);
	});
});

describe('formatear', () => {
	it('peso con varios bloques', () => {
		expect(
			formatear('peso', [
				{ series: 3, reps: 10, kg: 60 },
				{ series: 1, reps: 8, kg: 70 }
			])
		).toBe('3×10 · 60 kg + 1×8 · 70 kg');
		expect(formatear('peso', [{ series: 4, reps: 10, kg: 42.5 }])).toBe('4×10 · 42,5 kg');
	});
	it('tiempo, cardio, reps y calentamiento', () => {
		expect(formatear('tiempo', [{ series: 3, segundos: 40 }])).toBe('3×40 s');
		expect(formatear('cardio', [{ series: 1, minutos: 15 }])).toBe('15 min');
		expect(formatear('reps', [{ series: 3, reps: 12 }])).toBe('3×12');
		expect(formatear('calentamiento', [{ series: 1 }])).toBe('Calentamiento');
	});
});

describe('formatearVolumen y diaMes', () => {
	it('miles con punto y guion sin peso', () => {
		expect(formatearVolumen(4390)).toBe('4.390 kg');
		expect(formatearVolumen(0)).toBe('—');
		expect(diaMes('2026-10-29')).toBe('29/10');
	});
});

describe('volumenEjercicio', () => {
	it('3×10·60 + 1×8·70 = 2.360', () => {
		const reg: Registro = {
			ejercicioId: 'pb',
			bloques: [
				{ series: 3, reps: 10, kg: 60 },
				{ series: 1, reps: 8, kg: 70 }
			],
			hecho: true
		};
		expect(volumenEjercicio(reg)).toBe(2360);
	});
	it('kg con decimales', () => {
		expect(volumenEjercicio(r('pb', 4, 10, 62.5))).toBe(2500);
	});
});

describe('anterior', () => {
	const ss = [s('d1', '2026-10-20'), s('d2', '2026-10-22'), s('d1', '2026-10-27'), s('d1', '2026-10-31')];
	it('la previa del mismo día', () => {
		expect(anterior(ss, ss[3])).toBe(ss[2]);
		expect(anterior(ss, ss[2])).toBe(ss[0]);
	});
	it('primera vez de ese día', () => {
		expect(anterior(ss, ss[0])).toBeUndefined();
		expect(anterior(ss, ss[1])).toBeUndefined();
	});
});

describe('crecimiento e indicador', () => {
	it('2.000 → 2.100 = +5 %', () => {
		expect(crecimiento(2100, 2000)).toBe(5);
		expect(formatearPct(crecimiento(2100, 2000)!)).toBe('+5 %');
	});
	it('primera vez o previo 0: sin %', () => {
		expect(crecimiento(2100, undefined)).toBeUndefined();
		expect(crecimiento(2100, 0)).toBeUndefined();
	});
	it('límites de los niveles', () => {
		expect(indicador(10)).toBe('optimo');
		expect(indicador(0)).toBe('optimo');
		expect(indicador(-3)).toBe('bajo');
		expect(indicador(10.5)).toBe('alto');
	});
	it('kg con decimales: 2.400 → 2.500', () => {
		const pct = crecimiento(volumenEjercicio(r('pb', 4, 10, 62.5)), volumenEjercicio(r('pb', 4, 10, 60)))!;
		expect(formatearPct(pct)).toBe('+4 %');
		expect(indicador(pct)).toBe('optimo');
	});
	it('muestra redondeado con menos tipográfico', () => {
		expect(formatearPct(-3)).toBe('−3 %');
		expect(formatearPct(10.5)).toBe('+11 %');
	});
});

describe('evolucion', () => {
	it('cruza dos rutinas en orden de fecha', () => {
		const vieja = { ...s('a1', '2026-09-02', [r('sen', 3, 10, 50)]), rutinaId: 'r0' };
		const ss = [
			s('d1', '2026-10-27', [r('sen', 3, 10, 60)]),
			s('d2', '2026-10-29', [r('pb', 3, 10, 40)]),
			vieja,
			s('d1', '2026-10-20', [r('sen', 3, 10, 55)])
		];
		const veces = evolucion(ss, 'sen', 'peso');
		expect(veces.map((v) => v.fecha)).toEqual(['2026-09-02', '2026-10-20', '2026-10-27']);
		expect(veces.map((v) => v.rutinaId)).toEqual(['r0', 'r1', 'r1']);
		expect(veces.map((v) => v.volumen)).toEqual([1500, 1650, 1800]);
	});
	it('sin peso, sin volumen', () => {
		const pl: Registro = { ejercicioId: 'pl', bloques: [{ series: 3, segundos: 40 }], hecho: true };
		expect(evolucion([s('d1', '2026-10-27', [pl])], 'pl', 'tiempo')[0].volumen).toBeUndefined();
	});
});
