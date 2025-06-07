$(document).ready(function () {
	// Manejar el submit del formulario de búsqueda
	$('#formBuscarCamas').on('submit', function (e) {
		e.preventDefault();
		const fecha = $('#fecha_busqueda').val();
		if (!fecha) {
			Swal.fire('Atención', 'Debe seleccionar una fecha.', 'warning');
			return;
		}
		buscarCamasDisponibles(fecha);
	});

	function buscarCamasDisponibles(fecha) {
		$('#tablaCamasContainer').html(
			'<div class="text-center my-4"><div class="spinner-border"></div> Cargando...</div>'
		);
		fetch(`/api/camas/disponibles?fecha=${fecha}`)
			.then((res) => res.json())
			.then((camas) => {
				console.log('Camas recibidas:', camas); // 👈 Aquí verás los datos en la consola
				renderTablaCamas(camas);
			})
			.catch(() => {
				$('#tablaCamasContainer').html(
					'<div class="alert alert-danger">Error al cargar las camas.</div>'
				);
			});
	}

	function renderTablaCamas(camas) {
		// Construir la tabla HTML
		let html = `
      <table id="tablaCamas" class="table table-bordered table-hover">
        <thead class="table-light">
          <tr>
            <th>Sector</th>
            <th>Habitación</th>
            <th>Cama</th>
            <th>Estado</th>
            <th>Paciente</th>
            <th>Género</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
    `;
		if (camas.length === 0) {
			html += `<tr><td colspan="7" class="text-center">No hay camas para la fecha seleccionada.</td></tr>`;
		} else {
			camas.forEach((cama) => {
				let estadoBadge = '';
				if (cama.estado === 'Disponible')
					estadoBadge = '<span class="badge bg-success">Disponible</span>';
				else if (cama.estado === 'Ocupada')
					estadoBadge = '<span class="badge bg-danger">Ocupada</span>';
				else if (cama.estado === 'Reservada')
					estadoBadge =
						'<span class="badge bg-warning text-dark">Reservada</span>';

				html += `
          <tr>
            <td>${cama.sector || '-'}</td>
            <td>${cama.habitacion || '-'}</td>
            <td>${cama.nombre_cama || '-'}</td>
            <td>${estadoBadge}</td>
            <td>${cama.paciente || '-'}</td>
            <td>${cama.genero || '-'}</td>
            <td>
              <button class="btn btn-sm btn-primary" ${
								cama.estado !== 'Disponible' ? 'disabled' : ''
							} data-id="${cama.id_cama}">
                Asignar paciente
              </button>
            </td>
          </tr>
        `;
			});
		}
		html += `</tbody></table>`;
		$('#tablaCamasContainer').html(html);

		// Inicializar DataTable
		$('#tablaCamas').DataTable({
			language: {
				url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json',
			},
			paging: true,
			pageLength: 10,
			searching: true,
			ordering: true,
			destroy: true,
		});

		// Evento para el botón de asignar paciente (puedes implementar la lógica luego)
		$('#tablaCamas').on(
			'click',
			'button.btn-primary:not(:disabled)',
			function () {
				const idCama = $(this).data('id');
				Swal.fire(
					'Asignar paciente',
					`Aquí puedes abrir el formulario para asignar un paciente a la cama ID ${idCama}.`,
					'info'
				);
				// Aquí puedes abrir un modal o redirigir según tu lógica
			}
		);
	}
});
