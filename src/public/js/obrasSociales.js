$(document).ready(function () {
	const tabla = $('#tablaObraSocial');
	if (tabla.length) {
		fetch('/api/obras-sociales') // 🟢 Corrección ruta
			.then((response) => response.json())
			.then((obras) => {
				const dataSet = obras.map((obra) => [
					obra.nombre,
					`
          <button class="btn btn-sm btn-primary edit-btn" data-id="${obra.id_obra_social}">
            <i class="fas fa-pen"></i>
          </button>
          <button class="btn btn-sm btn-danger delete-btn" data-id="${obra.id_obra_social}">
            <i class="fas fa-trash"></i>
          </button>
          `,
				]);

				const dataTable = tabla.DataTable({
					language: { url: 'https://cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json' },
					paging: true,
					pageLength: 10,
					searching: true,
					ordering: true,  
					destroy: true,
					responsive: true,
					scrollX: false,
					columns: [
						{ title: 'Nombre' },
						{ title: 'Acciones', orderable: false, searchable: false },
					],
				});

				dataTable.on('draw', function () {
					const info = dataTable.page.info();
					if (info.recordsDisplay === 0) {
						if ($('#btnAgregarObraSocial').length === 0) {
							$('#tablaObraSocial_wrapper').append(`
                <div class="text-center mt-3">
                  <button id="btnAgregarObraSocial" class="btn btn-success">
                    Agregar Nueva Obra Social
                  </button>
                </div>
              `);
						}
					} else {
						$('#btnAgregarObraSocial').remove();
					}
				});
			})
			.catch((error) => {
				Swal.fire('Error', 'No se pudo cargar las obras sociales.', 'error');
			});
	}

	// 🔸 Agregar obra social con SweetAlert
	$(document).on('click', '#btnAgregarObraSocial', function () {
		Swal.fire({
			title: 'Agregar Obra Social',
			input: 'text',
			inputLabel: 'Nombre de la obra social',
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
				fetch('/api/obras-sociales', {
					// 🟢 Corrección ruta
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(result.value),
				})
					.then(() =>
						Swal.fire('Guardado', 'Obra social creada', 'success').then(() =>
							location.reload()
						)
					)
					.catch(() =>
						Swal.fire('Error', 'No se pudo crear la obra social', 'error')
					);
			}
		});
	});

	// 🔸 Editar obra social
	$(document).on('click', '.edit-btn', function () {
		const id = $(this).data('id');
		fetch(`/api/obras-sociales/${id}`) // 🟢 Corrección ruta
			.then((res) => res.json())
			.then((obra) => {
				Swal.fire({
					title: 'Editar Obra Social',
					input: 'text',
					inputLabel: 'Nombre de la obra social',
					inputValue: obra.nombre,
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
						fetch(`/api/obras-sociales/${id}`, {
							// 🟢 Corrección ruta
							method: 'PUT',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify(result.value),
						})
							.then(() =>
								Swal.fire(
									'Actualizado',
									'Obra social modificada',
									'success'
								).then(() => location.reload())
							)
							.catch(() =>
								Swal.fire('Error', 'No se pudo actualizar', 'error')
							);
					}
				});
			});
	});

	// 🔸 Eliminar obra social
	$(document).on('click', '.delete-btn', function () {
		const id = $(this).data('id');
		Swal.fire({
			title: '¿Eliminar obra social?',
			text: 'Esta acción eliminará la obra social permanentemente.',
			icon: 'warning',
			showCancelButton: true,
			confirmButtonText: 'Sí, eliminar',
			cancelButtonText: 'Cancelar',
		}).then((result) => {
			if (result.isConfirmed) {
				fetch(`/api/obras-sociales/${id}`, { method: 'DELETE' }) // 🟢 Corrección ruta
					.then(() =>
						Swal.fire('Eliminado', 'Obra social eliminada', 'success').then(
							() => location.reload()
						)
					)
					.catch(() => Swal.fire('Error', 'No se pudo eliminar', 'error'));
			}
		});
	});
});
