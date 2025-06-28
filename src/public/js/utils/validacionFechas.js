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
