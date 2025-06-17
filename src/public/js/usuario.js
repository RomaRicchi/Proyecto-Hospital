$(document).ready(function () {
	const tabla = $('#tablaUsuarios');
	if (tabla.length) {
		const dt = tabla.DataTable({
			language: { url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json' },
			paging: true,
      		pageLength: 10,
      		searching: true,
      		ordering: true,  
		  	destroy: true,
      		responsive: true,
		    scrollX: false,
			columnDefs: [{ targets: [6], orderable: false, searchable: false }], 
		});

		dt.on('draw', function () {
			const info = dt.page.info();
			const noResults = dt.rows({ filter: 'applied' }).data().length === 0;
			$('#btnAgregarUsuario').remove();
			if (noResults) {
				$('#tablaUsuarios_wrapper').append(`
          <div class="text-center mt-3">
            <button id="btnAgregarUsuario" class="btn btn-success">
              Agregar Nuevo Usuario
            </button>
          </div>
        `);
			}
		});
	}

	// Agregar nuevo usuario
	$(document).on('click', '#btnAgregarUsuario', async function () {
		const roles = await fetch('/api/roles')
			.then((r) => r.json())
			.catch(() => []);
		const especialidades = await fetch('/api/especialidades')
			.then((r) => r.json())
			.catch(() => []);
		const rolOptions = roles
			.map((r) => `<option value="${r.id_rol_usuario}">${r.nombre}</option>`)
			.join('');
		const especOptions = especialidades
			.map((e) => `<option value="${e.id_especialidad}">${e.nombre}</option>`)
			.join('');

		Swal.fire({
			title: 'Agregar Nuevo Usuario',
			html: `
        <input id="swal-username" class="swal2-input" placeholder="Username">
        <input id="swal-password" class="swal2-input" placeholder="Contraseña" type="password">
        <input id="swal-apellido" class="swal2-input" placeholder="Apellido">
        <input id="swal-nombre" class="swal2-input" placeholder="Nombre">
        <select id="swal-rol" class="swal2-input">${rolOptions}</select>
      `,
			showCancelButton: true,
			confirmButtonText: 'Guardar',
			preConfirm: () => {
				const username = $('#swal-username').val();
				const password = $('#swal-password').val();
				const apellido = $('#swal-apellido').val();
				const nombre = $('#swal-nombre').val();
				const rol = $('#swal-rol').val();
				if (!username || !password || !apellido || !nombre || !rol) {
					Swal.showValidationMessage('Todos los campos son obligatorios');
					return false;
				}
				return { username, password, apellido, nombre, id_rol_usuario: rol };
			},
		}).then((result) => {
			if (result.isConfirmed) {
				fetch('/api/usuarios', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(result.value),
				})
					.then(() =>
						Swal.fire('Agregado', 'Usuario creado con éxito', 'success').then(
							() => location.reload()
						)
					)
					.catch(() =>
						Swal.fire('Error', 'No se pudo crear el usuario', 'error')
					);
			}
		});
	});

	// Editar usuario
	$(document).on('click', '.edit-btn', async function () {
		const id = $(this).data('id');
		const usuario = await fetch(`/api/usuarios/${id}`).then((r) => r.json());
		const roles = await fetch('/api/roles')
			.then((r) => r.json())
			.catch(() => []);
		const rolOptions = roles
			.map(
				(r) =>
					`<option value="${r.id_rol_usuario}" ${
						usuario.rol === r.nombre ? 'selected' : ''
					}>${r.nombre}</option>`
			)
			.join('');

		Swal.fire({
			title: 'Editar Usuario',
			html: `
        <input id="swal-username" class="swal2-input" value="${
					usuario.username
				}" placeholder="Username" readonly>
        <select id="swal-rol" class="swal2-input">${rolOptions}</select>
        <select id="swal-estado" class="swal2-input">
          <option value="1" ${
						usuario.estado === 'Activo' ? 'selected' : ''
					}>Activo</option>
          <option value="0" ${
						usuario.estado === 'Inactivo' ? 'selected' : ''
					}>Inactivo</option>
        </select>
      `,
			showCancelButton: true,
			confirmButtonText: 'Guardar',
			preConfirm: () => ({
				username: $('#swal-username').val(),
				id_rol_usuario: $('#swal-rol').val(),
				estado: $('#swal-estado').val() === '1',
			}),
		}).then((result) => {
			if (result.isConfirmed) {
				fetch(`/api/usuarios/${id}`, {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(result.value),
				})
					.then(() =>
						Swal.fire('Actualizado', 'Usuario modificado', 'success').then(() =>
							location.reload()
						)
					)
					.catch(() => Swal.fire('Error', 'No se pudo actualizar', 'error'));
			}
		});
	});

	// Eliminar usuario
	$(document).on('click', '.delete-btn', function () {
		const id = $(this).data('id');
		Swal.fire({
			title: '¿Eliminar usuario?',
			text: 'Esta acción eliminará el usuario permanentemente.',
			icon: 'warning',
			showCancelButton: true,
			confirmButtonText: 'Sí, eliminar',
			cancelButtonText: 'Cancelar',
		}).then((result) => {
			if (result.isConfirmed) {
				fetch(`/api/usuarios/${id}`, { method: 'DELETE' })
					.then(() =>
						Swal.fire('Eliminado', 'Usuario eliminado', 'success').then(() =>
							location.reload()
						)
					)
					.catch(() => Swal.fire('Error', 'No se pudo eliminar', 'error'));
			}
		});
	});
});
