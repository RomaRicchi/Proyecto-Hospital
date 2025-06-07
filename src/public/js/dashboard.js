$(document).ready(function () {
	// Manejar el submit del formulario de búsqueda
	$('#formBuscarCamas').on('submit', function (e) {
		e.preventDefault();
		const fecha = $('#fecha_busqueda').val();
		if (!fecha) {
			Swal.fire('Atención', 'Debe seleccionar una fecha.', 'warning');
			return;
		}
		buscarCamasDisponibles(fecha);
	});

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
            <th>Paciente</th>
            <th>Género</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
    `;
		if (camas.length === 0) {
			html += `<tr><td colspan="7" class="text-center">No hay camas para la fecha seleccionada.</td></tr>`;
		} else {
			camas.forEach((cama) => {
				let estadoBadge = '';
				if (cama.estado === 'Disponible')
					estadoBadge = '<span class="badge bg-success">Disponible</span>';
				else if (cama.estado === 'Ocupada')
					estadoBadge = '<span class="badge bg-danger">Ocupada</span>';
				else if (cama.estado === 'Reservada')
					estadoBadge =
						'<span class="badge bg-warning text-dark">Reservada</span>';

				html += `
          <tr>
            <td>${cama.sector || '-'}</td>
            <td>${cama.habitacion || '-'}</td>
            <td>${cama.nombre_cama || '-'}</td>
            <td>${estadoBadge}</td>
            <td>${cama.paciente || '-'}</td>
            <td>${cama.genero || '-'}</td>
            <td>
              <button class="btn btn-sm btn-primary btn-asignar-paciente" ${
								cama.estado !== 'Disponible' ? 'disabled' : ''
							} data-id="${cama.id_cama}">
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
			language: {
				url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json',
			},
			paging: true,
			pageLength: 10,
			searching: true,
			ordering: true,
			destroy: true,
		});
	}
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
					Swal.showValidationMessage(
						'Paciente no encontrado. ¿Desea registrarlo?'
					);
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
					// Si no hay conflicto, mostrar formulario de admisión
					formularioAdmision(pacienteSeleccionado, id_cama, habitacionId);
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

// Paso 4: Formulario de admisión y creación de movimiento
async function formularioAdmision(paciente, id_cama, id_habitacion) {
	console.log(
		'Entrando a formularioAdmision',
		paciente,
		id_cama,
		id_habitacion
	);
	// Cargar selects desde la base de datos
	const motivos = await fetch('/api/motivos_ingreso').then((r) => r.json());
	const obras = await fetch('/api/obras-sociales').then((r) => r.json());

	let motivosOptions = motivos
		.map((m) => `<option value="${m.id_motivo}">${m.tipo}</option>`)
		.join('');
	let obrasOptions = obras
		.map((o) => `<option value="${o.id_obra_social}">${o.nombre}</option>`)
		.join('');

	Swal.fire({
		title: 'Registrar Admisión',
		html: `
        <select id="id_obra_social" class="swal2-input">${obrasOptions}</select>
        <input type="text" id="num_asociado" class="swal2-input" placeholder="N° Asociado">
        <select id="id_motivo" class="swal2-input">${motivosOptions}</select>
        <label for="fecha_hora_ingreso" style="display:block;text-align:left;margin-top:8px;">Fecha y hora de ingreso</label>
        <input type="datetime-local" id="fecha_hora_ingreso" class="swal2-input" placeholder="Fecha y hora ingreso">
        <label for="fecha_hora_egreso" style="display:block;text-align:left;margin-top:8px;">Fecha y hora de egreso (opcional)</label>
        <input type="datetime-local" id="fecha_hora_egreso" class="swal2-input" placeholder="Fecha y hora egreso (opcional)">
        <input type="text" id="descripcion" class="swal2-input" placeholder="Descripción">
        <input type="text" id="motivo_egr" class="swal2-input" placeholder="Motivo egreso (opcional)">
        <input type="number" id="id_personal_salud" class="swal2-input" placeholder="ID personal salud (opcional)">
    `,
		preConfirm: () => {
			console.log('Entrando a preConfirm de admisión');
			const id_obra_social =
				Swal.getPopup().querySelector('#id_obra_social').value;
			const num_asociado = Swal.getPopup().querySelector('#num_asociado').value;
			const id_motivo = Swal.getPopup().querySelector('#id_motivo').value;
			const fecha_hora_ingreso = Swal.getPopup().querySelector(
				'#fecha_hora_ingreso'
			).value;
			const fecha_hora_egreso =
				Swal.getPopup().querySelector('#fecha_hora_egreso').value;
			const descripcion = Swal.getPopup().querySelector('#descripcion').value;
			const motivo_egr = Swal.getPopup().querySelector('#motivo_egr').value;
			const id_personal_salud =
				Swal.getPopup().querySelector('#id_personal_salud').value;

			if (
				!id_obra_social ||
				!num_asociado ||
				!id_motivo ||
				!fecha_hora_ingreso
			) {
				Swal.showValidationMessage('Completa todos los campos obligatorios');
			}
			return {
				id_obra_social,
				num_asociado,
				id_motivo,
				fecha_hora_ingreso,
				fecha_hora_egreso: fecha_hora_egreso || null,
				descripcion,
				motivo_egr,
				id_personal_salud: id_personal_salud || null,
			};
		},
	}).then(async (result) => {
		if (result.isConfirmed) {
			console.log('Swal de admisión confirmado');
			const admision = await fetch('/api/admisiones', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					id_paciente: paciente.id_paciente,
					id_obra_social: result.value.id_obra_social,
					num_asociado: result.value.num_asociado,
					id_motivo: result.value.id_motivo,
					fecha_hora_ingreso: result.value.fecha_hora_ingreso,
					fecha_hora_egreso: result.value.fecha_hora_egreso,
					descripcion: result.value.descripcion,
					motivo_egr: result.value.motivo_egr,
					id_personal_salud: result.value.id_personal_salud,
				}),
			}).then((r) => r.json());
			console.log('Respuesta de admisión:', admision);
			// Crear movimiento habitación y manejar error de género
			console.log('Enviando movimiento habitación');
			const resp = await fetch('/api/movimientos_habitacion', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					id_admision: admision.id_admision,
					id_habitacion: id_habitacion,
					id_cama: id_cama,
					fecha_hora_ingreso: admision.fecha_hora_ingreso,
					fecha_hora_egreso: admision.fecha_hora_egreso || null, // <-- AGREGADO
					id_mov: 1, // Ocupa
					estado: 1,
				}),
			});

			if (!resp.ok) {
				const data = await resp.json();
				console.log(
					'Mostrando Swal de error por conflicto de género:',
					data.message
				);
				Swal.fire(
					'Error',
					data.message || 'No se pudo asignar la cama',
					'error'
				);
				return;
			}

			console.log('Mostrando Swal de admisión exitosa');
			Swal.fire(
				'Listo',
				'Paciente asignado y admitido correctamente',
				'success'
			).then(() => location.reload());
		}
	});
}
