// Fuente única de marca: manifest, título y pantallas leen de acá.
export const app = {
	nombre: 'MancuernApp',
	nombreCorto: 'MancuernApp',
	descripcion: 'Registro de la rutina de gimnasio',
	// El manifest no puede leer CSS: repite --ground del tema oscuro (design/tokens.css)
	colorFondo: '#141311',
	colorTema: '#141311',
	// Lista blanca de emails. Repetida a mano en firestore.rules: si cambia acá, cambiarla allá.
	listaBlanca: ['joa.demarchi@gmail.com']
};
