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

	// Función para obtener opciones asociadas
	async function getOpcionesAdmision() {
		const res = await fetch('/api/admisiones/opciones');
		return await res.json();
	}

	// 🔸Agregar admisión
	$(document).on('click', '#btnAgregarAdmision', async function () {
		const opciones = await getOpcionesAdmision();

		const selectPacientes = `
            <select id="swal-id_paciente" class="swal2-input">
                ${opciones.pacientes
									.map(
										(p) =>
											`<option value="${p.id_paciente}">${p.apellido_p} ${p.nombre_p}</option>`
									)
									.join('')}
            </select>
        `;
		const selectObraSocial = `
            <select id="swal-id_obra_social" class="swal2-input">
                ${opciones.obrasSociales
									.map(
										(o) =>
											`<option value="${o.id_obra_social}">${o.nombre}</option>`
									)
									.join('')}
            </select>
        `;
		const selectMotivo = `
            <select id="swal-id_motivo" class="swal2-input">
                ${opciones.motivos
									.map(
										(m) => `<option value="${m.id_motivo}">${m.tipo}</option>`
									)
									.join('')}
            </select>
        `;
		const selectPersonal = `
            <select id="swal-id_personal_salud" class="swal2-input">
                <option value="">-</option>
                ${opciones.personal
									.map(
										(u) =>
											`<option value="${u.id_usuario}">${u.username}</option>`
									)
									.join('')}
            </select>
        `;

		Swal.fire({
			title: 'Agregar Nueva Admisión',
			html: `
                ${selectPacientes}
                ${selectObraSocial}
                <input id="swal-num_asociado" class="swal2-input" placeholder="N° Asociado">
                ${selectMotivo}
                <input id="swal-descripcion" class="swal2-input" placeholder="Descripción">
                <input id="swal-fecha_hora_ingreso" type="datetime-local" class="swal2-input" placeholder="Fecha Ingreso">
                <input id="swal-fecha_hora_egreso" type="datetime-local" class="swal2-input" placeholder="Fecha Egreso">
                <input id="swal-motivo_egr" class="swal2-input" placeholder="Motivo Egreso">
                ${selectPersonal}
            `,
			showCancelButton: true,
			confirmButtonText: 'Guardar',
			preConfirm: () => ({
				id_paciente: $('#swal-id_paciente').val(),
				id_obra_social: $('#swal-id_obra_social').val(),
				num_asociado: $('#swal-num_asociado').val(),
				id_motivo: $('#swal-id_motivo').val(),
				descripcion: $('#swal-descripcion').val(),
				fecha_hora_ingreso: $('#swal-fecha_hora_ingreso').val(),
				fecha_hora_egreso: $('#swal-fecha_hora_egreso').val(),
				motivo_egr: $('#swal-motivo_egr').val(),
				id_personal_salud: $('#swal-id_personal_salud').val() || null,
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
		const opciones = await getOpcionesAdmision();

		const selectPacientes = `
            <select id="swal-id_paciente" class="swal2-input">
                ${opciones.pacientes
									.map(
										(p) =>
											`<option value="${p.id_paciente}" ${
												admision.id_paciente === p.id_paciente ? 'selected' : ''
											}>
                        ${p.apellido_p} ${p.nombre_p}
                    </option>`
									)
									.join('')}
            </select>
        `;
		const selectObraSocial = `
            <select id="swal-id_obra_social" class="swal2-input">
                ${opciones.obrasSociales
									.map(
										(o) =>
											`<option value="${o.id_obra_social}" ${
												admision.id_obra_social === o.id_obra_social
													? 'selected'
													: ''
											}>
                        ${o.nombre}
                    </option>`
									)
									.join('')}
            </select>
        `;
		const selectMotivo = `
            <select id="swal-id_motivo" class="swal2-input">
                ${opciones.motivos
									.map(
										(m) =>
											`<option value="${m.id_motivo}" ${
												admision.id_motivo === m.id_motivo ? 'selected' : ''
											}>
                        ${m.tipo}
                    </option>`
									)
									.join('')}
            </select>
        `;
		const selectPersonal = `
            <select id="swal-id_personal_salud" class="swal2-input">
                <option value="">-</option>
                ${opciones.personal
									.map(
										(u) =>
											`<option value="${u.id_usuario}" ${
												admision.id_personal_salud === u.id_usuario
													? 'selected'
													: ''
											}>
                        ${u.username}
                    </option>`
									)
									.join('')}
            </select>
        `;

		Swal.fire({
			title: 'Editar Admisión',
			html: `
                ${selectPacientes}
                ${selectObraSocial}
                <input id="swal-num_asociado" class="swal2-input" value="${
									admision.num_asociado || ''
								}" placeholder="N° Asociado">
                ${selectMotivo}
                <input id="swal-descripcion" class="swal2-input" value="${
									admision.descripcion || ''
								}" placeholder="Descripción">
                <input id="swal-fecha_hora_ingreso" type="datetime-local" class="swal2-input" value="${
									admision.fecha_hora_ingreso
										? admision.fecha_hora_ingreso.slice(0, 16)
										: ''
								}" placeholder="Fecha Ingreso">
                <input id="swal-fecha_hora_egreso" type="datetime-local" class="swal2-input" value="${
									admision.fecha_hora_egreso
										? admision.fecha_hora_egreso.slice(0, 16)
										: ''
								}" placeholder="Fecha Egreso">
                <input id="swal-motivo_egr" class="swal2-input" value="${
									admision.motivo_egr || ''
								}" placeholder="Motivo Egreso">
                ${selectPersonal}
            `,
			showCancelButton: true,
			confirmButtonText: 'Guardar',
			preConfirm: () => ({
				id_paciente: $('#swal-id_paciente').val(),
				id_obra_social: $('#swal-id_obra_social').val(),
				num_asociado: $('#swal-num_asociado').val(),
				id_motivo: $('#swal-id_motivo').val(),
				descripcion: $('#swal-descripcion').val(),
				fecha_hora_ingreso: $('#swal-fecha_hora_ingreso').val(),
				fecha_hora_egreso: $('#swal-fecha_hora_egreso').val(),
				motivo_egr: $('#swal-motivo_egr').val(),
				id_personal_salud: $('#swal-id_personal_salud').val() || null,
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
