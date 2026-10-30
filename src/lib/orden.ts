// Devuelve una copia con el elemento de `desde` movido a `hasta` (índices fuera de rango se acotan).
export function mover<T>(array: readonly T[], desde: number, hasta: number): T[] {
	const copia = [...array];
	if (desde < 0 || desde >= copia.length) return copia;
	const destino = Math.max(0, Math.min(hasta, copia.length - 1));
	const [elemento] = copia.splice(desde, 1);
	copia.splice(destino, 0, elemento);
	return copia;
}
