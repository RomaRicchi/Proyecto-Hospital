$(document).ready(function () {
	console.log('Inicializando DataTable para localidades...');

	const tabla = $('#tablaLocalidades');
	if (tabla.length) {
		fetch('/api/localidades')
			.then((response) => response.json())
			.then((localidades) => {
				const dataSet = localidades.map((loc) => [
					loc.nombre,
					`
					<button class="btn btn-sm btn-primary edit-btn" data-id="${loc.id_localidad}">
						<i class="fas fa-pen"></i>
					</button>
					<button class="btn btn-sm btn-danger delete-btn" data-id="${loc.id_localidad}">
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
						{ title: 'Nombre' },
						{ title: 'Acciones', orderable: false, searchable: false },
					],
				});

				// Botón para agregar nueva localidad si no hay resultados
				dataTable.on('draw', function () {
					const info = dataTable.page.info();
					if (info.recordsDisplay === 0) {
						if ($('#btnAgregarLocalidad').length === 0) {
							$('#tablaLocalidades_wrapper').append(`
								<div class="text-center mt-3">
									<button id="btnAgregarLocalidad" class="btn btn-success">
										Agregar Nueva Localidad
									</button>
								</div>
							`);
						}
					} else {
						$('#btnAgregarLocalidad').remove();
					}
				});
			})
			.catch((error) => {
				console.error('Error al cargar localidades:', error);
				Swal.fire('Error', 'No se pudo cargar las localidades.', 'error');
			});
	} else {
		console.warn('Tabla #tablaLocalidades no encontrada.');
	}

	// Agregar nueva localidad
	$(document).on('click', '#btnAgregarLocalidad', function () {
		Swal.fire({
			title: 'Agregar Localidad',
			input: 'text',
			inputLabel: 'Nombre de la localidad',
			inputPlaceholder: 'Ingrese el nombre de la localidad',
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
				fetch('/api/localidades', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(result.value),
				})
					.then(() =>
						Swal.fire('Guardado', 'Localidad creada', 'success').then(() =>
							location.reload()
						)
					)
					.catch(() =>
						Swal.fire('Error', 'No se pudo crear la localidad', 'error')
					);
			}
		});
	});

	// Editar localidad
	$(document).on('click', '.edit-btn', function () {
		const id = $(this).data('id');
		fetch(`/api/localidades/${id}`)
			.then((res) => res.json())
			.then((localidad) => {
				Swal.fire({
					title: 'Editar Localidad',
					input: 'text',
					inputLabel: 'Nombre de la localidad',
					inputValue: localidad.nombre,
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
						fetch(`/api/localidades/${id}`, {
							method: 'PUT',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify(result.value),
						})
							.then(() =>
								Swal.fire(
									'Actualizado',
									'Localidad modificada',
									'success'
								).then(() => location.reload())
							)
							.catch(() =>
								Swal.fire(
									'Error',
									'No se pudo actualizar la localidad',
									'error'
								)
							);
					}
				});
			});
	});

	// 🔴 Eliminar localidad
	$(document).on('click', '.delete-btn', function () {
		const id = $(this).data('id');
		Swal.fire({
			title: '¿Eliminar localidad?',
			text: 'Esta acción eliminará la localidad permanentemente.',
			icon: 'warning',
			showCancelButton: true,
			confirmButtonText: 'Sí, eliminar',
			cancelButtonText: 'Cancelar',
		}).then((result) => {
			if (result.isConfirmed) {
				fetch(`/api/localidades/${id}`, { method: 'DELETE' })
					.then(() =>
						Swal.fire('Eliminado', 'Localidad eliminada', 'success').then(() =>
							location.reload()
						)
					)
					.catch(() =>
						Swal.fire('Error', 'No se pudo eliminar la localidad', 'error')
					);
			}
		});
	});
});
