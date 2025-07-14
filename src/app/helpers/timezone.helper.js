export function ajustarZonaHorariaArgentina(fechaUTC) {
  return new Date(fechaUTC); 
}

export const toUTC = (fechaStr) => {
  const fechaLocal = new Date(fechaStr);
  return new Date(fechaLocal.getTime() - fechaLocal.getTimezoneOffset() * 60000);
};

