// Argentina está en UTC-3 => -180 minutos
const ARG_TIMEZONE_OFFSET_MINUTES = -3 * 60;

// Convierte una fecha cualquiera a horario de Argentina
export function toArgentinaTime(dateInput) {
	const date = new Date(dateInput);
	const offsetLocal = date.getTimezoneOffset(); // minutos de desfase local
	return new Date(date.getTime() + (ARG_TIMEZONE_OFFSET_MINUTES - offsetLocal) * 60000);
}

// Convierte fecha UTC (desde la base) a Argentina
export function fromUTCToArgentina(dateInput) {
	const date = new Date(dateInput);
	return new Date(date.getTime() + ARG_TIMEZONE_OFFSET_MINUTES * 60000);
}

export function ajustarFechaLocal(fechaStr) {
	const fecha = new Date(fechaStr);
	const offset = fecha.getTimezoneOffset();
	fecha.setMinutes(fecha.getMinutes() - offset); // antes sumabas
	return fecha;
}

export function ajustarZonaHorariaArgentina(fechaUTC) {
	if (!(fechaUTC instanceof Date)) {
		fechaUTC = new Date(fechaUTC);
	}
	// Ajuste para Argentina: UTC-3
	const fechaLocal = new Date(fechaUTC.getTime() - 3 * 60 * 60 * 1000);
	return fechaLocal;
}

export const toUTC = (fechaStr) => {
  const fechaLocal = new Date(fechaStr);
  return new Date(fechaLocal.getTime() - fechaLocal.getTimezoneOffset() * 60000);
};