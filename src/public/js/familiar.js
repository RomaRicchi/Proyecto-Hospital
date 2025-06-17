$(document).ready(function () {
	const tabla = $('#tablaFamiliar');
	if (tabla.length) {
		const dataTable = tabla.DataTable({
			language: { url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json' },
			paging: true,
			pageLength: 5,
			searching: true,
			ordering: true,
		});

		dataTable.on('draw', function () {
			const info = dataTable.page.info();
			if (info.recordsDisplay === 0) {
				if ($('#btnAgregarFamiliar').length === 0) {
					$('#tablaFamiliar_wrapper').append(`
                        <div class="text-center mt-3">
                            <button id="btnAgregarFamiliar" class="btn btn-success">
                                Agregar Nuevo Familiar
                            </button>
                        </div>
                    `);
				}
			} else {
				$('#btnAgregarFamiliar').remove();
			}
		});
	}

	// 📌 Función para cargar parentescos desde la API
	async function cargarParentescos() {
		const response = await fetch('/api/parentescos');
		const parentescos = await response.json();
		return parentescos
			.map((p) => `<option value="${p.id_parentesco}">${p.nombre}</option>`)
			.join('');
	}

	// 📌 Función para buscar paciente por DNI
	async function buscarPacientePorDNI(dni) {
		const response = await fetch('/api/pacientes');
		const pacientes = await response.json();
		return pacientes.find((p) => p.dni_paciente == dni);
	}

	// 🟢 Agregar familiar
	$(document).on('click', '#btnAgregarFamiliar', async function () {
		const opcionesParentesco = await cargarParentescos();

		Swal.fire({
			title: 'Agregar Familiar',
			html: `
                <input id="swal-dni" class="swal2-input" placeholder="DNI Paciente">
                <input id="swal-nombre" class="swal2-input" placeholder="Nombre Familiar">
                <input id="swal-apellido" class="swal2-input" placeholder="Apellido Familiar">
                <input id="swal-telefono" class="swal2-input" placeholder="Teléfono Familiar">
                <select id="swal-parentesco" class="swal2-input">${opcionesParentesco}</select>
            `,
			showCancelButton: true,
			confirmButtonText: 'Guardar',
			preConfirm: async () => {
				const dni = $('#swal-dni').val();
				const paciente = await buscarPacientePorDNI(dni);
				if (!paciente) {
					Swal.showValidationMessage('No existe un paciente con ese DNI.');
					return false;
				}
				return {
					nombre: $('#swal-nombre').val(),
					apellido: $('#swal-apellido').val(),
					telefono: $('#swal-telefono').val(),
					id_paciente: paciente.id_paciente,
					id_parentesco: $('#swal-parentesco').val(),
					estado: true,
				};
			},
		}).then((result) => {
			if (result.isConfirmed) {
				fetch('/api/familiares', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(result.value),
				})
					.then(() =>
						Swal.fire('Guardado', 'Familiar creado', 'success').then(() =>
							location.reload()
						)
					)
					.catch(() =>
						Swal.fire('Error', 'No se pudo crear el familiar', 'error')
					);
			}
		});
	});

	// 🟠 Editar familiar
	$(document).on('click', '.edit-btn', async function () {
		const id = $(this).data('id');
		const opcionesParentesco = await cargarParentescos();

		fetch(`/api/familiares/${id}`)
			.then((res) => res.json())
			.then((familiar) => {
				Swal.fire({
					title: 'Editar Familiar',
					html: `
                        <input id="swal-dni" class="swal2-input" value="${
													familiar.paciente?.dni_paciente || ''
												}" placeholder="DNI Paciente">
                        <input id="swal-nombre" class="swal2-input" value="${
													familiar.nombre
												}" placeholder="Nombre Familiar">
                        <input id="swal-apellido" class="swal2-input" value="${
													familiar.apellido
												}" placeholder="Apellido Familiar">
                        <input id="swal-telefono" class="swal2-input" value="${
													familiar.telefono
												}" placeholder="Teléfono Familiar">
                        <select id="swal-parentesco" class="swal2-input">${opcionesParentesco}</select>
                    `,
					showCancelButton: true,
					confirmButtonText: 'Guardar',
					preConfirm: async () => {
						const dni = $('#swal-dni').val();
						const paciente = await buscarPacientePorDNI(dni);
						if (!paciente) {
							Swal.showValidationMessage('No existe un paciente con ese DNI.');
							return false;
						}
						return {
							nombre: $('#swal-nombre').val(),
							apellido: $('#swal-apellido').val(),
							telefono: $('#swal-telefono').val(),
							id_paciente: paciente.id_paciente,
							id_parentesco: $('#swal-parentesco').val(),
						};
					},
				}).then((result) => {
					if (result.isConfirmed) {
						fetch(`/api/familiares/${id}`, {
							method: 'PUT',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify(result.value),
						})
							.then(() =>
								Swal.fire('Actualizado', 'Familiar modificado', 'success').then(
									() => location.reload()
								)
							)
							.catch(() =>
								Swal.fire('Error', 'No se pudo actualizar el familiar', 'error')
							);
					}
				});
			});
	});

	// 🔴 Eliminar familiar
	$(document).on('click', '.delete-btn', function () {
		const id = $(this).data('id');
		Swal.fire({
			title: '¿Eliminar familiar?',
			text: 'Esta acción eliminará el familiar.',
			icon: 'warning',
			showCancelButton: true,
			confirmButtonText: 'Sí, eliminar',
			cancelButtonText: 'Cancelar',
		}).then((result) => {
			if (result.isConfirmed) {
				fetch(`/api/familiares/${id}`, { method: 'DELETE' })
					.then(() =>
						Swal.fire('Eliminado', 'Familiar eliminado', 'success').then(() =>
							location.reload()
						)
					)
					.catch(() =>
						Swal.fire('Error', 'No se pudo eliminar el familiar', 'error')
					);
			}
		});
	});
});
