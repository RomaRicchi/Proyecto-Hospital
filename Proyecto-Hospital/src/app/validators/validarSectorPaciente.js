// -------------------------
// Normaliza nombres
// -------------------------
function normalizar(str) {
    return str
        ?.trim()
        .toLowerCase()
        .normalize("NFD")       // separa tildes
        .replace(/[\u0300-\u036f]/g, ""); // borra tildes
}


// -------------------------
// Cálculo de edad
// -------------------------
export function calcularEdad(fechaNacStr) {
  const hoy = new Date();
  const fechaNac = new Date(fechaNacStr);

  if (!fechaNacStr || isNaN(fechaNac.getTime())) return null;

  let edad = hoy.getFullYear() - fechaNac.getFullYear();
  const mes = hoy.getMonth() - fechaNac.getMonth();

  if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
    edad--;
  }
  return edad;
}


// -------------------------
// Validación por nombre de sector
// -------------------------
export function validarCompatibilidadPacienteSector(edad, generoId, sectorNombre) {
	const nombre = normalizar(sectorNombre);

	switch (nombre) {
		case 'neonatologia':
			return edad <= 1;

		case 'internacion pediatrica':
			return edad > 1 && edad <= 17;

		case 'maternidad':
			return generoId === 2;

		case 'geriatria':
			return edad >= 80;

		default:
			return edad >= 18;
	}
}


// -------------------------
// Criterios por nombre
// -------------------------
export function obtenerCriteriosPorSector(sectorNombre) {
	const nombre = normalizar(sectorNombre);

	switch (nombre) {
		case 'neonatologia':
			return 'Edad: hasta 1 año';

		case 'internacion pediatrica':
			return 'Edad: entre 1 y 17 años';

		case 'maternidad':
			return 'Género: Femenino';

		case 'geriatria':
			return 'Edad: 80 años o más';

		default:
			return 'Edad: 18 años o más';
	}
}
