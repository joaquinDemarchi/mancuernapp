/** Segundos enteros que faltan hasta `fin` (ms), redondeando hacia arriba; nunca negativo. */
export function restante(fin: number, ahora: number): number {
	return Math.max(0, Math.ceil((fin - ahora) / 1000));
}

/** 90 → "1:30", 45 → "0:45". */
export function formatearDescanso(segundos: number): string {
	const s = Math.max(0, Math.round(segundos));
	return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
