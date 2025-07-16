export function ajustarZonaHorariaArgentina(fechaUTC) {
  return new Date(fechaUTC); 
}

export const toUTC = (fechaStr) => {
  const fechaLocal = new Date(fechaStr);
  return new Date(fechaLocal.getTime() - fechaLocal.getTimezoneOffset() * 60000);
};

export function calcularHoraFin(fechaHoraInicio, duracionMinutos) {
  const inicio = new Date(fechaHoraInicio);
  if (isNaN(inicio.getTime())) return null;

  const fin = new Date(inicio.getTime() + duracionMinutos * 60000);
  return fin.toISOString();
}
