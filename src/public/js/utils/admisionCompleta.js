import {
  aplicarReservaSemanal,
  getFechaLocalParaInput,
  toUTC, 
  validarFechaReservaRango, 
  validarFechaNoPasada 
} from './validacionFechas.js';

export async function mostrarFormularioYRegistrarAdmision(paciente, id_cama, id_habitacion, fechaDashboard, edad, sector_nombre) {
	try {
		const [motivos, obras, medicos] = await Promise.all([
			fetch('/api/motivos_ingreso').then(r => r.json()),
			fetch('/api/obras-sociales').then(r => r.json()),
			fetch('/api/usuarios/medicos').then(r => r.json()),
		]);

		const motivosOptions = motivos.map(m =>
			`<option value="${m.id_motivo}">${m.tipo}</option>`).join('');
		const obrasOptions = obras.map(o =>
			`<option value="${o.id_obra_social}">${o.nombre}</option>`).join('');
		const medicosOptions = medicos.map(m =>
			`<option value="${m.id_usuario}">
				${m.apellido}, ${m.nombre} - Matrícula: ${m.matricula} - ${m.especialidad}
			</option>`
		).join('');
				
		let fechaIngresoDefault = fechaDashboard
			? new Date(fechaDashboard).toISOString().slice(0, 16)
			: getFechaLocalParaInput();

		const result = await Swal.fire({
			title: 'Registrar Admisión',
			html: `
                <select id="id_obra_social" class="swal2-input" required>
                    <option value="">Seleccione obra social</option>
                    ${obrasOptions}
                </select>
                <input type="text" id="num_asociado" class="swal2-input" placeholder="N° Asociado" required>
                
                <label for="fecha_hora_ingreso" style="display:block;text-align:left;margin-top:8px;">Fecha y hora de ingreso</label>
                <input type="datetime-local" id="fecha_hora_ingreso" class="swal2-input" required>

                <select id="id_motivo" class="swal2-input" required>
                    <option value="">Seleccione motivo de ingreso</option>
                    ${motivosOptions}
                </select>

                <input type="text" id="descripcion" class="swal2-input" placeholder="Descripción sintomatológica">
                
                <label for="fecha_hora_egreso" style="display:block;text-align:left;margin-top:8px;">Fecha y hora de egreso (opcional)</label>
                <input type="datetime-local" id="fecha_hora_egreso" class="swal2-input">

				<input type="text" id="motivo_egr" class="swal2-input" placeholder="Motivo egreso (opcional)">

                <select id="id_usuario" class="swal2-input" style="max-width: 100%; overflow: hidden;">
                    <option value="">Seleccione médico</option>
                    ${medicosOptions}
                </select>
            `,
			customClass: {
				popup: 'swal2-card-style'
			},
			showCancelButton: true,
			confirmButtonText: 'Guardar',
			focusConfirm: false,
			didOpen: () => {
				const inputFechaIngreso = Swal.getPopup().querySelector('#fecha_hora_ingreso');
				if (inputFechaIngreso && fechaIngresoDefault) {
					inputFechaIngreso.value = fechaIngresoDefault;
				}
			},
			preConfirm: () => {
				const getVal = id => Swal.getPopup().querySelector(id)?.value;

				const fecha_ingreso = getVal('#fecha_hora_ingreso');
				const id_obra_social = getVal('#id_obra_social');
				const id_motivo = getVal('#id_motivo');
				const num_asociado = getVal('#num_asociado');

				if (!id_obra_social || !id_motivo || !fecha_ingreso || !num_asociado) {
					Swal.showValidationMessage('Completa todos los campos obligatorios');
					return false;
				}
				
				return {
					id_obra_social,
					num_asociado,
					fecha_hora_ingreso: fecha_ingreso,
					id_motivo,
					descripcion: getVal('#descripcion') || null,
					fecha_hora_egreso: getVal('#fecha_hora_egreso') || null,
					motivo_egr: getVal('#motivo_egr') || null,
					id_usuario: getVal('#id_usuario') || null,
				};
			}
		});

		if (!result.isConfirmed) return;

		const inputFechaIngreso = document.querySelector('#fecha_hora_ingreso');
		const inputFechaEgreso = document.querySelector('#fecha_hora_egreso');
		const inputMotivoEgr = document.querySelector('#motivo_egr');

		const { fecha_hora_ingreso } = result.value;
		let { fecha_hora_egreso } = result.value;
		const fechaIngresoUTC = toUTC(fecha_hora_ingreso);
		const fechaSeleccionadaStr = fechaIngresoUTC.slice(0, 10);
		const hoyStr = new Date().toISOString().slice(0, 10);
				
		let id_mov = 1;

		const errorFechaPasada = validarFechaNoPasada(fecha_hora_ingreso);
		if (errorFechaPasada) {
		await Swal.fire('Error', errorFechaPasada, 'error');
		return;
		}

		if (fechaSeleccionadaStr > hoyStr) {
		const error = validarFechaReservaRango(fecha_hora_ingreso);
		if (error) {
			await Swal.fire('Fecha inválida', error, 'warning');
			return;
		}

		id_mov = 3;
		aplicarReservaSemanal(inputFechaIngreso, inputFechaEgreso, inputMotivoEgr);
		fecha_hora_egreso = inputFechaEgreso.value;
		}


		if (fecha_hora_egreso) {
			const ingreso = new Date(fecha_hora_ingreso);
			const egreso = new Date(fecha_hora_egreso);
			if (egreso < ingreso) {
				await Swal.fire('Error', 'La fecha de egreso debe ser posterior a la de ingreso', 'error');
				return;
			}
		}

		Swal.showLoading();
		const admResp = await fetch('/api/admisiones', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				...result.value,
				fecha_hora_ingreso: toUTC(result.value.fecha_hora_ingreso),
				fecha_hora_egreso: fecha_hora_egreso ? toUTC(fecha_hora_egreso) : null,
				id_paciente: paciente.id_paciente,
				id_cama,
				id_mov,
			})
		});

		if (!admResp.ok) {
			let errMsg = 'No se pudo registrar la admisión';
			try {
				const err = await admResp.json();
				errMsg = err.message || errMsg;
			} catch (e) {
				console.error('❌ Error al parsear respuesta de error:', e);
			}
			await Swal.fire('Error', errMsg, 'error');
			return;
		}

		const admision = await admResp.json();
		if (!admision?.id_admision) {
			await Swal.fire('Error', 'No se pudo obtener el ID de la admisión creada.', 'error');
			return;
		}

		const mensaje = id_mov === 3 
			? 'Reserva registrada correctamente'
			: 'Paciente ingresado correctamente';

		await Swal.fire('Listo', mensaje, 'success');
		location.reload();


	} catch (error) {
		console.error('❌ Error inesperado en mostrarFormularioYRegistrarAdmision:', error);
		await Swal.fire('Error', 'Ocurrió un error inesperado', 'error');
	}

}
