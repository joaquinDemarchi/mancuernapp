// Comparación de nombres de ejercicios sin distinguir mayúsculas, acentos ni espacios sobrantes.

export function normalizar(s: string): string {
	return s
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.toLowerCase()
		.replace(/\s+/g, ' ')
		.trim();
}

function palabras(s: string): string[] {
	const n = normalizar(s);
	return n ? n.split(' ') : [];
}

// Todas las palabras de la búsqueda son prefijo de alguna palabra del nombre.
export function coincide(nombre: string, busqueda: string): boolean {
	const delNombre = palabras(nombre);
	return palabras(busqueda).every((b) => delNombre.some((p) => p.startsWith(b)));
}

// Conectores que no dicen nada del ejercicio ("Curl con mancuerna").
const conectores = new Set(['con', 'del', 'las', 'los', 'para', 'sin']);

// Coincide en algún sentido, o comparten al menos la mitad de las palabras de 3+ letras (sin conectores).
export function parecidos<T extends { nombre: string }>(nombre: string, catalogo: T[]): T[] {
	if (!normalizar(nombre)) return [];
	const largas = (s: string) => new Set(palabras(s).filter((p) => p.length >= 3 && !conectores.has(p)));
	const buscadas = largas(nombre);
	return catalogo.filter((e) => {
		if (coincide(e.nombre, nombre) || coincide(nombre, e.nombre)) return true;
		const propias = largas(e.nombre);
		const menor = Math.min(buscadas.size, propias.size);
		if (menor === 0) return false;
		const comunes = [...buscadas].filter((p) => propias.has(p)).length;
		return comunes >= menor / 2;
	});
}

export function esDuplicado(a: string, b: string): boolean {
	return normalizar(a) === normalizar(b);
}
