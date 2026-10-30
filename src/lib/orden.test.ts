import { describe, expect, it } from 'vitest';
import { mover } from './orden';

describe('mover', () => {
	const lista = ['a', 'b', 'c', 'd'];
	it('sube un lugar', () => {
		expect(mover(lista, 2, 1)).toEqual(['a', 'c', 'b', 'd']);
	});
	it('baja un lugar', () => {
		expect(mover(lista, 1, 2)).toEqual(['a', 'c', 'b', 'd']);
	});
	it('lleva al principio y al final', () => {
		expect(mover(lista, 3, 0)).toEqual(['d', 'a', 'b', 'c']);
		expect(mover(lista, 0, 3)).toEqual(['b', 'c', 'd', 'a']);
	});
	it('acota destinos fuera de rango', () => {
		expect(mover(lista, 0, -1)).toEqual(lista);
		expect(mover(lista, 3, 9)).toEqual(lista);
	});
	it('no modifica el original', () => {
		mover(lista, 0, 3);
		expect(lista).toEqual(['a', 'b', 'c', 'd']);
	});
});
