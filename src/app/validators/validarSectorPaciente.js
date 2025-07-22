export function calcularEdad(fechaNacimiento) {
  if (!fechaNacimiento) return null;

  const nacimiento = new Date(fechaNacimiento);
  if (isNaN(nacimiento.getTime())) return null;

  const hoy = new Date();
  let edad = hoy.getFullYear() - nacimiento.getFullYear();

  const mes = hoy.getMonth() - nacimiento.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }

  return edad;
}

export function validarCompatibilidadPacienteSector(edad, generoId, sector) {
  if (!edad || !sector) return false;
  const nombre = sector.trim().toLowerCase();

  switch (nombre) {
    case 'neonatología':
      return edad <= 1;
    case 'pediatría':
      return edad > 1 && edad <= 17;
    case 'maternidad':
      return generoId === 2; // femenino
    case 'geriatría':
      return edad >= 80;
    default:
      return edad >= 18;
  }
}

export function obtenerCriteriosPorSector(sector) {
  if (!sector) return '';

  const nombre = sector.trim().toLowerCase();
  switch (nombre) {
    case 'neonatología':
      return 'Edad: hasta 1 año';
    case 'pediatría':
      return 'Edad: entre 1 y 17 años';
    case 'maternidad':
      return 'Género: Femenino';
    case 'geriatría':
      return 'Edad: 80 años o más';
    default:
      return 'Edad: 18 años o más';
  }
}
