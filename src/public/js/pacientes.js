$(document).ready(function () {
	console.log('Inicializando DataTable para camas...');

	const tabla = $('#tablaCamas');
	if (tabla.length) {
		fetch('/api/camas')
			.then((response) => response.json())
			.then((camas) => {
				const dataSet = (Array.isArray(camas) ? camas : []).map((cama) => [
					cama.id_cama,
					cama.nombre,
					cama.id_habitacion,
					cama.desinfeccion
						? '<span class="badge bg-success">Sí</span>'
						: '<span class="badge bg-secondary">No</span>',
					cama.estado
						? '<span class="badge bg-success">Ocupada</span>'
						: '<span class="badge bg-secondary">Disponible</span>',
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
						{ title: 'ID Cama' },
						{ title: 'Nombre' },
						{ title: 'Habitación' },
						{ title: 'Desinfección' },
						{ title: 'Estado' },
						{ title: 'Acciones', orderable: false, searchable: false },
					],
				});

				// Detectar si la búsqueda no tiene resultados y mostrar botón para agregar cama
				dataTable.on('draw', function () {
					const noResults =
						dataTable.rows({ filter: 'applied' }).data().length === 0;
					$('#btnAgregarCama').remove();
					if (noResults) {
						$('<button>')
							.attr('id', 'btnAgregarCama')
							.addClass('btn btn-success mt-3')
							.text('Agregar Nueva Cama')
							.appendTo('#tablaCamas_wrapper')
							.on('click', abrirSwalNuevaCama);
					}
				});
			})
			.catch((error) => {
				console.error('Error al cargar camas:', error);
				Swal.fire('Error', 'No se pudo cargar las camas.', 'error');
			});
	} else {
		console.warn('Tabla #tablaCamas no encontrada.');
	}

	// Función para abrir Swal de nueva cama
	function abrirSwalNuevaCama() {
		Swal.fire({
			title: 'Agregar Cama',
			html:
				'<input id="nombre" class="swal2-input" placeholder="Nombre">' +
				'<input id="id_habitacion" class="swal2-input" placeholder="ID Habitación" type="number">' +
				'<select id="desinfeccion" class="swal2-input"><option value="1">Sí</option><option value="0">No</option></select>' +
				'<select id="estado" class="swal2-input"><option value="1">Ocupada</option><option value="0">Disponible</option></select>',
			preConfirm: () => {
				const nombre = $('#nombre').val();
				const id_habitacion = $('#id_habitacion').val();
				const desinfeccion = $('#desinfeccion').val();
				const estado = $('#estado').val();
				if (!nombre || !id_habitacion) {
					Swal.showValidationMessage('Todos los campos son obligatorios');
				}
				return {
					nombre,
					id_habitacion,
					desinfeccion,
					estado,
				};
			},
			showCancelButton: true,
			confirmButtonText: 'Guardar',
		}).then((result) => {
			if (result.isConfirmed) {
				fetch('/api/camas', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(result.value),
				})
					.then((res) => {
						if (!res.ok) throw new Error('Error');
						return res.json();
					})
					.then(() =>
						Swal.fire('Guardado', 'Cama creada', 'success').then(() =>
							location.reload()
						)
					)
					.catch(() => Swal.fire('Error', 'No se pudo crear Cama', 'error'));
			}
		});
	}

	// Delegar el click para el botón de agregar cama (por si hay camas)
	$(document).on('click', '#btnAgregarCama', abrirSwalNuevaCama);

	// Editar cama
	$(document).on('click', '.edit-btn', function () {
		const id = $(this).data('id');
		fetch(`/api/camas/${id}`)
			.then((res) => res.json())
			.then((cama) => {
				Swal.fire({
					title: 'Editar Cama',
					html:
						`<input id="nombre" class="swal2-input" value="${cama.nombre}" placeholder="Nombre">` +
						`<input id="id_habitacion" class="swal2-input" value="${cama.id_habitacion}" placeholder="ID Habitación" type="number">` +
						`<select id="desinfeccion" class="swal2-input">
                            <option value="1" ${
															cama.desinfeccion ? 'selected' : ''
														}>Sí</option>
                            <option value="0" ${
															!cama.desinfeccion ? 'selected' : ''
														}>No</option>
                        </select>` +
						`<select id="estado" class="swal2-input">
                            <option value="1" ${
															cama.estado ? 'selected' : ''
														}>Ocupada</option>
                            <option value="0" ${
															!cama.estado ? 'selected' : ''
														}>Disponible</option>
                        </select>`,
					preConfirm: () => {
						const nombre = $('#nombre').val();
						const id_habitacion = $('#id_habitacion').val();
						const desinfeccion = $('#desinfeccion').val();
						const estado = $('#estado').val();
						if (!nombre || !id_habitacion) {
							Swal.showValidationMessage('Todos los campos son obligatorios');
						}
						return {
							nombre,
							id_habitacion,
							desinfeccion,
							estado,
						};
					},
					showCancelButton: true,
					confirmButtonText: 'Guardar',
				}).then((result) => {
					if (result.isConfirmed) {
						fetch(`/api/camas/${id}`, {
							method: 'PUT',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify(result.value),
						})
							.then((res) => {
								if (!res.ok) throw new Error('Error');
								return res.text();
							})
							.then(() =>
								Swal.fire(
									'Actualizado',
									'Cama modificada con éxito',
									'success'
								).then(() => location.reload())
							)
							.catch(() =>
								Swal.fire('Error', 'No se pudo actualizar la cama', 'error')
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
					.then((res) => {
						if (!res.ok) throw new Error('Error');
						return res.text();
					})
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
