$(document).ready(async function () {
  const tabla = $('#tablaUsuarios');

  if (tabla.length) {
    const usuarios = await fetch('/api/usuarios').then(r => r.json()).catch(() => []);

    const dt = tabla.DataTable({
      data: usuarios,
      columns: [
        { title: 'Username', data: 'username' },
        { title: 'Nombre completo', data: 'nombre_completo' },
        { title: 'Email', data: 'email' },
        { title: 'Tipo', data: 'tipo' },
        { title: 'Rol', data: 'rol' },
        { title: 'Especialidad', data: 'especialidad' },
        { title: 'Estado', data: 'estado' },
        {
          title: 'Acciones',
          data: null,
          orderable: false,
          searchable: false,
          render: (data, type, row) => `
            <button class="btn btn-sm btn-primary me-1 edit-btn" data-id="${row.id_usuario}">
              <i class="fas fa-pen"></i>
            </button>
            <button class="btn btn-sm btn-danger delete-btn" data-id="${row.id_usuario}">
              <i class="fas fa-trash"></i>
            </button>
          `
        }
      ],
      language: { url: 'https://cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json' },
      paging: true,
      pageLength: 10,
      searching: true,
      ordering: true,
      destroy: true,
      responsive: true,
      scrollX: false,
      columnDefs: [{ targets: [7], orderable: false, searchable: false }],
    });
  }
	$(document).on('click', '#btnAgregarUsuario', async function () {
	const roles = await fetch('/api/roles').then(r => r.json()).catch(() => []);
	const especialidades = await fetch('/api/especialidades').then(r => r.json()).catch(() => []);

	const rolOptions = roles.map(r => `<option value="${r.id_rol_usuario}">${r.nombre}</option>`).join('');
	const especOptions = `<option value="">Sin especialidad</option>` + 
		especialidades.map(e => `<option value="${e.id_especialidad}">${e.nombre}</option>`).join('');

	Swal.fire({
		title: 'Agregar Nuevo Usuario',
		html: `
		<input id="swal-username" class="swal2-input" placeholder="Username">
		<input id="swal-email" class="swal2-input" placeholder="Correo electrónico">
		<input id="swal-password" class="swal2-input" placeholder="Contraseña" type="password">
		<input id="swal-apellido" class="swal2-input" placeholder="Apellido">
		<input id="swal-nombre" class="swal2-input" placeholder="Nombre">
		<select id="swal-rol" class="swal2-input">${rolOptions}</select>
		<select id="swal-especialidad" class="swal2-input" style="display:none;">${especOptions}</select>
		<input id="swal-matricula" class="swal2-input" placeholder="Matrícula" style="display:none;">
		`,
		customClass: {
			popup: 'swal2-card-style'
		},
		didOpen: () => {
		const rolSelect = document.getElementById('swal-rol');
		const especField = document.getElementById('swal-especialidad');
		const matField = document.getElementById('swal-matricula');

		const toggleFields = () => {
			const rol = parseInt(rolSelect.value);
			if ([3, 4].includes(rol)) {
			especField.style.display = 'block';
			matField.style.display = 'block';
			} else {
			especField.style.display = 'none';
			matField.style.display = 'none';
			}
		};

		rolSelect.addEventListener('change', toggleFields);
		toggleFields();
		},
		showCancelButton: true,
		confirmButtonText: 'Guardar',
		customClass: {
			popup: 'swal2-card-style'
		},
		preConfirm: async () => {
		const username = $('#swal-username').val();
		const email = $('#swal-email').val();
		const password = $('#swal-password').val();
		const apellido = $('#swal-apellido').val();
		const nombre = $('#swal-nombre').val();
		const rol = $('#swal-rol').val();
		const id_especialidad = $('#swal-especialidad').is(':visible') ? $('#swal-especialidad').val() || null : null;
		const matricula = $('#swal-matricula').is(':visible') ? $('#swal-matricula').val() || null : null;

		if (!username || !password || !apellido || !nombre || !rol|| !email) {
			Swal.showValidationMessage('Todos los campos obligatorios deben completarse');
			return false;
		}
		if (!email.includes('@')) {
			Swal.showValidationMessage('Email inválido');
			return false;
		}
		if (password.length < 5) {
			Swal.showValidationMessage('La contraseña debe tener al menos 5 caracteres');
			return false;
		}
		try {
			const existe = await fetch(`/api/usuarios/validar-email/${encodeURIComponent(email)}`)
			.then(r => r.json())
			.then(d => d.existe);

			if (existe) {
			Swal.showValidationMessage('Este email ya está registrado');
			return false;
			}
		} catch (err) {
			Swal.showValidationMessage('Error al validar email');
			return false;
		}

		return {
			username,
			email,
			password,
			apellido,
			nombre,
			id_rol_usuario: rol,
			id_especialidad,
			matricula
		};
		},
	}).then((result) => {
		if (result.isConfirmed) {
		fetch('/api/usuarios', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(result.value),
		})
			.then(() => Swal.fire('Agregado', 'Usuario creado con éxito', 'success').then(() => location.reload()))
			.catch(() => Swal.fire('Error', 'No se pudo crear el usuario', 'error'));
		}
	});
	});

	$(document).on('click', '.edit-btn', async function () {
	const id = $(this).data('id');

	const usuario = await fetch(`/api/usuarios/${id}`).then(r => r.json());
	const roles = await fetch('/api/roles').then(r => r.json()).catch(() => []);
	const especialidades = await fetch('/api/especialidades').then(r => r.json()).catch(() => []);

	const rolOptions = roles.map(
		r => `<option value="${r.id_rol_usuario}" ${r.id_rol_usuario == usuario.id_rol_usuario ? 'selected' : ''}>${r.nombre}</option>`
	).join('');

	const especOptions = `<option value="">Sin especialidad</option>` +
		especialidades.map(
		e => `<option value="${e.id_especialidad}" ${e.nombre === usuario.especialidad ? 'selected' : ''}>${e.nombre}</option>`
		).join('');

	Swal.fire({
		title: 'Editar Usuario',
		html: `
		<input id="swal-username" class="swal2-input" value="${usuario.username}" placeholder="Username" readonly>
		<input id="swal-email" class="swal2-input" value="${usuario.email || ''}" placeholder="Correo electrónico">
		<select id="swal-rol" class="swal2-input">${rolOptions}</select>
		<select id="swal-especialidad" class="swal2-input" style="display:none;">${especOptions}</select>
		<input id="swal-matricula" class="swal2-input" placeholder="Matrícula" value="${usuario.matricula || ''}" style="display:none;">
		<select id="swal-estado" class="swal2-input">
			<option value="1" ${usuario.estado === 'Activo' ? 'selected' : ''}>Activo</option>
			<option value="0" ${usuario.estado === 'Inactivo' ? 'selected' : ''}>Inactivo</option>
		</select>
		`,
		customClass: {
			popup: 'swal2-card-style'
		},
		didOpen: () => {
		const rolSelect = document.getElementById('swal-rol');
		const especField = document.getElementById('swal-especialidad');
		const matField = document.getElementById('swal-matricula');

		const showOrHideFields = () => {
			const rol = parseInt(rolSelect.value);
			if ([3, 4].includes(rol)) {
			especField.style.display = 'block';
			matField.style.display = 'block';
			} else {
			especField.style.display = 'none';
			matField.style.display = 'none';
			}
		};

		showOrHideFields();
		rolSelect.addEventListener('change', showOrHideFields);
		},
		showCancelButton: true,
		confirmButtonText: 'Guardar',
		customClass: {
			popup: 'swal2-card-style'
		},
		preConfirm: async () => {
			  try {
				const existe = await fetch(`/api/usuarios/validar-email/${encodeURIComponent(email)}`)
				.then(r => r.json())
				.then(d => d.existe);

				if (existe) {
				Swal.showValidationMessage('Este email ya está registrado');
				return false;
				}
			} catch (err) {
				Swal.showValidationMessage('Error al validar email');
				return false;
			}

		return {
			username: $('#swal-username').val(),
			email: $('#swal-email').val(),
			id_rol_usuario: $('#swal-rol').val(),
			id_especialidad: $('#swal-especialidad').is(':visible') ? $('#swal-especialidad').val() || null : null,
			matricula: $('#swal-matricula').is(':visible') ? $('#swal-matricula').val() || null : null,
			estado: $('#swal-estado').val() === '1',
		};
		},
	}).then(result => {
		if (result.isConfirmed) {
		fetch(`/api/usuarios/${id}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(result.value),
		})
			.then(() => Swal.fire('Actualizado', 'Usuario modificado', 'success').then(() => location.reload()))
			.catch(() => Swal.fire('Error', 'No se pudo actualizar', 'error'));
		}
	});
	});

	$(document).on('click', '.delete-btn', function () {
	const id = $(this).data('id');
	Swal.fire({
		title: '¿Eliminar usuario?',
		text: 'Esta acción marcará el usuario como inactivo.',
		icon: 'warning',
		showCancelButton: true,
		confirmButtonText: 'Sí, eliminar',
		cancelButtonText: 'Cancelar',
		customClass: {
			popup: 'swal2-card-style'
		},
	}).then((result) => {
		if (result.isConfirmed) {
		fetch(`/api/usuarios/${id}`, {
			method: 'DELETE',
		})
			.then(() => {
			Swal.fire('Eliminado', 'Usuario marcado como inactivo', 'success').then(() =>
				location.reload()
			);
			})
			.catch(() => Swal.fire('Error', 'No se pudo eliminar', 'error'));
		}
	});
	});
});
