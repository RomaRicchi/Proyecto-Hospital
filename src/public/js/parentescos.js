$(document).ready(function () {
	console.log('Inicializando DataTable para parentescos...');

	const tabla = $('#tablaParentesco');
	if (tabla.length) {
		fetch('/api/parentescos')
			.then((response) => response.json())
			.then((parentescos) => {
				const dataSet = parentescos.map((p) => [
					p.id_parentesco,
					p.nombre,
					`
					<button class="btn btn-sm btn-primary edit-btn" data-id="${p.id_parentesco}">
						<i class="fas fa-pen"></i>
					</button>
					<button class="btn btn-sm btn-danger delete-btn" data-id="${p.id_parentesco}">
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
						{ title: 'Nombre' },
						{ title: 'Acciones', orderable: false, searchable: false },
					],
				});

				dataTable.on('draw', function () {
					const info = dataTable.page.info();
					if (info.recordsDisplay === 0) {
						if ($('#btnAgregarParentesco').length === 0) {
							$('#tablaParentesco_wrapper').append(`
								<div class="text-center mt-3">
									<button id="btnAgregarParentesco" class="btn btn-success">
										Agregar Nuevo Parentesco
									</button>
								</div>
							`);
						}
					} else {
						$('#btnAgregarParentesco').remove();
					}
				});
			})
			.catch((error) => {
				console.error('Error al cargar parentescos:', error);
				Swal.fire('Error', 'No se pudo cargar los parentescos.', 'error');
			});
	}

	// 🔸 Botón emergente "Agregar Parentesco"
	$(document).on('click', '#btnAgregarParentesco', function () {
		Swal.fire({
			title: 'Agregar Parentesco',
			input: 'text',
			inputLabel: 'Nombre del parentesco',
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
				fetch('/api/parentescos', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(result.value),
				})
					.then(() => Swal.fire('Guardado', 'Parentesco creado', 'success').then(() => location.reload()))
					.catch(() => Swal.fire('Error', 'No se pudo crear el parentesco', 'error'));
			}
		});
	});

	// 🔸 Formulario superior de agregar parentesco
	$('form').on('submit', function (e) {
		e.preventDefault();  // Evitar recarga
		const nombre = $('#nombre').val().trim();

		if (!nombre) {
			Swal.fire('Error', 'El nombre del parentesco es obligatorio', 'error');
			return;
		}

		fetch('/api/parentescos', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ nombre }),
		})
			.then((response) => {
				if (!response.ok) throw new Error('No se pudo crear el parentesco');
				return response.json();
			})
			.then(() =>
				Swal.fire('Guardado', 'Parentesco creado con éxito', 'success').then(() =>
					location.reload()
				)
			)
			.catch(() => Swal.fire('Error', 'No se pudo crear el parentesco', 'error'));
	});

	// 🔸 Editar parentesco
	$(document).on('click', '.edit-btn', function () {
		const id = $(this).data('id');
		fetch(`/api/parentescos/${id}`)
			.then((res) => res.json())
			.then((p) => {
				Swal.fire({
					title: 'Editar Parentesco',
					input: 'text',
					inputValue: p.nombre,
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
						fetch(`/api/parentescos/${id}`, {
							method: 'PUT',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify(result.value),
						})
							.then(() => Swal.fire('Actualizado', 'Parentesco modificado', 'success').then(() => location.reload()))
							.catch(() => Swal.fire('Error', 'No se pudo actualizar el parentesco', 'error'));
					}
				});
			});
	});

	// 🔸 Eliminar parentesco
	$(document).on('click', '.delete-btn', function () {
		const id = $(this).data('id');
		Swal.fire({
			title: '¿Eliminar parentesco?',
			text: 'Esta acción eliminará el parentesco permanentemente.',
			icon: 'warning',
			showCancelButton: true,
			confirmButtonText: 'Sí, eliminar',
			cancelButtonText: 'Cancelar',
		}).then((result) => {
			if (result.isConfirmed) {
				fetch(`/api/parentescos/${id}`, { method: 'DELETE' })
					.then(() => Swal.fire('Eliminado', 'Parentesco eliminado', 'success').then(() => location.reload()))
					.catch(() => Swal.fire('Error', 'No se pudo eliminar el parentesco', 'error'));
			}
		});
	});
});
