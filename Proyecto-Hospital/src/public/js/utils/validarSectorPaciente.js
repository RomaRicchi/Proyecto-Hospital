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


// -------------------------------------------------------------
// VALIDACIÓN POR ID DE SECTOR
// -------------------------------------------------------------
export function validarCompatibilidadPacienteSector(edad, generoId, idSector) {
	switch (idSector) {
		case 3: // Neonatología
			return edad <= 1;

		case 5: // Internación pediátrica
			return edad > 1 && edad <= 17;

		case 6: // Maternidad
			return generoId === 2;

		case 8: // Geriatría
			return edad >= 80;

		default:
			return edad >= 18;
	}
}


// -------------------------------------------------------------
// CRITERIOS MOSTRADOS AL USUARIO
// -------------------------------------------------------------
export function obtenerCriteriosPorSector(idSector) {
	switch (idSector) {
		case 3:
			return 'Edad: hasta 1 año';

		case 5:
			return 'Edad: entre 1 y 17 años';

		case 6:
			return 'Género: Femenino';

		case 8:
			return 'Edad: 80 años o más';

		default:
			return 'Edad: 18 años o más';
	}
}
