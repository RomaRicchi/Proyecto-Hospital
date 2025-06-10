$(document).ready(function () {
	const tabla = $('#tablaMovimiento');
	if (tabla.length) {
		fetch('/api/movimientos')
			.then((response) => response.json())
			.then((movimientos) => {
				const dataSet = movimientos.map((m) => [
					m.id_mov,
					m.nombre,
					`
          <button class="btn btn-sm btn-primary edit-btn" data-id="${m.id_mov}">
            <i class="fas fa-pen"></i>
          </button>
          <button class="btn btn-sm btn-danger delete-btn" data-id="${m.id_mov}">
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
						{ title: 'ID' },
						{ title: 'Nombre' },
						{ title: 'Acciones', orderable: false, searchable: false },
					],
				});

				// 🔸 Botón emergente "Agregar movimiento" si tabla vacía
				dataTable.on('draw', function () {
					const info = dataTable.page.info();
					if (info.recordsDisplay === 0) {
						if ($('#btnAgregarMovimiento').length === 0) {
							$('#tablaMovimiento_wrapper').append(`
                <div class="text-center mt-3">
                  <button id="btnAgregarMovimiento" class="btn btn-success">
                    Agregar Nuevo Movimiento
                  </button>
                </div>
              `);
						}
					} else {
						$('#btnAgregarMovimiento').remove();
					}
				});
			})
			.catch((error) => {
				Swal.fire('Error', 'No se pudo cargar los movimientos.', 'error');
			});
	}

	// 🔸 Botón emergente "Agregar movimiento"
	$(document).on('click', '#btnAgregarMovimiento', function () {
		Swal.fire({
			title: 'Agregar Movimiento',
			input: 'text',
			inputLabel: 'Nombre del movimiento',
			inputPlaceholder: 'Ingrese el nombre',
			showCancelButton: true,
			confirmButtonText: 'Guardar',
			preConfirm: (nombre) => {
				if (!nombre) {
					Swal.showValidationMessage('El nombre es obligatorio');
				}
				return { nombre };
			},
		}).then((result) => {
			if (result.isConfirmed) {
				fetch('/api/movimientos', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(result.value),
				})
					.then(() =>
						Swal.fire('Guardado', 'Movimiento creado', 'success').then(() =>
							location.reload()
						)
					)
					.catch(() =>
						Swal.fire('Error', 'No se pudo crear el movimiento', 'error')
					);
			}
		});
	});

	// 🔸 Editar movimiento
	$(document).on('click', '.edit-btn', function () {
		const id = $(this).data('id');
		fetch(`/api/movimientos/${id}`)
			.then((res) => res.json())
			.then((m) => {
				Swal.fire({
					title: 'Editar Movimiento',
					input: 'text',
					inputValue: m.nombre,
					showCancelButton: true,
					confirmButtonText: 'Guardar',
					preConfirm: (nombre) => {
						if (!nombre) {
							Swal.showValidationMessage('El nombre es obligatorio');
						}
						return { nombre };
					},
				}).then((result) => {
					if (result.isConfirmed) {
						fetch(`/api/movimientos/${id}`, {
							method: 'PUT',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify(result.value),
						})
							.then(() =>
								Swal.fire(
									'Actualizado',
									'Movimiento modificado',
									'success'
								).then(() => location.reload())
							)
							.catch(() =>
								Swal.fire(
									'Error',
									'No se pudo actualizar el movimiento',
									'error'
								)
							);
					}
				});
			});
	});

	// 🔸 Eliminar movimiento
	$(document).on('click', '.delete-btn', function () {
		const id = $(this).data('id');
		Swal.fire({
			title: '¿Eliminar movimiento?',
			text: 'Esta acción eliminará el movimiento permanentemente.',
			icon: 'warning',
			showCancelButton: true,
			confirmButtonText: 'Sí, eliminar',
			cancelButtonText: 'Cancelar',
		}).then((result) => {
			if (result.isConfirmed) {
				fetch(`/api/movimientos/${id}`, { method: 'DELETE' })
					.then(() =>
						Swal.fire('Eliminado', 'Movimiento eliminado', 'success').then(() =>
							location.reload()
						)
					)
					.catch(() =>
						Swal.fire('Error', 'No se pudo eliminar el movimiento', 'error')
					);
			}
		});
	});
});
