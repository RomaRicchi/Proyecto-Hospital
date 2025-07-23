export function calcularEdad(fechaNac) {
  if (!fechaNac) return 'x';
  const hoy = new Date();
  const nacimiento = new Date(fechaNac);
  if (isNaN(nacimiento)) return 'x'; // por si la fecha no es válida
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const m = hoy.getMonth() - nacimiento.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }
  return edad;
}

export function validarCompatibilidadPacienteSector(edad, generoId, sector) {
	const nombre = sector?.trim().toLowerCase();
	switch (sector) {
		case 'Neonatología':
			return edad <= 1;
		case 'Internación pediatrica':
			return edad > 1 && edad <= 17;
		case 'Maternidad':
			return generoId === 2; 
		case 'Geriatría':
			return edad >= 80;
		default:
			return edad >= 18;
	}
}

export function obtenerCriteriosPorSector(sector) {
	switch (sector) {
		case 'Neonatología':
			return 'Edad: hasta 1 año';
		case 'Internación pediatrica':
			return 'Edad: entre 1 y 17 años';
		case 'Maternidad':
			return 'Género: Femenino';
		case 'Geriatría':
			return 'Edad: 80 años o más';	
		default:
			return 'Edad: 18 años o más';
	}
}
