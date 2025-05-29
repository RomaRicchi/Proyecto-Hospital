// pacientes.js
$(document).ready(function () {
	console.log('Inicializando DataTable para pacientes...');
	const tabla = $('#tablaPacientes');

	if (tabla.length) {
		const dt = tabla.DataTable({
			language: { url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json' },
			paging: true,
			pageLength: 5,
			searching: true,
			ordering: true,
		});

		// 🔥 Detectar si la búsqueda no tiene resultados
		dt.on('draw', function () {
			const info = dt.page.info();
			const noResults = dt.rows({ filter: 'applied' }).data().length === 0;

			// Eliminamos el botón previo si existe
			$('#btnAgregarPaciente').remove();

			if (noResults) {
				$('<button>')
					.attr('id', 'btnAgregarPaciente')
					.addClass('btn btn-primary mt-3')
					.text('Agregar nuevo paciente')
					.appendTo('#tablaPacientes_wrapper') // Puedes ajustar el contenedor aquí
					.on('click', abrirSwalNuevoPaciente);
			}
		});
	} else {
		console.warn('Tabla #tablaPacientes no encontrada.');
	}

	// Función para abrir Swal de nuevo paciente
	async function abrirSwalNuevoPaciente() {
		try {
			const [localidades, generos] = await Promise.all([
				fetch(`/api/localidades`).then((r) => r.json()),
				fetch(`/api/generos`).then((r) => r.json()),
			]);

			const localidadOptions = localidades
				.map(
					(loc) => `<option value="${loc.id_localidad}">${loc.nombre}</option>`
				)
				.join('');
			const generoOptions = generos
				.map((gen) => `<option value="${gen.id_genero}">${gen.nombre}</option>`)
				.join('');

			Swal.fire({
				title: 'Agregar nuevo paciente',
				html: `
                    <input id="swal-dni" class="swal2-input" placeholder="DNI">
                    <input id="swal-apellido" class="swal2-input" placeholder="Apellido">
                    <input id="swal-nombre" class="swal2-input" placeholder="Nombre">
                    <input id="swal-fecha" class="swal2-input" type="date">
                    <input id="swal-telefono" class="swal2-input" placeholder="Teléfono">
                    <input id="swal-direccion" class="swal2-input" placeholder="Dirección">
                    <input id="swal-email" class="swal2-input" placeholder="Email">
                    <select id="swal-localidad" class="swal2-input">${localidadOptions}</select>
                    <select id="swal-genero" class="swal2-input">${generoOptions}</select>
                    <select id="swal-estado" class="swal2-input">
                        <option value="1" selected>Activo</option>
                        <option value="0">Inactivo</option>
                    </select>
                `,
				showCancelButton: true,
				confirmButtonText: 'Guardar',
				preConfirm: () => ({
					dni_paciente: $('#swal-dni').val(),
					apellido_p: $('#swal-apellido').val(),
					nombre_p: $('#swal-nombre').val(),
					fecha_nac: $('#swal-fecha').val(),
					telefono: $('#swal-telefono').val(),
					direccion: $('#swal-direccion').val(),
					email: $('#swal-email').val(),
					id_localidad: parseInt($('#swal-localidad').val()),
					id_genero: parseInt($('#swal-genero').val()),
					estado: $('#swal-estado').val() === '1',
				}),
			}).then((result) => {
				if (result.isConfirmed) {
					fetch(`/api/pacientes`, {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify(result.value),
					})
						.then(() =>
							Swal.fire('Agregado', 'Nuevo paciente creado', 'success').then(
								() => location.reload()
							)
						)
						.catch(() =>
							Swal.fire('Error', 'No se pudo crear el paciente', 'error')
						);
				}
			});
		} catch (error) {
			console.error('Error al cargar localidades y géneros:', error);
			Swal.fire('Error', 'No se pudo cargar el formulario.', 'error');
		}
	}

	// 🔴 Borrado lógico (estado = false)
	$('.delete-btn').on('click', function () {
		const id = $(this).data('id');
		Swal.fire({
			title: '¿Eliminar paciente?',
			text: 'Esta acción desactivará el paciente (borrado lógico).',
			icon: 'warning',
			showCancelButton: true,
			confirmButtonText: 'Sí, eliminar',
			cancelButtonText: 'Cancelar',
		}).then((result) => {
			if (result.isConfirmed) {
				fetch(`/api/pacientes/${id}`, { method: 'DELETE' })
					.then(() =>
						Swal.fire('Hecho', 'Paciente eliminado', 'success').then(() =>
							location.reload()
						)
					)
					.catch(() =>
						Swal.fire('Error', 'No se pudo eliminar el paciente', 'error')
					);
			}
		});
	});

	//Editar paciente
	$('.edit-btn').on('click', async function () {
		const id = $(this).data('id');
		try {
			// Fetch paralelo de paciente, localidades y generos
			const [paciente, localidades, generos] = await Promise.all([
				fetch(`/api/pacientes/${id}`).then((r) => r.json()),
				fetch(`/api/localidades`).then((r) => r.json()),
				fetch(`/api/generos`).then((r) => r.json()),
			]);

			if (!paciente) {
				return Swal.fire('Error', 'No se pudo cargar el paciente.', 'error');
			}

			const localidadOptions = localidades
				.map(
					(loc) =>
						`<option value="${loc.id_localidad}" ${
							loc.id_localidad === paciente.id_localidad ? 'selected' : ''
						}>${loc.nombre}</option>`
				)
				.join('');
			const generoOptions = generos
				.map(
					(gen) =>
						`<option value="${gen.id_genero}" ${
							gen.id_genero === paciente.id_genero ? 'selected' : ''
						}>${gen.nombre}</option>`
				)
				.join('');

			Swal.fire({
				title: 'Editar paciente',
				html: `
                <input id="swal-dni" class="swal2-input" placeholder="DNI" value="${
									paciente.dni_paciente || ''
								}">
                <input id="swal-apellido" class="swal2-input" placeholder="Apellido" value="${
									paciente.apellido_p || ''
								}">
                <input id="swal-nombre" class="swal2-input" placeholder="Nombre" value="${
									paciente.nombre_p || ''
								}">
                <input id="swal-fecha" class="swal2-input" type="date" value="${
									paciente.fecha_nac ? paciente.fecha_nac.slice(0, 10) : ''
								}">
                <input id="swal-telefono" class="swal2-input" placeholder="Teléfono" value="${
									paciente.telefono || ''
								}">
                <input id="swal-direccion" class="swal2-input" placeholder="Dirección" value="${
									paciente.direccion || ''
								}">
                <input id="swal-email" class="swal2-input" placeholder="Email" value="${
									paciente.email || ''
								}">
                <select id="swal-localidad" class="swal2-input">${localidadOptions}</select>
                <select id="swal-genero" class="swal2-input">${generoOptions}</select>
                <select id="swal-estado" class="swal2-input">
                    <option value="1" ${
											paciente.estado ? 'selected' : ''
										}>Activo</option>
                    <option value="0" ${
											!paciente.estado ? 'selected' : ''
										}>Inactivo</option>
                </select>
            `,
				showCancelButton: true,
				confirmButtonText: 'Guardar',
				preConfirm: () => ({
					dni_paciente: $('#swal-dni').val(),
					apellido_p: $('#swal-apellido').val(),
					nombre_p: $('#swal-nombre').val(),
					fecha_nac: $('#swal-fecha').val(),
					telefono: $('#swal-telefono').val(),
					direccion: $('#swal-direccion').val(),
					email: $('#swal-email').val(),
					id_localidad: parseInt($('#swal-localidad').val()),
					id_genero: parseInt($('#swal-genero').val()),
					estado: $('#swal-estado').val() === '1',
				}),
			}).then((result) => {
				if (result.isConfirmed) {
					fetch(`/api/pacientes/${id}`, {
						method: 'PUT',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify(result.value),
					})
						.then(() =>
							Swal.fire('Actualizado', 'Paciente modificado', 'success').then(
								() => location.reload()
							)
						)
						.catch(() =>
							Swal.fire('Error', 'No se pudo actualizar el paciente', 'error')
						);
				}
			});
		} catch (error) {
			console.error('Error cargando datos de edición:', error);
			Swal.fire(
				'Error',
				'No se pudo cargar la información del paciente.',
				'error'
			);
		}
	});

	// 👪 Agregar/Modificar familiar
	$('.family-btn').on('click', function () {
		const id = $(this).data('id');
		fetch(`/api/familiares/paciente/${id}`)
			.then((res) => res.json())
			.then((familiar) => {
				familiar = familiar || {};
				Swal.fire({
					title: 'Familiar',
					html: `
                        <input id="swal-f-nombre" class="swal2-input" placeholder="Nombre" value="${
													familiar.nombre || ''
												}">
                        <input id="swal-f-apellido" class="swal2-input" placeholder="Apellido" value="${
													familiar.apellido || ''
												}">
                        <input id="swal-f-telefono" class="swal2-input" placeholder="Teléfono" value="${
													familiar.telefono || ''
												}">
                        <input id="swal-f-parentesco" class="swal2-input" placeholder="ID Parentesco" value="${
													familiar.id_parentesco || ''
												}">
                    `,
					showCancelButton: true,
					confirmButtonText: 'Guardar',
					preConfirm: () => ({
						nombre: $('#swal-f-nombre').val(),
						apellido: $('#swal-f-apellido').val(),
						telefono: $('#swal-f-telefono').val(),
						id_parentesco: $('#swal-f-parentesco').val(),
						estado: true,
						id_paciente: id,
					}),
				}).then((result) => {
					if (result.isConfirmed) {
						const method = familiar.id_familiar ? 'PUT' : 'POST';
						const url = familiar.id_familiar
							? `/api/familiares/${familiar.id_familiar}`
							: '/api/familiares';
						fetch(url, {
							method,
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify(result.value),
						})
							.then(() =>
								Swal.fire('Hecho', 'Familiar guardado', 'success').then(() =>
									location.reload()
								)
							)
							.catch(() =>
								Swal.fire('Error', 'No se pudo guardar el familiar', 'error')
							);
					}
				});
			});
	});

	// 👁️ Detalles del paciente
	$('.details-btn').on('click', async function () {
		const id = $(this).data('id');
		try {
			const paciente = await fetch(`/api/pacientes/${id}`).then((r) =>
				r.json()
			);
			const familiar = await fetch(`/api/familiares/paciente/${id}`).then((r) =>
				r.json()
			);

			const familiarInfo = familiar
				? `<p><b>Familiar:</b> ${familiar.nombre} ${familiar.apellido} (${
						familiar.parentesco?.nombre || 'Sin parentesco'
				  })<br>Teléfono: ${familiar.telefono || '-'}</p>`
				: '<p><b>Familiar:</b> Sin familiar asignado</p>';

			Swal.fire({
				title: 'Detalles del paciente',
				html: `
                <p><b>Nombre:</b> ${paciente.nombre_p} ${
					paciente.apellido_p
				}</p>
                <p><b>DNI:</b> ${paciente.dni_paciente}</p>
                <p><b>Teléfono:</b> ${paciente.telefono || '-'}</p>
                <p><b>Email:</b> ${paciente.email || '-'}</p>
                ${familiarInfo}
            `,
				showConfirmButton: true,
			});
		} catch (error) {
			console.error('Error al mostrar detalles:', error);
			Swal.fire(
				'Error',
				'No se pudo obtener la información del paciente',
				'error'
			);
		}
	});
});
