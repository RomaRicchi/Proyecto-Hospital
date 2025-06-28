$(document).ready(function () {

	const tabla = $('#tablaReservas');

	if (tabla.length) {
		const dt = tabla.DataTable({
			language: {	url: 'https://cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json'},
			paging: true,
			pageLength: 10,
			searching: true,
			ordering: true,
			destroy: true,
			responsive: true,
			scrollX: false,
			columnDefs: [{ targets: [5], orderable: false, searchable: false }],
		});

		// Agregar botón para crear nueva reserva si no hay resultados
		dt.on('draw', function () {
			const noResults = dt.rows({ filter: 'applied' }).data().length === 0;
			$('#btnAgregarReserva').remove();

			if (noResults) {
				$('#tablaReservas_wrapper').append(`
                    <div class="text-center mt-3">
                        <button id="btnAgregarReserva" class="btn btn-warning">
                            Crear nueva reserva
                        </button>
                    </div>
                `);
			}
		});
	}
});
