$(document).ready(function () {
	console.log('Inicializando DataTable para habitaciones...');

	const tabla = $('#tablaHabitacion');
	if (tabla.length) {
		fetch('/api/habitaciones')
			.then((response) => response.json())
			.then((habitaciones) => {
				const dataSet = habitaciones.map((h) => [
					h.num,
					h.camas?.map((c) => c.nombre).join(', ') || 'Sin camas',
					h.sector?.nombre || 'Sin sector',
					`
                    <button class="btn btn-sm btn-primary edit-btn" data-id="${h.id_habitacion}">
                        <i class="fas fa-pen"></i>
                    </button>
                    <button class="btn btn-sm btn-danger delete-btn" data-id="${h.id_habitacion}">
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
						{ title: 'Camas' },
						{ title: 'Sector' },
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
				Swal.fire('Error', 'No se pudieron cargar las habitaciones.', 'error');
			});
	}

	// 🔸 Botón Agregar
	$(document).on('click', '#btnAgregarHabitacion', async function () {
		try {
			const sectores = await fetch('/api/sectores').then((r) => r.json());

			const sectorOptions = sectores
				.map((s) => `<option value="${s.id_sector}">${s.nombre}</option>`)
				.join('');

			Swal.fire({
				title: 'Agregar Habitación',
				html: `
                    <input id="swal-num" class="swal2-input" placeholder="Número">
                    <select id="swal-sector" class="swal2-input"><option value="">(Opcional) Sector</option>${sectorOptions}</select>
                `,
				showCancelButton: true,
				confirmButtonText: 'Guardar',
				preConfirm: () => {
					const num = $('#swal-num').val().trim();
					if (!num) {
						Swal.showValidationMessage('El número es obligatorio');
						return false;
					}
					return {
						num,
						id_sector: $('#swal-sector').val() || null,
					};
				},
			}).then((result) => {
				if (result.isConfirmed) {
					fetch('/api/habitaciones', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify(result.value),
					})
						.then(() =>
							Swal.fire('Agregado', 'Habitación creada', 'success').then(() =>
								location.reload()
							)
						)
						.catch(() => Swal.fire('Error', 'No se pudo crear', 'error'));
				}
			});
		} catch (error) {
			console.error('Error cargando opciones:', error);
			Swal.fire('Error', 'No se pudieron cargar sectores.', 'error');
		}
	});

	// 🔸 Botón Editar
	$(document).on('click', '.edit-btn', async function () {
		const id = $(this).data('id');
		try {
			const [habitacion, sectores] = await Promise.all([
				fetch(`/api/habitaciones/${id}`).then((r) => r.json()),
				fetch('/api/sectores').then((r) => r.json()),
			]);

			const sectorOptions = sectores
				.map(
					(s) =>
						`<option value="${s.id_sector}" ${
							habitacion.id_sector == s.id_sector ? 'selected' : ''
						}>${s.nombre}</option>`
				)
				.join('');

			Swal.fire({
				title: 'Editar Habitación',
				html: `
                    <input id="swal-num" class="swal2-input" placeholder="Número" value="${habitacion.num}">
                    <select id="swal-sector" class="swal2-input"><option value="">(Opcional) Sector</option>${sectorOptions}</select>
                `,
				showCancelButton: true,
				confirmButtonText: 'Guardar',
				preConfirm: () => {
					const num = $('#swal-num').val().trim();
					if (!num) {
						Swal.showValidationMessage('El número es obligatorio');
						return false;
					}
					return {
						num,
						id_sector: $('#swal-sector').val() || null,
					};
				},
			}).then((result) => {
				if (result.isConfirmed) {
					fetch(`/api/habitaciones/${id}`, {
						method: 'PUT',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify(result.value),
					})
						.then(() =>
							Swal.fire('Actualizado', 'Habitación modificada', 'success').then(
								() => location.reload()
							)
						)
						.catch(() => Swal.fire('Error', 'No se pudo actualizar', 'error'));
				}
			});
		} catch (error) {
			console.error('Error al cargar habitación:', error);
			Swal.fire('Error', 'No se pudo cargar la habitación.', 'error');
		}
	});

	// 🔸 Botón Eliminar
	$(document).on('click', '.delete-btn', function () {
		const id = $(this).data('id');
		Swal.fire({
			title: '¿Eliminar habitación?',
			text: 'Esta acción eliminará la habitación.',
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
					.catch(() => Swal.fire('Error', 'No se pudo eliminar', 'error'));
			}
		});
	});
});
