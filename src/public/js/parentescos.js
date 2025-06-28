$(document).ready(function () {
	const tabla = $('#tablaParentesco');
	if (!tabla.length) return;

	
	function validarNombre(nombre) {
		if (!nombre || !nombre.trim()) {
			return 'El nombre del parentesco es obligatorio.';
		}
		const limpio = nombre.trim();
		if (limpio.length < 3 || limpio.length > 50) {
			return 'Debe tener entre 3 y 50 caracteres.';
		}
		if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]+$/.test(limpio)) {
			return 'Solo se permiten letras y espacios.';
		}
		return null;
	}

	// 🔄 Cargar tabla
	fetch('/api/parentescos')
		.then(res => res.json())
		.then(parentescos => {
			const dataSet = parentescos.map(p => [
				p.nombre,
				`
					<button class="btn btn-sm btn-primary edit-btn" data-id="${p.id_parentesco}">
						<i class="fas fa-pen"></i>
					</button>
					<button class="btn btn-sm btn-danger delete-btn" data-id="${p.id_parentesco}">
						<i class="fas fa-trash"></i>
					</button>
				`
			]);

			const dataTable = tabla.DataTable({
				language: { url: 'https://cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json' },
				paging: true,
				pageLength: 10,
				searching: true,
				ordering: true,  
				destroy: true,
				responsive: true,
				scrollX: false,
				columns: [
					{ title: 'Nombre' },
					{ title: 'Acciones', orderable: false, searchable: false }
				]
			});

			dataTable.on('draw', function () {
				$('#btnAgregarParentesco').remove();
				if (dataTable.rows({ filter: 'applied' }).data().length === 0) {
					$('#tablaParentesco_wrapper').append(`
						<div class="text-center mt-3" id="btnAgregarParentesco">
							<button class="btn btn-success">
								<i class="fas fa-plus-circle me-1"></i> Agregar Nuevo Parentesco
							</button>
						</div>
					`);
				}
			});
			dataTable.draw();
		})
		.catch(() => {
			Swal.fire('Error', 'No se pudo cargar los parentescos.', 'error');
		});

	// 🟢 Agregar parentesco
	$(document).on('click', '#btnAgregarParentesco button', function () {
		Swal.fire({
			title: 'Agregar Parentesco',
			input: 'text',
			inputLabel: 'Nombre del parentesco',
			inputPlaceholder: 'Ingrese el nombre',
			showCancelButton: true,
			confirmButtonText: 'Guardar',
			preConfirm: (nombre) => {
				const err = validarNombre(nombre);
				if (err) {
					Swal.showValidationMessage(err);
					return false;
				}
				return { nombre: nombre.trim() };
			}
		}).then((result) => {
			if (!result.isConfirmed) return;
			fetch('/api/parentescos', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(result.value)
			})
				.then(() => Swal.fire('Guardado', 'Parentesco creado', 'success').then(() => location.reload()))
				.catch(() => Swal.fire('Error', 'No se pudo crear el parentesco', 'error'));
		});
	});

	// ✏️ Editar
	$(document).on('click', '.edit-btn', function () {
		const id = $(this).data('id');
		fetch(`/api/parentescos/${id}`)
			.then(res => res.json())
			.then(p => {
				Swal.fire({
					title: 'Editar Parentesco',
					input: 'text',
					inputValue: p.nombre,
					inputLabel: 'Nombre del parentesco',
					showCancelButton: true,
					confirmButtonText: 'Guardar',
					preConfirm: (nombre) => {
						const err = validarNombre(nombre);
						if (err) {
							Swal.showValidationMessage(err);
							return false;
						}
						return { nombre: nombre.trim() };
					}
				}).then(result => {
					if (!result.isConfirmed) return;
					fetch(`/api/parentescos/${id}`, {
						method: 'PUT',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify(result.value)
					})
						.then(() => Swal.fire('Actualizado', 'Parentesco modificado', 'success').then(() => location.reload()))
						.catch(() => Swal.fire('Error', 'No se pudo actualizar el parentesco', 'error'));
				});
			})
			.catch(() => Swal.fire('Error', 'No se pudo cargar el parentesco', 'error'));
	});

	// 🗑️ Eliminar
	$(document).on('click', '.delete-btn', function () {
		const id = $(this).data('id');
		Swal.fire({
			title: '¿Eliminar parentesco?',
			text: 'Esta acción eliminará el parentesco permanentemente.',
			icon: 'warning',
			showCancelButton: true,
			confirmButtonText: 'Sí, eliminar',
			cancelButtonText: 'Cancelar'
		}).then(result => {
			if (!result.isConfirmed) return;
			fetch(`/api/parentescos/${id}`, { method: 'DELETE' })
				.then(() => Swal.fire('Eliminado', 'Parentesco eliminado', 'success').then(() => location.reload()))
				.catch(() => Swal.fire('Error', 'No se pudo eliminar el parentesco', 'error'));
		});
	});
});
