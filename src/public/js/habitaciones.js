$(document).ready(function () {
	console.log('Inicializando DataTable para habitaciones...');

	const tabla = $('#tablaHabitacion');
	if (tabla.length) {
		fetch('/api/habitaciones')
			.then((response) => response.json())
			.then((habitaciones) => {
				const dataSet = habitaciones.map((hab) => [
					hab.num,
					hab.id_sector || 'Sin sector',  // Puedes mejorar con JOIN o mostrar nombre del sector
					hab.estado === 1 ? 'Disponible' : 'Ocupada',
					`
					<button class="btn btn-sm btn-primary edit-btn" data-id="${hab.id_habitacion}">
						<i class="fas fa-pen"></i>
					</button>
					<button class="btn btn-sm btn-danger delete-btn" data-id="${hab.id_habitacion}">
						<i class="fas fa-trash"></i>
					</button>
					`,
				]);

				const dataTable = tabla.DataTable({
					language: {
						url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json',
					},
					paging: true,
					pageLength: 5,
					searching: true,
					ordering: true,
					data: dataSet,
					columns: [
						{ title: 'Número' },
						{ title: 'Sector' },
						{ title: 'Estado' },
						{ title: 'Acciones', orderable: false, searchable: false },
					],
				});

				dataTable.on('draw', function () {
					const info = dataTable.page.info();
					if (info.recordsDisplay === 0) {
						if ($('#btnAgregarHabitacion').length === 0) {
							$('#tablaHabitacion_wrapper').append(`
								<div class="text-center mt-3">
									<button id="btnAgregarHabitacion" class="btn btn-success">
										Agregar Nueva Habitación
									</button>
								</div>
							`);
						}
					} else {
						$('#btnAgregarHabitacion').remove();
					}
				});
			})
			.catch((error) => {
				console.error('Error al cargar habitaciones:', error);
				Swal.fire('Error', 'No se pudo cargar las habitaciones.', 'error');
			});
	} else {
		console.warn('Tabla #tablaHabitacion no encontrada.');
	}

	// 🔸 Botón emergente para agregar habitación
	$(document).on('click', '#btnAgregarHabitacion', function () {
		Swal.fire({
			title: 'Agregar Habitación',
			html:
				'<input id="num" class="swal2-input" placeholder="Número">' +
				'<input id="id_sector" class="swal2-input" placeholder="ID Sector (opcional)">' +
				'<select id="estado" class="swal2-input">' +
				'<option value="1" selected>Disponible</option>' +
				'<option value="0">Ocupada</option>' +
				'</select>',
			showCancelButton: true,
			confirmButtonText: 'Guardar',
			preConfirm: () => {
				const num = document.getElementById('num').value.trim();
				const id_sector = document.getElementById('id_sector').value.trim() || null;
				const estado = document.getElementById('estado').value;
				if (!num) {
					Swal.showValidationMessage('El número es obligatorio');
				}
				return { num, id_sector, estado };
			},
		}).then((result) => {
			if (result.isConfirmed) {
				fetch('/api/habitaciones', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(result.value),
				})
					.then(() =>
						Swal.fire('Guardado', 'Habitación creada', 'success').then(() =>
							location.reload()
						)
					)
					.catch(() =>
						Swal.fire('Error', 'No se pudo crear la habitación', 'error')
					);
			}
		});
	});

	// 🔸 Capturar submit del formulario superior
	$('form').on('submit', function (e) {
		e.preventDefault();
		const num = $('#num').val().trim();
		const id_sector = $('#id_sector').val().trim() || null;
		const estado = $('#estado').val();

		if (!num) {
			Swal.fire('Error', 'El número de la habitación es obligatorio', 'error');
			return;
		}

		fetch('/api/habitaciones', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ num, id_sector, estado }),
		})
			.then((response) => {
				if (!response.ok) throw new Error('No se pudo crear la habitación');
				return response.json();
			})
			.then(() =>
				Swal.fire('Guardado', 'Habitación creada con éxito', 'success').then(() =>
					location.reload()
				)
			)
			.catch(() =>
				Swal.fire('Error', 'No se pudo crear la habitación', 'error')
			);
	});

	// 🔸 Editar habitación
	$(document).on('click', '.edit-btn', function () {
		const id = $(this).data('id');
		fetch(`/api/habitaciones/${id}`)
			.then((res) => res.json())
			.then((hab) => {
				Swal.fire({
					title: 'Editar Habitación',
					html:
						`<input id="num" class="swal2-input" placeholder="Número" value="${hab.num}">` +
						`<input id="id_sector" class="swal2-input" placeholder="ID Sector" value="${hab.id_sector || ''}">` +
						`<select id="estado" class="swal2-input">
							<option value="1" ${hab.estado === 1 ? 'selected' : ''}>Disponible</option>
							<option value="0" ${hab.estado === 0 ? 'selected' : ''}>Ocupada</option>
						</select>`,
					showCancelButton: true,
					confirmButtonText: 'Guardar',
					preConfirm: () => {
						const num = document.getElementById('num').value.trim();
						const id_sector = document.getElementById('id_sector').value.trim() || null;
						const estado = document.getElementById('estado').value;
						if (!num) {
							Swal.showValidationMessage('El número es obligatorio');
						}
						return { num, id_sector, estado };
					},
				}).then((result) => {
					if (result.isConfirmed) {
						fetch(`/api/habitaciones/${id}`, {
							method: 'PUT',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify(result.value),
						})
							.then(() =>
								Swal.fire('Actualizado', 'Habitación modificada', 'success').then(() =>
									location.reload()
								)
							)
							.catch(() =>
								Swal.fire('Error', 'No se pudo actualizar la habitación', 'error')
							);
					}
				});
			});
	});

	// 🔸 Eliminar habitación
	$(document).on('click', '.delete-btn', function () {
		const id = $(this).data('id');
		Swal.fire({
			title: '¿Eliminar habitación?',
			text: 'Esta acción eliminará la habitación permanentemente.',
			icon: 'warning',
			showCancelButton: true,
			confirmButtonText: 'Sí, eliminar',
			cancelButtonText: 'Cancelar',
		}).then((result) => {
			if (result.isConfirmed) {
				fetch(`/api/habitaciones/${id}`, { method: 'DELETE' })
					.then(() =>
						Swal.fire('Eliminado', 'Habitación eliminada', 'success').then(() =>
							location.reload()
						)
					)
					.catch(() =>
						Swal.fire('Error', 'No se pudo eliminar la habitación', 'error')
					);
			}
		});
	});
});
