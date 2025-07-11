import { toUTC, fromUTCToArgentina } from './utils/validacionFechas.js';

$(document).ready(function () {
	
	const hoyLocal = new Date();
	const offset = hoyLocal.getTimezoneOffset();
	hoyLocal.setMinutes(hoyLocal.getMinutes() - offset);
	const hoy = hoyLocal.toISOString().split('T')[0];

	// Establecer fecha mínima
	$('#fecha_ingreso').attr('min', hoy);
	
	const tabla = $('#tablaMovimientosHabitacion');

	if (tabla.length) {
		fetch('/api/movimientos_habitacion')
			.then((response) => {
				if (!response.ok) {
					throw new Error(`HTTP error ${response.status}`);
				}
				return response.json();
			})
			.then((movimientos) => {
				const dataSet = (movimientos || []).map((m) => [
					m.id_movimiento,
					m.admision && m.admision.paciente
						? `${m.admision.paciente.apellido_p}, ${m.admision.paciente.nombre_p}`
						: '-',
					m.habitacion && m.habitacion.num ? m.habitacion.num : '-',
					m.habitacion && m.habitacion.sector
						? m.habitacion.sector.nombre
						: '-',
					m.cama && m.cama.nombre ? m.cama.nombre : m.id_cama || '-', // 👈 Mostrar cama
					m.tipo_movimiento && m.tipo_movimiento.nombre
						? m.tipo_movimiento.nombre
						: '-',
					m.fecha_hora_ingreso ? fromUTCToArgentina(m.fecha_hora_ingreso).toLocaleString('es-AR') : '-',
					m.fecha_hora_egreso || '-',
					m.estado === 1 ? 'Activo' : 'Inactivo',
					`
                    <button class="btn btn-sm btn-primary edit-btn" data-id="${m.id_movimiento}">
                        <i class="fas fa-pen"></i>
                    </button>
                    <button class="btn btn-sm btn-danger delete-btn" data-id="${m.id_movimiento}">
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
      				responsive: true,
		  			scrollX: false,
					columnDefs: [{ targets: [6], orderable: false, searchable: false }], 
				});

				dataTable.on('draw', function () {
					const noResults =
						dataTable.rows({ filter: 'applied' }).data().length === 0;
					$('#btnAgregarMovimiento').remove();
					if (noResults) {
						$('#tablaMovimientosHabitacion_wrapper').append(`
                            <div class="text-center mt-3">
                                <button id="btnAgregarMovimiento" class="btn btn-success">
                                    Agregar Movimiento Habitación
                                </button>
                            </div>
                        `);
					}
				});
			})
			.catch((error) => {
				$('#tablaMovimientosHabitacion').html(
					'<tr><td colspan="10" class="text-center">No se pudo cargar los movimientos habitación.</td></tr>'
				);
			});
	}

	// 🔸 Botón emergente agregar movimiento habitación
	$(document).on('click', '#btnAgregarMovimiento', function () {
		Swal.fire({
			title: 'Agregar Movimiento Habitación',
			html: `
                <input type="number" id="id_admision" class="swal2-input" placeholder="ID Admisión">
                <input type="number" id="id_habitacion" class="swal2-input" placeholder="ID Habitación">
                <input type="number" id="id_cama" class="swal2-input" placeholder="ID Cama">
                <input type="text" id="fecha_hora_ingreso" class="swal2-input" placeholder="Fecha Ingreso">
                <input type="text" id="fecha_hora_egreso" class="swal2-input" placeholder="Fecha Egreso (opcional)">
                <input type="number" id="id_mov" class="swal2-input" placeholder="ID Movimiento">
                <select id="estado" class="swal2-select">
                    <option value="1">Activo</option>
                    <option value="0">Inactivo</option>
                </select>
            `,
			didOpen: () => {
				if (typeof flatpickr !== 'undefined') {
					flatpickr(Swal.getPopup().querySelector('#fecha_hora_ingreso'), {
						enableTime: true,
						dateFormat: 'Y-m-d H:i',
					});
					flatpickr(Swal.getPopup().querySelector('#fecha_hora_egreso'), {
						enableTime: true,
						dateFormat: 'Y-m-d H:i',
					});
				}
			},
			preConfirm: () => {
				const id_admision = Swal.getPopup().querySelector('#id_admision').value;
				const id_habitacion = Swal.getPopup().querySelector('#id_habitacion').value;
				const id_cama = Swal.getPopup().querySelector('#id_cama').value;
				const fecha_hora_ingreso = Swal.getPopup().querySelector('#fecha_hora_ingreso').value;
				const fecha_hora_egreso = Swal.getPopup().querySelector('#fecha_hora_egreso').value;
				const id_mov = Swal.getPopup().querySelector('#id_mov').value;
				const estado = Swal.getPopup().querySelector('#estado').value;

				if (
					!id_admision ||
					!id_habitacion ||
					!id_cama ||
					!fecha_hora_ingreso ||
					!id_mov
				) {
					Swal.showValidationMessage('Por favor, completa todos los campos obligatorios');
					return false;
				}

				// ⏰ Validar fecha no pasada
				const ingresoUTC = toUTC(fecha_hora_ingreso);
				const hoyUTC = toUTC(new Date());
				hoyUTC.setHours(0, 0, 0, 0);

				if (ingresoUTC < hoyUTC) {
					Swal.showValidationMessage('La fecha de ingreso no puede ser anterior a hoy.');
					return false;
				}

				return {
					id_admision,
					id_habitacion,
					id_cama,
					fecha_hora_ingreso: ingresoUTC.toISOString(),
					fecha_hora_egreso: fecha_hora_egreso ? toUTC(fecha_hora_egreso).toISOString() : null,
					id_mov,
					estado,
				};
			}
		}).then((result) => {
			if (result.isConfirmed) {
				fetch('/api/movimientos_habitacion', {
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

	// 🔸 Editar Movimiento (delegación sobre tbody)
	$('#tablaMovimientosHabitacion tbody').on('click', '.edit-btn', function () {
		const id = $(this).data('id');
		fetch(`/api/movimientos_habitacion/${id}`)
			.then((res) => res.json())
			.then((m) => {
				Swal.fire({
					title: 'Editar Movimiento',
					html: `
            <input type="number" id="id_admision" class="swal2-input" value="${
							m.id_admision
						}">
            <input type="number" id="id_habitacion" class="swal2-input" value="${
							m.id_habitacion
						}">
            <input type="number" id="id_cama" class="swal2-input" value="${
							m.id_cama || ''
						}">
            <input type="text" id="fecha_hora_ingreso" class="swal2-input" value="${
							m.fecha_hora_ingreso
						}">
            <input type="text" id="fecha_hora_egreso" class="swal2-input" value="${
							m.fecha_hora_egreso || ''
						}">
            <input type="number" id="id_mov" class="swal2-input" value="${
							m.id_mov
						}">
            <select id="estado" class="swal2-select">
              <option value="1" ${
								m.estado === 1 ? 'selected' : ''
							}>Activo</option>
              <option value="0" ${
								m.estado === 0 ? 'selected' : ''
							}>Inactivo</option>
            </select>
          `,
					didOpen: () => {
						if (typeof flatpickr !== 'undefined') {
							flatpickr(Swal.getPopup().querySelector('#fecha_hora_ingreso'), {
								enableTime: true,
								dateFormat: 'Y-m-d H:i',
							});
							flatpickr(Swal.getPopup().querySelector('#fecha_hora_egreso'), {
								enableTime: true,
								dateFormat: 'Y-m-d H:i',
							});
						}
					},
					preConfirm: () => {
						const id_admision = Swal.getPopup().querySelector('#id_admision').value;
						const id_habitacion = Swal.getPopup().querySelector('#id_habitacion').value;
						const id_cama = Swal.getPopup().querySelector('#id_cama').value;
						const fecha_hora_ingreso = Swal.getPopup().querySelector('#fecha_hora_ingreso').value;
						const fecha_hora_egreso = Swal.getPopup().querySelector('#fecha_hora_egreso').value;
						const id_mov = Swal.getPopup().querySelector('#id_mov').value;
						const estado = Swal.getPopup().querySelector('#estado').value;

						if (
							!id_admision ||
							!id_habitacion ||
							!id_cama ||
							!fecha_hora_ingreso ||
							!id_mov
						) {
							Swal.showValidationMessage('Por favor, completa todos los campos obligatorios');
							return false;
						}

						// Validar que la fecha de ingreso no sea anterior a hoy
						const ingresoUTC = toUTC(fecha_hora_ingreso);
						const hoyUTC = toUTC(new Date());
						hoyUTC.setHours(0, 0, 0, 0);

						if (ingresoUTC < hoyUTC) {
							Swal.showValidationMessage('La fecha de ingreso no puede ser anterior a hoy.');
							return false;
						}

						return {
							id_admision,
							id_habitacion,
							id_cama,
							fecha_hora_ingreso: ingresoUTC.toISOString(),
							fecha_hora_egreso: fecha_hora_egreso ? toUTC(fecha_hora_egreso).toISOString() : null,
							id_mov,
							estado,
						};
					}
				}).then((result) => {
					if (result.isConfirmed) {
						fetch(`/api/movimientos_habitacion/${id}`, {
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
								Swal.fire('Error', 'No se pudo actualizar', 'error')
							);
					}
				});
			});
	});

	// 🔸 Eliminar Movimiento (delegación sobre tbody)
	$('#tablaMovimientosHabitacion tbody').on(
		'click',
		'.delete-btn',
		function () {
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
					fetch(`/api/movimientos_habitacion/${id}`, { method: 'DELETE' })
						.then(() =>
							Swal.fire('Eliminado', 'Movimiento eliminado', 'success').then(
								() => location.reload()
							)
						)
						.catch(() => Swal.fire('Error', 'No se pudo eliminar', 'error'));
				}
			});
		}
	);
});
