$(document).ready(function () {
	const tabla = $('#tablaCamas');

	if (tabla.length) {
		const dt = tabla.DataTable({
			language: { url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json' },
			paging: true,
			pageLength: 5,
			searching: true,
			ordering: true,
		});

		dt.on('draw', function () {
			const noResults = dt.rows({ filter: 'applied' }).data().length === 0;
			$('#btnAgregarCama').remove();
			if (noResults) {
				$('#tablaCamas_wrapper').append(`
					<div class="text-center mt-3">
						<button id="btnAgregarCama" class="btn btn-success">
							Agregar Nueva Cama
						</button>
					</div>
				`);
			}
		});
	}

	// 🔸 Botón Agregar
	$(document).on('click', '#btnAgregarCama', async function () {
		const habitaciones = await cargarHabitaciones();

		Swal.fire({
			title: 'Agregar Nueva Cama',
			html: `
				<input id="swal-nombre" class="swal2-input" placeholder="Nombre">
				<select id="swal-id_habitacion" class="swal2-input">
					<option disabled selected value="">Seleccionar habitación</option>
					${habitaciones
						.map(
							(h) =>
								`<option value="${h.id_habitacion}">Habitación ${h.num} - ${
									h.sector?.nombre || 'Sin sector'
								}</option>`
						)
						.join('')}
				</select>
				<div id="detalle-habitacion" class="text-start p-2 border rounded" style="background-color: #f8f9fa;">
					Selecciona una habitación para ver detalles.
				</div>
				<label class="mt-2 text-start d-block"><strong>Desinfección ok:</strong></label>
				<select id="swal-desinfeccion" class="swal2-input">
					<option value="0">No</option>
					<option value="1">Sí</option>
				</select>
				<label class="mt-2 text-start d-block"><strong>Estado:</strong></label>
				<select id="swal-estado" class="swal2-input">
					<option value="0">Disponible</option>
					<option value="1">Ocupada</option>
				</select>
			`,
			showCancelButton: true,
			confirmButtonText: 'Guardar',
			didOpen: () => {
				const select = document.getElementById('swal-id_habitacion');
				const detalleDiv = document.getElementById('detalle-habitacion');

				select.addEventListener('change', function () {
					const selectedId = this.value;
					const habitacion = habitaciones.find(
						(h) => h.id_habitacion == selectedId
					);
					if (habitacion) {
						const camasNombres = habitacion.camas?.length
							? habitacion.camas.map((c) => c.nombre).join(', ')
							: 'No hay camas registradas';

						detalleDiv.innerHTML = `
							<strong>Sector:</strong> ${habitacion.sector?.nombre || 'Sin sector'}<br>
							<strong>Número Habitación:</strong> ${habitacion.num}<br>
							<strong>Camas en Habitación:</strong> ${
								habitacion.camas?.length || 0
							} (${camasNombres})
						`;
					}
				});
			},
			preConfirm: () => {
				const nombre = $('#swal-nombre').val();
				const id_habitacion = $('#swal-id_habitacion').val();
				const desinfeccion = $('#swal-desinfeccion').val();
				const estado = $('#swal-estado').val();

				if (!nombre || !id_habitacion) {
					Swal.showValidationMessage('Completá los campos obligatorios');
					return false;
				}

				return { nombre, id_habitacion, desinfeccion, estado };
			},
		}).then((result) => {
			if (result.isConfirmed) {
				fetch('/api/camas', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(result.value),
				})
					.then((response) => {
						if (!response.ok) throw new Error('Error al crear la cama');
						return response.json();
					})
					.then(() =>
						Swal.fire('Agregado', 'Cama creada con éxito', 'success').then(() =>
							location.reload()
						)
					)
					.catch(() => Swal.fire('Error', 'No se pudo crear la cama', 'error'));
			}
		});
	});
});

