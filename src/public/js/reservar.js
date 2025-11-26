$(document).ready(function () {

	async function cargarReservas() {
		try {
			const resp = await fetch('/api/camas/reservadas');
			if (!resp.ok) throw new Error('No se pudieron cargar las reservas');

			const camas = await resp.json();

			if ($.fn.DataTable.isDataTable('#tablaReservas')) {
				$('#tablaReservas').DataTable().clear().destroy();
			}

			const tbody = $('#tbodyReservas');
			tbody.empty();

			camas.forEach(cama => {
				const mov = Array.isArray(cama.movimientos) ? cama.movimientos[0] : null;
				if (!mov) return;

				const id = mov.id_movimiento;
				const fechaRaw = mov.fecha_reserva;
				let fechaFormateada = 'Fecha inválida';

				if (fechaRaw && !isNaN(Date.parse(fechaRaw))) {
					const date = new Date(fechaRaw);
					fechaFormateada = date.toLocaleString('es-AR', {
						dateStyle: 'short',
						timeStyle: 'short'
					});
				}

				const sector = cama.sector || cama.habitacion?.sector?.nombre || '-';
				const habitacion = cama.habitacion || cama.habitacion?.num || '-';
				const camaNombre = cama.nombre || '-';

				const pacienteObj = mov?.paciente || mov?.admision?.paciente;
				const paciente = pacienteObj
					? `${pacienteObj.apellido_p}, ${pacienteObj.nombre_p} (DNI: ${pacienteObj.dni_paciente})`
					: '-';

				const motivo = mov?.motivo || mov?.admision?.motivo_ingreso?.tipo || '-';

				const fila = `
					<tr>
						<td data-order="${fechaRaw || ''}">${fechaFormateada}</td>
						<td>${sector}</td>
						<td>${habitacion}</td>
						<td>${camaNombre}</td>
						<td>${paciente}</td>
						<td>${motivo}</td>
						<td>
							<button class="btn btn-sm btn-success btn-confirmar-reserva"
								data-id="${id}"
								data-paciente="${pacienteObj?.id_paciente || ''}"
								data-fecha="${fechaRaw || ''}">
								<i class="fas fa-check"></i>
							</button>
							<button class="btn btn-sm btn-danger btn-cancelar-reserva ms-1"
								data-id="${id}">
								<i class="fas fa-times"></i>
							</button>
						</td>
					</tr>
				`;
				tbody.append(fila);
			});

			$('#tablaReservas').DataTable({
				language: { url: 'https://cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json' },
				paging: true,
				pageLength: 10,
				searching: true,
				ordering: true,
				destroy: true,
				responsive: true,
				scrollX: false
			});

		} catch (error) {
			console.error('❌ Error al cargar reservas:', error);
			Swal.fire('Error', error.message || 'No se pudo cargar la tabla', 'error');
		}
	}

	$(document).on('click', '.btn-confirmar-reserva', async function () {
		const idPaciente = $(this).data('paciente');
		const fecha = $(this).data('fecha');
		const id = $(this).data('id');

		if (!idPaciente || !fecha || !id) return;

		const confirmar = await Swal.fire({
			title: '¿Confirmar reserva?',
			text: 'Esto registrará el ingreso del paciente.',
			icon: 'question',
			showCancelButton: true,
			confirmButtonText: 'Sí, confirmar',
			cancelButtonText: 'Cancelar',
			customClass: {
				popup: 'swal2-card-style'
			},
		});

		if (!confirmar.isConfirmed) return;

		try {
			const resp = await fetch(`/api/reservas/confirmar-reserva/${id}`, {
				method: 'POST',
			});

			const data = await resp.json();
			if (!resp.ok) {
				let customMsg = data.message;
				if (customMsg === 'Solo se puede confirmar la reserva el día de inicio.') {
					customMsg = 'Solo puedes confirmar la reserva el mismo día de inicio. Por favor, intenta el día correspondiente.';
				}
				throw new Error(customMsg);
			}

			Swal.fire('Éxito', data.message, 'success');
			await cargarReservas();
			$(`#egreso-${id}`).prop('disabled', false);
			$(`#motivoEgr-${id}`).prop('disabled', false);
		} catch (err) {
			Swal.fire('Error', err.message || 'Error al confirmar', 'error');
		}
	});

	$(document).on('click', '.btn-cancelar-reserva', async function () {
		const id = $(this).data('id');
		if (!id) return;

		const confirmar = await Swal.fire({
			title: '¿Cancelar reserva?',
			text: 'Esta acción eliminará la reserva actual.',
			icon: 'warning',
			showCancelButton: true,
			confirmButtonText: 'Sí, cancelar',
			cancelButtonText: 'No',
			customClass: {
				popup: 'swal2-card-style'
			},
		});

		if (!confirmar.isConfirmed) return;

		try {
			const resp = await fetch(`/api/reservas/cancelar-reserva/${id}`, {
				method: 'POST',
			});

			if (!resp.ok) throw new Error('No se pudo cancelar la reserva');

			await Swal.fire('Cancelada', 'Reserva eliminada correctamente', 'success');
			cargarReservas(); // recargar la tabla
		} catch (err) {
			Swal.fire('Error', err.message || 'Error al cancelar', 'error');
		}
	});

	$('#btnEliminarVencidas').on('click', async () => {
		const confirmar = await Swal.fire({
			title: '¿Eliminar reservas vencidas?',
			text: 'Esto borrará todas las reservas no confirmadas con fecha anterior a hoy.',
			icon: 'warning',
			showCancelButton: true,
			confirmButtonText: 'Sí, eliminar',
			cancelButtonText: 'Cancelar',
			customClass: {
				popup: 'swal2-card-style'
			},
		});

		if (!confirmar.isConfirmed) return;

		try {
			const resp = await fetch('/api/reservas/eliminar-vencidas', {
				method: 'DELETE',
			});

			const data = await resp.json();
			if (!resp.ok) throw new Error(data.message || 'Error al eliminar');

			Swal.fire('Éxito', data.message, 'success');
			await cargarReservas();
		} catch (err) {
			Swal.fire('Error', err.message, 'error');
		}
	});

	cargarReservas();
});
