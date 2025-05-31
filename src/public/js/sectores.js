$(document).ready(function () {
	console.log('Inicializando DataTable para sectores...');

	const tabla = $('#tablaSector');
	if (tabla.length) {
		fetch('/api/sectores')
			.then((response) => response.json())
			.then((sectores) => {
				const dataSet = sectores.map((sec) => [
					sec.nombre,
					`
					<button class="btn btn-sm btn-primary edit-btn" data-id="${sec.id_sector}">
						<i class="fas fa-pen"></i>
					</button>
					<button class="btn btn-sm btn-danger delete-btn" data-id="${sec.id_sector}">
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

				// Botón para agregar nuevo sector si no hay resultados
				dataTable.on('draw', function () {
					const info = dataTable.page.info();
					if (info.recordsDisplay === 0) {
						if ($('#btnAgregarSector').length === 0) {
							$('#tablaSector_wrapper').append(`
								<div class="text-center mt-3">
									<button id="btnAgregarSector" class="btn btn-success">
										Agregar Nuevo Sector
									</button>
								</div>
							`);
						}
					} else {
						$('#btnAgregarSector').remove();
					}
				});
			})
			.catch((error) => {
				console.error('Error al cargar sectores:', error);
				Swal.fire('Error', 'No se pudo cargar los sectores.', 'error');
			});
	} else {
		console.warn('Tabla #tablaSector no encontrada.');
	}

	// Agregar nuevo sector
	$(document).on('click', '#btnAgregarSector', function () {
		Swal.fire({
			title: 'Agregar Sector',
			input: 'text',
			inputLabel: 'Nombre del sector',
			inputPlaceholder: 'Ingrese el nombre del sector',
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
				fetch('/api/sectores', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(result.value),
				})
					.then(() =>
						Swal.fire('Guardado', 'Sector creado', 'success').then(() =>
							location.reload()
						)
					)
					.catch(() =>
						Swal.fire('Error', 'No se pudo crear el sector', 'error')
					);
			}
		});
	});

	// Editar sector
	$(document).on('click', '.edit-btn', function () {
		const id = $(this).data('id');
		fetch(`/api/sectores/${id}`)
			.then((res) => res.json())
			.then((sector) => {
				Swal.fire({
					title: 'Editar Sector',
					input: 'text',
					inputLabel: 'Nombre del sector',
					inputValue: sector.nombre,
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
						fetch(`/api/sectores/${id}`, {
							method: 'PUT',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify(result.value),
						})
							.then(() =>
								Swal.fire('Actualizado', 'Sector modificado', 'success').then(() =>
									location.reload()
								)
							)
							.catch(() =>
								Swal.fire('Error', 'No se pudo actualizar el sector', 'error')
							);
					}
				});
			});
	});

	// Eliminar sector
	$(document).on('click', '.delete-btn', function () {
		const id = $(this).data('id');
		Swal.fire({
			title: '¿Eliminar sector?',
			text: 'Esta acción eliminará el sector permanentemente.',
			icon: 'warning',
			showCancelButton: true,
			confirmButtonText: 'Sí, eliminar',
			cancelButtonText: 'Cancelar',
		}).then((result) => {
			if (result.isConfirmed) {
				fetch(`/api/sectores/${id}`, { method: 'DELETE' })
					.then(() =>
						Swal.fire('Eliminado', 'Sector eliminado', 'success').then(() =>
							location.reload()
						)
					)
					.catch(() =>
						Swal.fire('Error', 'No se pudo eliminar el sector', 'error')
					);
			}
		});
	});
});