// 🔸 Botón Editar
$(document).on('click', '.edit-btn', async function () {
	const id = $(this).data('id');

	try {
		const cama = await fetch(`/api/camas/${id}`).then((r) => r.json());
		const habitaciones = await cargarHabitaciones();

		let opcionesHabitacion = '';
		habitaciones.forEach((hab) => {
			const selected =
				hab.id_habitacion == cama.id_habitacion ? 'selected' : '';
			opcionesHabitacion += `<option value="${hab.id_habitacion}" ${selected}>${hab.num} - ${hab.sector.nombre}</option>`;
		});

		Swal.fire({
			title: 'Editar Cama',
			html: `
				<input id="swal-nombre" class="swal2-input" value="${
					cama.nombre
				}" placeholder="Nombre">
				<select id="swal-id_habitacion" class="swal2-input">${opcionesHabitacion}</select>
				<div id="detalle-habitacion" class="text-start p-2 border rounded" style="background-color: #f8f9fa; margin-top: 10px;">
					Selecciona una habitación para ver detalles
				</div>
				<label for="swal-desinfeccion" class="mt-2 d-block text-start"><strong>Desinfección ok:</strong></label>
				<select id="swal-desinfeccion" class="swal2-input">
					<option value="0" ${!cama.desinfeccion ? 'selected' : ''}>No</option>
					<option value="1" ${cama.desinfeccion ? 'selected' : ''}>Sí</option>
				</select>
				<label for="swal-estado" class="mt-2 d-block text-start"><strong>Estado:</strong></label>
				<select id="swal-estado" class="swal2-input">
					<option value="0" ${!cama.estado ? 'selected' : ''}>Disponible</option>
					<option value="1" ${cama.estado ? 'selected' : ''}>Ocupada</option>
				</select>
			`,
			showCancelButton: true,
			confirmButtonText: 'Guardar',
			didOpen: () => {
				const select = document.getElementById('swal-id_habitacion');
				const detalleDiv = document.getElementById('detalle-habitacion');

				const habInicial = habitaciones.find(
					(h) => h.id_habitacion == cama.id_habitacion
				);
				if (habInicial) {
					const camasNombres = habInicial.camas?.length
						? habInicial.camas.map((c) => c.nombre).join(', ')
						: 'No hay camas registradas';
					detalleDiv.innerHTML = `
						<strong>Sector:</strong> ${habInicial.sector.nombre}<br>
						<strong>Número Habitación:</strong> ${habInicial.num}<br>
						<strong>Camas en Habitación:</strong> ${habInicial.camas.length} (${camasNombres})
					`;
				}

				select.addEventListener('change', function () {
					const habitacion = habitaciones.find(
						(h) => h.id_habitacion == this.value
					);
					if (habitacion) {
						const camasNombres =
							habitacion.camas.length > 0
								? habitacion.camas.map((c) => c.nombre).join(', ')
								: 'No hay camas registradas';
						detalleDiv.innerHTML = `
							<strong>Sector:</strong> ${habitacion.sector.nombre}<br>
							<strong>Número Habitación:</strong> ${habitacion.num}<br>
							<strong>Camas en Habitación:</strong> ${habitacion.camas.length} (${camasNombres})
						`;
					} else {
						detalleDiv.innerHTML =
							'No se encontró información para la habitación seleccionada';
					}
				});
			},
			preConfirm: () => ({
				nombre: document.getElementById('swal-nombre').value,
				id_habitacion: document.getElementById('swal-id_habitacion').value,
				desinfeccion: document.getElementById('swal-desinfeccion').value,
				estado: document.getElementById('swal-estado').value,
			}),
		}).then((result) => {
			if (result.isConfirmed) {
				fetch(`/api/camas/${id}`, {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(result.value),
				})
					.then((response) => {
						if (!response.ok) throw new Error('Error al actualizar la cama');
						return response.json().catch(() => ({}));
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
	} catch (error) {
		Swal.fire('Error', 'No se pudo cargar los datos para editar', 'error');
	}
});

// 🔸 Eliminar cama
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
				.then((response) => {
					if (!response.ok) throw new Error('Error al eliminar la cama');
					Swal.fire('Eliminado', 'Cama eliminada', 'success').then(() =>
						location.reload()
					);
				})
				.catch(() => Swal.fire('Error', 'No se pudo eliminar', 'error'));
		}
	});
});

// 🔸 Función auxiliar para cargar habitaciones
async function cargarHabitaciones() {
	try {
		const response = await fetch('/api/habitaciones');
		if (!response.ok) throw new Error('No se pudieron cargar habitaciones');
		return await response.json();
	} catch (error) {
		return [];
	}
}
