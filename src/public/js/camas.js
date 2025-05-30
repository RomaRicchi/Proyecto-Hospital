$(document).ready(function () {
	console.log('Inicializando DataTable para camas...');

	const tabla = $('#tablaCama');
	if (tabla.length) {
		fetch('/api/camas')
			.then((response) => response.json())
			.then((camas) => {
				const dataSet = camas.map((cama) => [
					cama.nombre,
					`
					<button class="btn btn-sm btn-primary edit-btn" data-id="${cama.id_cama}">
						<i class="fas fa-pen"></i>
					</button>
					<button class="btn btn-sm btn-danger delete-btn" data-id="${cama.id_cama}">
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

				// Botón para agregar nueva cama si no hay resultados
				dataTable.on('draw', function () {
					const info = dataTable.page.info();
					if (info.recordsDisplay === 0) {
						if ($('#btnAgregarCama').length === 0) {
							$('#tablaCama_wrapper').append(`
								<div class="text-center mt-3">
									<button id="btnAgregarCama" class="btn btn-success">
										Agregar Nueva Cama
									</button>
								</div>
							`);
						}
					} else {
						$('#btnAgregarCama').remove();
					}
				});
			})
			.catch((error) => {
				console.error('Error al cargar camas:', error);
				Swal.fire('Error', 'No se pudo cargar las camas.', 'error');
			});
	} else {
		console.warn('Tabla #tablaCama no encontrada.');
	}

	// Agregar cama (botón emergente)
	$(document).on('click', '#btnAgregarCama', function () {
		Swal.fire({
			title: 'Agregar Cama',
			input: 'text',
			inputLabel: 'Nombre de la Cama',
			inputPlaceholder: 'Ingrese el nombre de la Cama',
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
				fetch('/api/camas', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(result.value),
				})
					.then(() =>
						Swal.fire('Guardado', 'Cama creada', 'success').then(() =>
							location.reload()
						)
					)
					.catch(() =>
						Swal.fire('Error', 'No se pudo crear Cama', 'error')
					);
			}
		});
	});

	// Editar cama
	$(document).on('click', '.edit-btn', function () {
		const id = $(this).data('id');
		fetch(`/api/camas/${id}`)
			.then((res) => res.json())
			.then((cama) => {
				Swal.fire({
					title: 'Editar Cama',
					input: 'text',
					inputLabel: 'Nombre de la cama',
					inputValue: cama.nombre,
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
						fetch(`/api/camas/${id}`, {
							method: 'PUT',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify(result.value),
						})
							.then(() =>
								Swal.fire(
									'Actualizado',
									'Cama modificada con éxito',
									'success'
								).then(() => location.reload())
							)
							.catch(() =>
								Swal.fire(
									'Error',
									'No se pudo actualizar la cama',
									'error'
								)
							);
					}
				});
			});
	});

	// Eliminar cama
	$(document).on('click', '.delete-btn', function () {
		const id = $(this).data('id');
		Swal.fire({
			title: '¿Eliminar cama?',
			text: 'Esta acción eliminará la cama permanentemente.',
			icon: 'warning',
			showCancelButton: true,
			confirmButtonText: 'Sí, eliminar',
			cancelButtonText: 'Cancelar',
		}).then((result) => {
			if (result.isConfirmed) {
				fetch(`/api/camas/${id}`, { method: 'DELETE' })
					.then(() =>
						Swal.fire('Eliminado', 'Cama eliminada', 'success').then(() =>
							location.reload()
						)
					)
					.catch(() =>
						Swal.fire('Error', 'No se pudo eliminar la cama', 'error')
					);
			}
		});
	});
});
// 🔸 Capturar el submit del formulario de agregar sector
	$('form').on('submit', function (e) {
		e.preventDefault();  // Evitar recarga de la página

		const nombre = $('#nombre').val().trim();
		if (!nombre) {
			Swal.fire('Error', 'El nombre de la cama obligatorio', 'error');
			return;
		}

		fetch('/api/camas', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ nombre })
		})
		.then(response => {
			if (!response.ok) throw new Error('No se pudo crear la cama');
			return response.json();
		})
		.then(() => {
			Swal.fire('Guardado', ' Cama creada con éxito', 'success')
				.then(() => location.reload());  // Recargar página para actualizar tabla
		})
		.catch(() => {
			Swal.fire('Error', 'No se pudo crear la cama', 'error');
		});
	});
