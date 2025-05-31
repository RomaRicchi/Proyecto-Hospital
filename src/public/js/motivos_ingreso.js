$(document).ready(function () {
	console.log('Inicializando DataTable para motivos de ingreso...');

	const tabla = $('#tablaMotivoIngreso');
	if (tabla.length) {
		fetch('/api/motivos_ingreso')
			.then((response) => response.json())
			.then((motivos) => {
				const dataSet = motivos.map((m) => [
					m.id_motivo,
					m.tipo,
					`
					<button class="btn btn-sm btn-primary edit-btn" data-id="${m.id_motivo}">
						<i class="fas fa-pen"></i>
					</button>
					<button class="btn btn-sm btn-danger delete-btn" data-id="${m.id_motivo}">
						<i class="fas fa-trash"></i>
					</button>
					`,
				]);

				const dataTable = tabla.DataTable({
					language: { url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json' },
					paging: true, pageLength: 5, searching: true, ordering: true,
					data: dataSet,
					columns: [
						{ title: 'ID' },
						{ title: 'Tipo' },
						{ title: 'Acciones', orderable: false, searchable: false },
					],
				});

				dataTable.on('draw', function () {
					const info = dataTable.page.info();
					if (info.recordsDisplay === 0) {
						if ($('#btnAgregarMotivo').length === 0) {
							$('#tablaMotivoIngreso_wrapper').append(`
								<div class="text-center mt-3">
									<button id="btnAgregarMotivo" class="btn btn-success">
										Agregar Nuevo Motivo
									</button>
								</div>
							`);
						}
					} else {
						$('#btnAgregarMotivo').remove();
					}
				});
			})
			.catch((error) => {
				console.error('Error al cargar motivos:', error);
				Swal.fire('Error', 'No se pudo cargar los motivos.', 'error');
			});
	}

	// 🔸 Botón emergente "Agregar Motivo"
	$(document).on('click', '#btnAgregarMotivo', function () {
		Swal.fire({
			title: 'Agregar Motivo',
			input: 'text',
			inputLabel: 'Tipo de motivo',
			inputPlaceholder: 'Ingrese el tipo',
			showCancelButton: true,
			confirmButtonText: 'Guardar',
			preConfirm: (tipo) => {
				if (!tipo) {
					Swal.showValidationMessage('El tipo es obligatorio');
				}
				return { tipo };
			},
		}).then((result) => {
			if (result.isConfirmed) {
				fetch('/api/motivos_ingreso', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(result.value),
				})
					.then(() => Swal.fire('Guardado', 'Motivo creado', 'success').then(() => location.reload()))
					.catch(() => Swal.fire('Error', 'No se pudo crear el motivo', 'error'));
			}
		});
	});


	// 🔸 Editar motivo
	$(document).on('click', '.edit-btn', function () {
		const id = $(this).data('id');
		fetch(`/api/motivos_ingreso/${id}`)
			.then((res) => res.json())
			.then((m) => {
				Swal.fire({
					title: 'Editar Motivo',
					input: 'text',
					inputValue: m.tipo,
					showCancelButton: true,
					confirmButtonText: 'Guardar',
					preConfirm: (tipo) => {
						if (!tipo) {
							Swal.showValidationMessage('El tipo es obligatorio');
						}
						return { tipo };
					},
				}).then((result) => {
					if (result.isConfirmed) {
						fetch(`/api/motivos_ingreso/${id}`, {
							method: 'PUT',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify(result.value),
						})
							.then(() => Swal.fire('Actualizado', 'Motivo modificado', 'success').then(() => location.reload()))
							.catch(() => Swal.fire('Error', 'No se pudo actualizar el motivo', 'error'));
					}
				});
			});
	});

	// 🔸 Eliminar motivo
	$(document).on('click', '.delete-btn', function () {
		const id = $(this).data('id');
		Swal.fire({
			title: '¿Eliminar motivo?',
			text: 'Esta acción eliminará el motivo permanentemente.',
			icon: 'warning',
			showCancelButton: true,
			confirmButtonText: 'Sí, eliminar',
			cancelButtonText: 'Cancelar',
		}).then((result) => {
			if (result.isConfirmed) {
				fetch(`/api/motivos_ingreso/${id}`, { method: 'DELETE' })
					.then(() => Swal.fire('Eliminado', 'Motivo eliminado', 'success').then(() => location.reload()))
					.catch(() => Swal.fire('Error', 'No se pudo eliminar el motivo', 'error'));
			}
		});
	});
});
