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

	const fechaStr = `${fecha}T00:00`;
	return fechaStr;
}

export function aplicarReservaSemanal(inputIngreso, inputEgreso, inputMotivoEgr) {
	if (!inputIngreso || !inputEgreso) return;

	const ingreso = new Date(inputIngreso.value);
	if (isNaN(ingreso)) return;

	const egreso = new Date(ingreso);
	egreso.setDate(egreso.getDate() + 7);

	// Convertir a formato yyyy-MM-ddTHH:mm en hora local (NO UTC)
	const pad = (n) => n.toString().padStart(2, '0');
	const egresoStr = `${egreso.getFullYear()}-${pad(egreso.getMonth() + 1)}-${pad(egreso.getDate())}T${pad(egreso.getHours())}:${pad(egreso.getMinutes())}`;

	inputEgreso.value = egresoStr;
	inputEgreso.disabled = true;
	inputEgreso.title = 'El egreso se fija automáticamente a 7 días en reservas.';

	if (inputMotivoEgr) {
		inputMotivoEgr.disabled = true;
		inputMotivoEgr.placeholder = '(No editable en reservas)';
		inputMotivoEgr.title = 'Deshabilitado hasta que se confirme la reserva.';
	}
}

export function parseFechaLocal(fechaStr) {
	if (!fechaStr) return null;
	if (!fechaStr.includes(':')) return null;

	// Si falta el componente de segundos, lo agregamos
	if (fechaStr.split(':').length === 2) {
		fechaStr += ':00';
	}

	// Validar la fecha de forma más explícita
	if (isNaN(Date.parse(fechaStr))) return null;

	const fecha = new Date(fechaStr);
	return fecha;
}

export function toUTC(fechaStr) {
  const fechaLocal = new Date(fechaStr);
  return new Date(fechaLocal.getTime() - fechaLocal.getTimezoneOffset() * 60000);
}

export function fromUTCToArgentina(dateInput) {
  const date = new Date(dateInput);
  return new Date(date.getTime() - 3 * 60 * 60 * 1000); // UTC-3
}

export function getFechaLocalParaInput() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
}