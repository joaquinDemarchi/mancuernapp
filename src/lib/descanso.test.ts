import { describe, expect, it } from 'vitest';
import { formatearDescanso, restante } from './descanso';

describe('restante', () => {
	it('redondea hacia arriba', () => {
		expect(restante(10_000, 0)).toBe(10);
		expect(restante(10_000, 100)).toBe(10);
		expect(restante(10_000, 9_001)).toBe(1);
	});
	it('no baja de 0', () => {
		expect(restante(10_000, 10_000)).toBe(0);
		expect(restante(10_000, 25_000)).toBe(0);
	});
	it('cuenta con el reloj aunque se haya frenado el intervalo', () => {
		// Salió a los 0:20 de un descanso de 1:30 y volvió 30 s después.
		const fin = 90_000;
		expect(restante(fin, 50_000)).toBe(40);
	});
});

describe('formatearDescanso', () => {
	it('arma M:SS', () => {
		expect(formatearDescanso(90)).toBe('1:30');
		expect(formatearDescanso(45)).toBe('0:45');
		expect(formatearDescanso(180)).toBe('3:00');
		expect(formatearDescanso(0)).toBe('0:00');
		expect(formatearDescanso(300)).toBe('5:00');
	});
});
