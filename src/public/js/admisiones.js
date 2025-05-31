$(document).ready(function () {
	const tabla = $('#tablaAdmisiones');

	if (tabla.length) {
		const dt = tabla.DataTable({
			language: { url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json' },
			paging: true,
			pageLength: 5,
			searching: true,
			ordering: true,
			columnDefs: [{ targets: [8], orderable: false, searchable: false }],
		});

		dt.on('draw', function () {
			const noResults = dt.rows({ filter: 'applied' }).data().length === 0;
			$('#btnAgregarAdmision').remove();
			if (noResults) {
				$('#tablaAdmisiones_wrapper').append(`
					<div class="text-center mt-3">
						<button id="btnAgregarAdmision" class="btn btn-success">
							Agregar Nueva Admisión
						</button>
					</div>
				`);
			}
		});
	}

	// 🔸 Agregar admisión (aquí solo es ejemplo, adaptalo según tus campos)
	$(document).on('click', '#btnAgregarAdmision', function () {
		Swal.fire({
			title: 'Agregar Nueva Admisión',
			html: `
				<input id="swal-id_paciente" class="swal2-input" placeholder="ID Paciente">
				<input id="swal-id_obra_social" class="swal2-input" placeholder="ID Obra Social">
				<input id="swal-num_asociado" class="swal2-input" placeholder="N° Asociado">
				<input id="swal-descripcion" class="swal2-input" placeholder="Motivo Ingreso">
			`,
			showCancelButton: true,
			confirmButtonText: 'Guardar',
			preConfirm: () => ({
				id_paciente: $('#swal-id_paciente').val(),
				id_obra_social: $('#swal-id_obra_social').val(),
				num_asociado: $('#swal-num_asociado').val(),
				descripcion: $('#swal-descripcion').val(),
			}),
		}).then((result) => {
			if (result.isConfirmed) {
				fetch('/api/admisiones', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(result.value),
				})
					.then(() =>
						Swal.fire('Agregado', 'Admisión creada con éxito', 'success').then(
							() => location.reload()
						)
					)
					.catch(() => Swal.fire('Error', 'No se pudo crear', 'error'));
			}
		});
	});

	// 🔸 Editar admisión
	$(document).on('click', '.edit-btn', async function () {
		const id = $(this).data('id');
		const admision = await fetch(`/api/admisiones/${id}`).then((r) => r.json());

		Swal.fire({
			title: 'Editar Admisión',
			html: `
				<input id="swal-num_asociado" class="swal2-input" value="${admision.num_asociado}" placeholder="N° Asociado">
				<input id="swal-descripcion" class="swal2-input" value="${admision.descripcion}" placeholder="Motivo Ingreso">
			`,
			showCancelButton: true,
			confirmButtonText: 'Guardar',
			preConfirm: () => ({
				num_asociado: $('#swal-num_asociado').val(),
				descripcion: $('#swal-descripcion').val(),
			}),
		}).then((result) => {
			if (result.isConfirmed) {
				fetch(`/api/admisiones/${id}`, {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(result.value),
				})
					.then(() =>
						Swal.fire('Actualizado', 'Admisión modificada', 'success').then(
							() => location.reload()
						)
					)
					.catch(() => Swal.fire('Error', 'No se pudo actualizar', 'error'));
			}
		});
	});

	// 🔸 Eliminar admisión
	$(document).on('click', '.delete-btn', function () {
		const id = $(this).data('id');
		Swal.fire({
			title: '¿Eliminar admisión?',
			text: 'Esta acción eliminará la admisión permanentemente.',
			icon: 'warning',
			showCancelButton: true,
			confirmButtonText: 'Sí, eliminar',
			cancelButtonText: 'Cancelar',
		}).then((result) => {
			if (result.isConfirmed) {
				fetch(`/api/admisiones/${id}`, { method: 'DELETE' })
					.then(() =>
						Swal.fire('Eliminado', 'Admisión eliminada', 'success').then(() =>
							location.reload()
						)
					)
					.catch(() => Swal.fire('Error', 'No se pudo eliminar', 'error'));
			}
		});
	});
});
