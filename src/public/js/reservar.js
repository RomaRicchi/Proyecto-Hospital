$(document).ready(function () {
	
	async function cargarReservas() {
		try {
			const resp = await fetch('/api/camas/reservadas');
			if (!resp.ok) throw new Error('No se pudieron cargar las reservas');
			const camas = await resp.json();

			const tbody = $('#tablaReservas tbody');
			tbody.empty();

			if (!camas.length) {
				tbody.append(`<tr><td colspan="9" class="text-center">No hay reservas activas</td></tr>`);
				return;
			}

			camas.forEach(cama => {
				const mov = cama.movimientos[0];
				// Usar id_movimiento como identificador único del movimiento
				const id = mov?.id_movimiento;
				const fecha = new Date(mov.fecha_hora_ingreso).toLocaleString('es-AR');
				const fechaRaw = mov.fecha_hora_ingreso;
				const paciente = mov?.admision?.paciente;
				const motivo = mov?.admision?.motivo_ingreso?.tipo || '-';

				const fila = `
					<tr>
						<td>${fecha}</td>
						<td>${cama.habitacion?.sector?.nombre || '-'}</td>
						<td>${cama.habitacion?.num || '-'}</td>
						<td>${cama.nombre}</td>
						<td>${paciente ? `${paciente.apellido_p}, ${paciente.nombre_p} (DNI: ${paciente.dni_paciente})` : '-'}</td>
						<td>${motivo}</td>
						<td><input type="datetime-local" id="egreso-${id}" class="form-control" disabled></td>
						<td><input type="text" id="motivoEgr-${id}" class="form-control" placeholder="(No editable)" disabled></td>
						<td>
							<button class="btn btn-sm btn-success btn-confirmar-reserva"
								data-id="${id}" data-paciente="${paciente?.id_paciente}" data-fecha="${fechaRaw}">
								Confirmar
							</button>
							<button class="btn btn-sm btn-danger btn-cancelar-reserva ms-1"
								data-id="${id}">
								Cancelar
							</button>
						</td>
					</tr>
				`;

				tbody.append(fila);
			});

			$('#tablaReservas').DataTable({
				language: {
					url: 'https://cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json',
				},
				destroy: true,
			});
		} catch (error) {
			Swal.fire('Error', error.message || 'No se pudo cargar la tabla', 'error');
		}
	}

	// Confirmar reserva
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
		});

		if (!confirmar.isConfirmed) return;

		try {
			const resp = await fetch('/api/reservas/confirmar-reserva', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ id_paciente: idPaciente, fecha_actual: fecha }),
			});

			const data = await resp.json();
			if (!resp.ok) {
				let customMsg = data.message;
				if (data.message === 'Solo se puede confirmar la reserva el día de inicio.') {
					customMsg = 'Solo puedes confirmar la reserva el mismo día de inicio. Por favor, intenta el día correspondiente.';
				}
				throw new Error(customMsg);
			}

			Swal.fire('Éxito', data.message, 'success');

			$(`#egreso-${id}`).prop('disabled', false).removeAttr('title');
			$(`#motivoEgr-${id}`).prop('disabled', false).removeAttr('title');
		} catch (err) {
			Swal.fire('Error', err.message || 'Error al confirmar', 'error');
		}
	});

	// Cancelar reserva
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

	// Inicial
	cargarReservas();
});
