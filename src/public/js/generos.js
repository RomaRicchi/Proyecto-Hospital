$(document).ready(function () {
	console.log('Inicializando DataTable para géneros...');

	const tabla = $('#tablaGenero');
	if (tabla.length) {
		fetch('/api/genero')
			.then((response) => response.json())
			.then((generos) => {
				const dataSet = generos.map((gen) => [
					gen.id_genero,
					gen.nombre,
					`
                    <button class="btn btn-sm btn-primary edit-btn" data-id="${gen.id_genero}">
                        <i class="fas fa-pen"></i>
                    </button>
                    <button class="btn btn-sm btn-danger delete-btn" data-id="${gen.id_genero}">
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

				dataTable.on('draw', function () {
					const info = dataTable.page.info();
					if (info.recordsDisplay === 0) {
						if ($('#btnAgregarGenero').length === 0) {
							$('#tablaGenero_wrapper').append(`
                                <div class="text-center mt-3">
                                    <button id="btnAgregarGenero" class="btn btn-success">
                                        Agregar Nuevo Género
                                    </button>
                                </div>
                            `);
						}
					} else {
						$('#btnAgregarGenero').remove();
					}
				});
			})
			.catch((error) => {
				console.error('Error al cargar géneros:', error);
				Swal.fire('Error', 'No se pudo cargar los géneros.', 'error');
			});
	} else {
		console.warn('Tabla #tablaGenero no encontrada.');
	}

	// Botón para agregar nuevo género
	$(document).on('click', '#btnAgregarGenero', function () {
		Swal.fire({
			title: 'Agregar Género',
			input: 'text',
			inputLabel: 'Nombre del género',
			inputPlaceholder: 'Ingrese el nombre del género',
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
				fetch('/api/genero', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(result.value),
				})
					.then(() =>
						Swal.fire('Guardado', 'Género creado', 'success').then(() =>
							location.reload()
						)
					)
					.catch(() =>
						Swal.fire('Error', 'No se pudo crear el género', 'error')
					);
			}
		});
	});

	// Editar género
	$(document).on('click', '.edit-btn', function () {
		const id = $(this).data('id');
		fetch(`/api/genero/${id}`)
			.then((res) => res.json())
			.then((genero) => {
				Swal.fire({
					title: 'Editar Género',
					input: 'text',
					inputLabel: 'Nombre del género',
					inputValue: genero.nombre,
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
						fetch(`/api/genero/${id}`, {
							method: 'PUT',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify(result.value),
						})
							.then(() =>
								Swal.fire('Actualizado', 'Género modificado', 'success').then(
									() => location.reload()
								)
							)
							.catch(() =>
								Swal.fire('Error', 'No se pudo actualizar el género', 'error')
							);
					}
				});
			});
	});

	// Eliminar género
	$(document).on('click', '.delete-btn', function () {
		const id = $(this).data('id');
		Swal.fire({
			title: '¿Eliminar género?',
			text: 'Esta acción eliminará el género permanentemente.',
			icon: 'warning',
			showCancelButton: true,
			confirmButtonText: 'Sí, eliminar',
			cancelButtonText: 'Cancelar',
		}).then((result) => {
			if (result.isConfirmed) {
				fetch(`/api/genero/${id}`, { method: 'DELETE' })
					.then(() =>
						Swal.fire('Eliminado', 'Género eliminado', 'success').then(() =>
							location.reload()
						)
					)
					.catch(() =>
						Swal.fire('Error', 'No se pudo eliminar el género', 'error')
					);
			}
		});
	});
});
