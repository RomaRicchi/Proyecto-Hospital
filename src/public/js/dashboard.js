import { mostrarFormularioYRegistrarAdmision } from './utils/admisionCompleta.js';
import { configurarBusquedaDeCamas } from './utils/validacionFechas.js';


	function buscarCamasDisponibles(fecha) {
		$('#tablaCamasContainer').html(
			'<div class="text-center my-4"><div class="spinner-border"></div> Cargando...</div>'
		);
		fetch(`/api/camas/disponibles?fecha=${fecha}`)
			.then((res) => res.json())
			.then((camas) => {
				renderTablaCamas(camas);
			})
			.catch(() => {
				$('#tablaCamasContainer').html(
					'<div class="alert alert-danger">Error al cargar las camas.</div>'
				);
			});
	}

	function renderTablaCamas(camas) {
		let html = `
      <table id="tablaCamas" class="table table-bordered table-hover">
        <thead class="table-light">
          <tr>
            <th>Sector</th>
            <th>Habitación</th>
            <th>Cama</th>
            <th>Estado</th>
			<th>Desinfección</th>
            <th>Paciente</th>
            <th>Género</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
    `;
		if (camas.length === 0) {
			html += `<tr><td colspan="6" class="text-center">No hay camas para la fecha seleccionada.</td></tr>`;
		} else {
			camas.forEach((cama) => {
				let desinfeccionBadge = Number(cama.desinfeccion) === 1
					? '<span class="badge bg-success">Sí</span>'
					: '<span class="badge bg-secondary">No</span>';
				let estadoBadge = '';
				if (cama.estado === 'Disponible') {
					estadoBadge = '<span class="badge bg-success">Disponible</span>';
				} else if (cama.estado === 'Ocupada') {
					estadoBadge = '<span class="badge bg-danger">Ocupada</span>';
				} else if (cama.estado === 'Reservada') {
					estadoBadge = '<span class="badge bg-warning text-dark">Reservada</span>';
				} else {
					estadoBadge = '<span class="badge bg-secondary">Desconocido</span>';
				}
				html += `
				<tr>
					<td>${cama.sector || '-'}</td>
					<td>${cama.habitacion || '-'}</td>
					<td>${cama.nombre_cama || '-'}</td>
					<td>${estadoBadge}</td>
					<td>${desinfeccionBadge}</td>
					<td>${cama.paciente || '-'}</td>
					<td>${cama.genero || '-'}</td>
					<td>
					<button class="btn btn-sm btn-primary btn-asignar-paciente"
						${cama.estado !== 'Disponible' || Number(cama.desinfeccion) !== 1 ? 'disabled' : ''}
						data-id="${cama.id_cama}">
						Asignar paciente
					</button>
					</td>
				</tr>
				`;
			});
		}
		html += `</tbody></table>`;
		$('#tablaCamasContainer').html(html);

		$('#tablaCamas').DataTable({
			language: { url: 'https://cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json' },
			paging: true,
			pageLength: 10,
			searching: true,
			ordering: true,
			destroy: true,
		});
	}

$(document).ready(function () {
	configurarBusquedaDeCamas(buscarCamasDisponibles);
});
// Evento para el botón de asignar paciente
$(document).on('click', '.btn-asignar-paciente', function () {
	const id_cama = $(this).data('id');
	let pacienteSeleccionado = null;
	let camaSeleccionada = null;
	let habitacionId = null;

	// Paso 1: Buscar paciente por DNI
	Swal.fire({
		title: 'Buscar Paciente por DNI',
		input: 'text',
		inputLabel: 'Ingrese DNI del paciente',
		inputPlaceholder: 'DNI',
		showCancelButton: true,
		confirmButtonText: 'Buscar',
		preConfirm: (dni) => {
			if (!dni) {
				Swal.showValidationMessage('Debe ingresar un DNI');
				return false;
			}
			return fetch(`/api/pacientes?dni=${dni}`)
				.then((res) => res.json())
				.then((pacientes) => {
					const dniBuscado = parseInt(Swal.getInput().value, 10);
					const paciente = pacientes.find((p) => p.dni_paciente === dniBuscado);
					if (!paciente) {
						throw new Error('No encontrado');
					}
					pacienteSeleccionado = paciente;
					return paciente;
				})
				.catch(() => {
					// Mostrar un nuevo Swal con botón para registrar
					Swal.fire({
						title: 'Paciente no encontrado',
						html: '¿Desea registrar un nuevo paciente?',
						icon: 'question',
						showCancelButton: true,
						confirmButtonText: 'Registrar',
						cancelButtonText: 'Cancelar',
					}).then((r) => {
						if (r.isConfirmed) {
							window.location.href = '/paciente';
						}
					});
					return false;
				});
		},
	}).then(async (result) => {
		if (result.isConfirmed && pacienteSeleccionado) {
			// Paso 2: Obtener datos de la cama y habitación
			camaSeleccionada = await fetch(`/api/camas/${id_cama}`).then((r) =>
				r.json()
			);
			habitacionId = camaSeleccionada.id_habitacion;

			// Mostrar datos del paciente para confirmar
			const datos = `
                <strong>Nombre:</strong> ${pacienteSeleccionado.apellido_p}, ${
				pacienteSeleccionado.nombre_p
			}<br>
                <strong>DNI:</strong> ${pacienteSeleccionado.dni_paciente}<br>
                <strong>Género:</strong> ${
									pacienteSeleccionado.genero
										? pacienteSeleccionado.genero.nombre
										: ''
								}
            `;
			Swal.fire({
				title: '¿Es este el paciente correcto?',
				html: datos,
				showCancelButton: true,
				confirmButtonText: 'Sí, continuar',
				cancelButtonText: 'No, cancelar',
			}).then(async (confirma) => {
				if (confirma.isConfirmed) {
					// Verificar conflicto de género antes de mostrar el formulario
					const resp = await fetch(
						'/api/movimientos_habitacion/verificar-genero',
						{
							method: 'POST',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({
								id_habitacion: habitacionId,
								id_cama: id_cama,
								id_genero: pacienteSeleccionado.genero.id_genero,
							}),
						}
					);
					const data = await resp.json();
					if (!resp.ok) {
						Swal.fire(
							'No permitido',
							data.message || 'Conflicto de género',
							'error'
						);
						return;
					}
					// Validar si el paciente ya tiene admisión vigente o futura
					const validar = await fetch(
						`/api/admisiones/validar-dni/${pacienteSeleccionado.dni_paciente}`
					);
					const resultado = await validar.json();

					if (resultado.vigente) {
						Swal.fire(
							'Atención',
							'El paciente ya tiene una admisión vigente o en curso. No puede registrar otra.',
							'warning'
						);
						return;
					}

					// Si no tiene admisión activa, mostrar el formulario
					mostrarFormularioYRegistrarAdmision(pacienteSeleccionado, id_cama, habitacionId);
				}
			});
		} else if (result.dismiss === Swal.DismissReason.cancel) {
			return;
		} else {
			// Si no se encontró el paciente, ofrecer ir a registrar
			Swal.fire({
				title: 'Paciente no encontrado',
				text: '¿Desea registrar un nuevo paciente?',
				icon: 'question',
				showCancelButton: true,
				confirmButtonText: 'Registrar',
				cancelButtonText: 'Cancelar',
			}).then((r) => {
				if (r.isConfirmed) {
					window.location.href = '/paciente';
				}
			});
		}
	});
});

