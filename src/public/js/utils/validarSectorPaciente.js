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


export function validarCompatibilidadPacienteSector(edad, generoId, sector) {
	const nombre = sector?.trim().toLowerCase();
	switch (nombre) {
		case 'neonatología':
			return edad <= 1;
		case 'internación pediatrica':
			return edad > 1 && edad <= 17;
		case 'maternidad':
			return generoId === 2; 
		case 'geriatría':
			return edad >= 80;
		default:
			return edad >= 18;
	}
}

export function obtenerCriteriosPorSector(sector) {
	switch (sector) {
		case 'neonatología':
			return 'Edad: hasta 1 año';
		case 'internación pediatrica':
			return 'Edad: entre 1 y 17 años';
		case 'maternidad':
			return 'Género: Femenino';
		case 'geriatría':
			return 'Edad: 80 años o más';	
		default:
			return 'Edad: 18 años o más';
	}
}
