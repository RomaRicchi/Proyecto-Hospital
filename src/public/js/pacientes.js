$(document).ready(function () {
	const tabla = $('#tablaPacientes');

	if (tabla.length) {
		const dt = tabla.DataTable({
			language: {
				url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json',
			},
			paging: true,
			pageLength: 5,
			searching: true,
			ordering: true,
		});

		dt.on('draw', function () {
			const noResults = dt.rows({ filter: 'applied' }).data().length === 0;
			$('#btnAgregarPaciente').remove();
			if (noResults) {
				$('<button>')
					.attr('id', 'btnAgregarPaciente')
					.addClass('btn btn-success mt-3')
					.html('<i class="fas fa-plus me-1"></i>Agregar Paciente')
					.appendTo('#tablaPacientes_wrapper')
					.on('click', abrirSwalAgregarPaciente);
			}
		});
	}

	$(document).on('click', '#btnAgregarPaciente', abrirSwalAgregarPaciente);

	function abrirSwalAgregarPaciente() {
		Promise.all([
			fetch('/api/pacientes/localidad').then((r) => r.json()),
			fetch('/api/pacientes/genero').then((r) => r.json()),
		]).then(([localidades, generos]) => {
			const selectGenero = `
                <select id="id_genero" class="swal2-input">
                    <option value="">Seleccione género</option>
                    ${generos
											.map(
												(g) =>
													`<option value="${g.id_genero}">${g.nombre}</option>`
											)
											.join('')}
                </select>`;
			const selectLocalidad = `
                <select id="id_localidad" class="swal2-input">
                    <option value="">Seleccione localidad</option>
                    ${localidades
											.map(
												(l) =>
													`<option value="${l.id_localidad}">${l.nombre}</option>`
											)
											.join('')}
                </select>`;
			Swal.fire({
				title: 'Agregar Paciente',
				html: `
                    <input id="dni_paciente" class="swal2-input" placeholder="DNI">
                    <input id="apellido_p" class="swal2-input" placeholder="Apellido">
                    <input id="nombre_p" class="swal2-input" placeholder="Nombre">
                    <input id="fecha_nac" type="date" class="swal2-input">
                    ${selectGenero}
                    <input id="telefono" class="swal2-input" placeholder="Teléfono">
                    <input id="direccion" class="swal2-input" placeholder="Dirección">
                    ${selectLocalidad}
                    <input id="email" class="swal2-input" placeholder="Email">
                `,
				showCancelButton: true,
				confirmButtonText: 'Guardar',
				preConfirm: () => {
					const dni_paciente = $('#dni_paciente').val();
					const apellido_p = $('#apellido_p').val();
					const nombre_p = $('#nombre_p').val();
					const fecha_nac = $('#fecha_nac').val();
					const id_genero = $('#id_genero').val();
					const telefono = $('#telefono').val();
					const direccion = $('#direccion').val();
					const id_localidad = $('#id_localidad').val();
					const email = $('#email').val();

					if (!dni_paciente || !apellido_p || !nombre_p || !id_genero) {
						Swal.showValidationMessage(
							'DNI, Apellido, Nombre y Género son obligatorios'
						);
						return false;
					}

					return {
						dni_paciente,
						apellido_p,
						nombre_p,
						fecha_nac,
						id_genero,
						telefono,
						direccion,
						id_localidad,
						email,
					};
				},
			}).then((result) => {
				if (result.isConfirmed) {
					fetch('/api/pacientes', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify(result.value),
					})
						.then((res) => {
							if (!res.ok) throw new Error();
							return res.json();
						})
						.then(() =>
							Swal.fire('Éxito', 'Paciente creado', 'success').then(() =>
								location.reload()
							)
						)
						.catch(() =>
							Swal.fire('Error', 'No se pudo crear el paciente', 'error')
						);
				}
			});
		});
	}

	// Editar paciente
	$(document).on('click', '.edit-btn', function () {
		const id = $(this).data('id');
		Promise.all([
			fetch(`/api/pacientes/${id}`).then((res) => res.json()),
			fetch('/api/pacientes/localidad').then((r) => r.json()),
			fetch('/api/pacientes/genero').then((r) => r.json()),
		]).then(([paciente, localidades, generos]) => {
			if (paciente.message) {
				Swal.fire('Error', 'Paciente no encontrado', 'error');
				return;
			}
			const selectGenero = `
                <select id="id_genero" class="swal2-input">
                    <option value="">Seleccione género</option>
                    ${generos
											.map(
												(g) =>
													`<option value="${g.id_genero}" ${
														paciente.id_genero == g.id_genero ? 'selected' : ''
													}>${g.nombre}</option>`
											)
											.join('')}
                </select>`;
			const selectLocalidad = `
                <select id="id_localidad" class="swal2-input">
                    <option value="">Seleccione localidad</option>
                    ${localidades
											.map(
												(l) =>
													`<option value="${l.id_localidad}" ${
														paciente.id_localidad == l.id_localidad
															? 'selected'
															: ''
													}>${l.nombre}</option>`
											)
											.join('')}
                </select>`;
			Swal.fire({
				title: 'Editar Paciente',
				html: `
                    <input id="dni_paciente" class="swal2-input" value="${
											paciente.dni_paciente || ''
										}" placeholder="DNI">
                    <input id="apellido_p" class="swal2-input" value="${
											paciente.apellido_p || ''
										}" placeholder="Apellido">
                    <input id="nombre_p" class="swal2-input" value="${
											paciente.nombre_p || ''
										}" placeholder="Nombre">
                    <input id="fecha_nac" type="date" class="swal2-input" value="${
											paciente.fecha_nac
												? paciente.fecha_nac.substring(0, 10)
												: ''
										}">
                    ${selectGenero}
                    <input id="telefono" class="swal2-input" value="${
											paciente.telefono || ''
										}" placeholder="Teléfono">
                    <input id="direccion" class="swal2-input" value="${
											paciente.direccion || ''
										}" placeholder="Dirección">
                    ${selectLocalidad}
                    <input id="email" class="swal2-input" value="${
											paciente.email || ''
										}" placeholder="Email">
                `,
				showCancelButton: true,
				confirmButtonText: 'Guardar',
				preConfirm: () => {
					const dni_paciente = $('#dni_paciente').val();
					const apellido_p = $('#apellido_p').val();
					const nombre_p = $('#nombre_p').val();
					const fecha_nac = $('#fecha_nac').val();
					const id_genero = $('#id_genero').val();
					const telefono = $('#telefono').val();
					const direccion = $('#direccion').val();
					const id_localidad = $('#id_localidad').val();
					const email = $('#email').val();

					if (!dni_paciente || !apellido_p || !nombre_p || !id_genero) {
						Swal.showValidationMessage(
							'DNI, Apellido, Nombre y Género son obligatorios'
						);
						return false;
					}

					return {
						dni_paciente,
						apellido_p,
						nombre_p,
						fecha_nac,
						id_genero,
						telefono,
						direccion,
						id_localidad,
						email,
					};
				},
			}).then((result) => {
				if (result.isConfirmed) {
					fetch(`/api/pacientes/${id}`, {
						method: 'PUT',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify(result.value),
					})
						.then((res) => {
							if (!res.ok) throw new Error();
							return res.json();
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
		});
	});

	// Eliminar paciente
	$(document).on('click', '.delete-btn', function () {
		const id = $(this).data('id');
		Swal.fire({
			title: '¿Eliminar paciente?',
			text: 'Esta acción eliminará el registro de forma permanente.',
			icon: 'warning',
			showCancelButton: true,
			confirmButtonText: 'Sí, eliminar',
			cancelButtonText: 'Cancelar',
		}).then((result) => {
			if (result.isConfirmed) {
				fetch(`/api/pacientes/${id}`, {
					method: 'DELETE',
				})
					.then((res) => {
						if (!res.ok) throw new Error();
						return res.text();
					})
					.then(() =>
						Swal.fire(
							'Eliminado',
							'Paciente eliminado correctamente',
							'success'
						).then(() => location.reload())
					)
					.catch(() =>
						Swal.fire('Error', 'No se pudo eliminar el paciente', 'error')
					);
			}
		});
	});

	// Detalles
	$(document).on('click', '.details-btn', function () {
		const id = $(this).data('id');
		fetch(`/api/pacientes/${id}`)
			.then((res) => res.json())
			.then((p) => {
				Swal.fire({
					title: `Detalles del Paciente`,
					html: `
                        <p><strong>DNI:</strong> ${p.dni_paciente}</p>
                        <p><strong>Nombre:</strong> ${p.nombre_p} ${
						p.apellido_p
					}</p>
                        <p><strong>Fecha de nacimiento:</strong> ${
													p.fecha_nac?.substring(0, 10) || ''
												}</p>
                        <p><strong>Email:</strong> ${p.email || '-'}</p>
                        <p><strong>Teléfono:</strong> ${p.telefono || '-'}</p>
                        <p><strong>Dirección:</strong> ${p.direccion || '-'}</p>
                    `,
					confirmButtonText: 'Cerrar',
				});
			});
	});
});
