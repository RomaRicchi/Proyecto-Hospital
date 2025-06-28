import { mostrarFormularioYRegistrarAdmision } from './utils/admisionUtils.js';
import { configurarBusquedaDeCamas } from './utils/validacionFechas.js';
$(document).ready(function () {
  configurarBusquedaDeCamas(buscarCamasDisponibles);
  const tabla = $('#tablaAdmisiones');

	if (tabla.length) {
		const dt = tabla.DataTable({
			language: { url: 'https://cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json' },
			paging: true,
      		pageLength: 10,
      		searching: true,
      		ordering: true,  
		  	destroy: true,
      		responsive: true,
		  	scrollX: false,
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
  mostrarFormularioYRegistrarAdmision(pacienteSeleccionado, id_cama, habitacionId);
	// Función para obtener opciones asociadas
	async function getOpcionesAdmision() {
		const res = await fetch('/api/admisiones/opciones');
		return await res.json();
	}

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
    const minFecha = new Date().toISOString().slice(0, 16);
		Swal.fire({
			title: 'Editar Admisión',
			html: `
        ${selectPacientes}
        ${selectObraSocial}
        <input id="swal-num_asociado" class="swal2-input" value="${admision.num_asociado || ''}" placeholder="N° Asociado">
        <input id="swal-fecha_hora_ingreso" type="datetime-local" class="swal2-input" min="${minFecha}" value="${admision.fecha_hora_ingreso ? admision.fecha_hora_ingreso.slice(0, 16) : ''}" placeholder="Fecha Ingreso">
        ${selectMotivo}
        <input id="swal-descripcion" class="swal2-input" value="${admision.descripcion || ''}" placeholder="Descripción">
        <input id="swal-fecha_hora_egreso" type="datetime-local" class="swal2-input" value="${admision.fecha_hora_egreso ? admision.fecha_hora_egreso.slice(0, 16) : ''}" placeholder="Fecha Egreso">
        <input id="swal-motivo_egr" class="swal2-input" value="${admision.motivo_egr || ''}" placeholder="Motivo Egreso">
        ${selectPersonal}
      `,
			showCancelButton: true,
			confirmButtonText: 'Guardar',
			preConfirm: () => {
        const fechaIngreso = $('#swal-fecha_hora_ingreso').val();
        if (!fechaIngreso) {
          Swal.showValidationMessage('La fecha de ingreso es obligatoria');
          return false;
        }

        const hoy = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
        const fechaSeleccionada = fechaIngreso.slice(0, 10);

        if (fechaSeleccionada < hoy) {
          Swal.showValidationMessage('No se puede seleccionar una fecha pasada');
          return false;
        }

        const esFuturo = fechaSeleccionada > hoy;

        return {
          id_paciente: $('#swal-id_paciente').val(),
          id_obra_social: $('#swal-id_obra_social').val(),
          num_asociado: $('#swal-num_asociado').val(),
          fecha_hora_ingreso: fechaIngreso,
          id_motivo: $('#swal-id_motivo').val(),
          descripcion: $('#swal-descripcion').val(),
          fecha_hora_egreso: $('#swal-fecha_hora_egreso').val(),
          motivo_egr: $('#swal-motivo_egr').val(),
          id_personal_salud: $('#swal-id_personal_salud').val() || null,
          id_mov: esFuturo ? 3 : 1
        };
      }
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
