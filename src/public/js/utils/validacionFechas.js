export function configurarBusquedaDeCamas(callbackBuscarCamas) {
	const hoyLocal = new Date();
	const offset = hoyLocal.getTimezoneOffset();
	hoyLocal.setMinutes(hoyLocal.getMinutes() - offset);
	const hoyStr = hoyLocal.toISOString().split('T')[0];

	$('#fecha_busqueda').val(hoyStr);

	$('#formBuscarCamas').on('submit', function (e) {
		e.preventDefault();
		const fechaSeleccionadaStr = $('#fecha_busqueda').val();

		if (!fechaSeleccionadaStr) {
			Swal.fire('Atención', 'Debe seleccionar una fecha.', 'warning');
			return;
		}

		callbackBuscarCamas(fechaSeleccionadaStr);
	});
}

export function obtenerFechaBusquedaFormateada() {
	const input = document.querySelector('#fecha_busqueda');
	if (!input) return null;

	const fecha = input.value;
	if (!fecha) return null;

	const fechaSeleccionada = new Date(fecha);
	const offset = fechaSeleccionada.getTimezoneOffset();
	fechaSeleccionada.setMinutes(fechaSeleccionada.getMinutes() + offset);

	return fechaSeleccionada.toISOString().slice(0, 16);
}	

export function aplicarReservaSemanal(inputIngreso, inputEgreso, inputMotivoEgreso) {
	if (!inputIngreso || !inputEgreso) return;

	const ingreso = new Date(inputIngreso.value);
	if (isNaN(ingreso.getTime())) return;

	// Forzar hora de ingreso a las 00:00 (opcional, según tu lógica)
	ingreso.setHours(0, 0, 0, 0);

	// Calcular egreso 7 días después
	const egreso = new Date(ingreso);
	egreso.setDate(egreso.getDate() + 6); // 7 días total
	egreso.setHours(23, 59); // Fin del día

	// Formato YYYY-MM-DDTHH:mm
	const pad = n => n.toString().padStart(2, '0');
	const fechaLocal = `${egreso.getFullYear()}-${pad(egreso.getMonth() + 1)}-${pad(egreso.getDate())}T${pad(egreso.getHours())}:${pad(egreso.getMinutes())}`;

	inputEgreso.value = fechaLocal;

	// No deshabilitamos nada
	if (inputMotivoEgreso) {
		inputMotivoEgreso.value = 'Reserva anticipada';
	}
}

export function parseFechaLocal(fechaStr) {
	if (!fechaStr) return null;
	if (!fechaStr.includes(':')) return null;

	const partes = fechaStr.split(':');
	if (partes.length === 2) fechaStr += ':00';

	const fecha = new Date(fechaStr);
	if (isNaN(fecha.getTime())) return null;
	return fecha;
}


