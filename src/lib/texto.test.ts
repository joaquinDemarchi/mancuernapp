import { describe, expect, it } from 'vitest';
import { coincide, esDuplicado, normalizar, parecidos } from './texto';

describe('normalizar', () => {
	it('saca acentos, mayúsculas y espacios sobrantes', () => {
		expect(normalizar('  Elongación   Isquios ')).toBe('elongacion isquios');
	});
});

describe('coincide', () => {
	it('encuentra sin acento', () => {
		expect(coincide('Elongación', 'elongacion')).toBe(true);
	});
	it('acepta prefijos de palabras en cualquier orden', () => {
		expect(coincide('Press inclinado con mancuerna', 'manc press')).toBe(true);
		expect(coincide('Sentadilla', 'sent')).toBe(true);
	});
	it('no coincide si falta una palabra', () => {
		expect(coincide('Press banca', 'press militar')).toBe(false);
	});
	it('búsqueda vacía coincide con todo', () => {
		expect(coincide('Remo', '  ')).toBe(true);
	});
});

describe('parecidos', () => {
	const catalogo = [
		{ nombre: 'Press inclinado con mancuerna' },
		{ nombre: 'Sentadilla' },
		{ nombre: 'Remo con mancuerna' }
	];
	it('"press inclinado" es parecido a "Press inclinado con mancuerna"', () => {
		expect(parecidos('press inclinado', catalogo).map((e) => e.nombre)).toEqual([
			'Press inclinado con mancuerna'
		]);
	});
	it('comparte la mitad de las palabras largas', () => {
		expect(parecidos('Curl con mancuerna', catalogo).map((e) => e.nombre)).toEqual([
			'Press inclinado con mancuerna',
			'Remo con mancuerna'
		]);
	});
	it('sin texto no hay parecidos', () => {
		expect(parecidos(' ', catalogo)).toEqual([]);
	});
	it('nada en común', () => {
		expect(parecidos('Hip thrust', catalogo)).toEqual([]);
	});
});

describe('esDuplicado', () => {
	it('"press banca" es duplicado de "Press Banca"', () => {
		expect(esDuplicado('press banca', 'Press Banca')).toBe(true);
	});
	it('ignora acentos y espacios', () => {
		expect(esDuplicado(' Elongacion ', 'Elongación')).toBe(true);
	});
	it('nombres distintos no son duplicado', () => {
		expect(esDuplicado('Press banco', 'Press banca')).toBe(false);
	});
});
