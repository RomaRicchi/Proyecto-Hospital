export function configurarBusquedaDeCamas(callbackBuscarCamas) {
	const hoyLocal = new Date();
	const offset = hoyLocal.getTimezoneOffset();
	hoyLocal.setMinutes(hoyLocal.getMinutes() - offset);
	const hoyStr = hoyLocal.toISOString().split('T')[0];

	$('#fecha_busqueda').val(hoyStr); // ⛔ quitamos .attr('min', hoyStr)

	$('#formBuscarCamas').on('submit', function (e) {
		e.preventDefault();
		const fechaSeleccionadaStr = $('#fecha_busqueda').val();

		if (!fechaSeleccionadaStr) {
			Swal.fire('Atención', 'Debe seleccionar una fecha.', 'warning');
			return;
		}

		// ✅ Ya no se bloquean fechas pasadas
		callbackBuscarCamas(fechaSeleccionadaStr);
	});
}

export function obtenerFechaBusquedaFormateada() {
	const input = document.querySelector('#fecha_busqueda');
	if (!input) return null;

	const fecha = input.value;
	if (!fecha) return null;

	return fecha;
	
}



export function aplicarReservaSemanal(inputFechaIngreso, inputFechaEgreso, inputMotivoEgr) {
	if (!inputFechaIngreso || !inputFechaEgreso) return;

	const fechaIngreso = new Date(inputFechaIngreso.value);
	const fechaEgreso = new Date(fechaIngreso);
	fechaEgreso.setDate(fechaIngreso.getDate() + 7);

	const egresoStr = fechaEgreso.toISOString().slice(0, 16);
	inputFechaEgreso.value = egresoStr;
	inputFechaEgreso.disabled = true;

	if (inputMotivoEgr) inputMotivoEgr.disabled = true;
}