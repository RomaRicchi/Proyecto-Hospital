import { obtenerFechaBusquedaFormateada, 
	aplicarReservaSemanal,
	parseFechaLocal,
} from './validacionFechas.js';

export async function mostrarFormularioYRegistrarAdmision(paciente, id_cama, id_habitacion, fechaDashboard) {
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
			`<option value="${m.id_usuario}">${m.apellido}, ${m.nombre} - Matrícula: ${m.matricula}</option>`
		).join('');

		const fechaDashboard = obtenerFechaBusquedaFormateada(); // yyyy-MM-dd
		let fechaIngresoDefault;

		if (fechaDashboard) {
			// Asegurarse de que tenga formato YYYY-MM-DD
			const soloFecha = fechaDashboard.split('T')[0]; // Quita parte de hora si ya la trae
			const fecha = new Date(`${soloFecha}T09:00:00`);
			if (!isNaN(fecha.getTime())) {
				const local = new Date(fecha.getTime() - fecha.getTimezoneOffset() * 60000);
				fechaIngresoDefault = local.toISOString().slice(0, 16);
			} else {
				console.warn('⚠️ Fecha inválida:', fechaDashboard);
				fechaIngresoDefault = null;
			}
		} else {
			const now = new Date(Date.now() - new Date().getTimezoneOffset() * 60000);
			fechaIngresoDefault = now.toISOString().slice(0, 16);
		}

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

                <select id="id_usuario" class="swal2-input">
                    <option value="">Seleccione médico</option>
                    ${medicosOptions}
                </select>
            `,
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

		// 📌 Obtener valor del input y convertirlo correctamente
		const inputFechaIngreso = document.querySelector('#fecha_hora_ingreso');
		const fechaIngresoStr = inputFechaIngreso?.value;
		const fechaIngreso = parseFechaLocal(fechaIngresoStr);
		if (!fechaIngreso) {
		Swal.fire('Error', 'La fecha de ingreso no es válida.', 'error');
		return;
		}

		const fechaISO = fechaIngreso.toISOString(); 
		console.log('📆 Fecha válida ISO:', fechaISO);

		const inputFechaEgreso = document.querySelector('#fecha_hora_egreso');
		const inputMotivoEgr = document.querySelector('#motivo_egr');
		
		const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
		const manana = new Date(hoy); manana.setDate(hoy.getDate() + 1);

		if (!result.isConfirmed) return;

		const { fecha_hora_ingreso } = result.value;
		let { fecha_hora_egreso } = result.value;
		let id_mov = 1;

		// 🧠 Si es reserva futura:
		const seleccionFinal = new Date(fecha_hora_ingreso);
		if (seleccionFinal >= manana) {
			id_mov = 3;
			aplicarReservaSemanal(inputFechaIngreso, inputFechaEgreso, inputMotivoEgr);
			fecha_hora_egreso = inputFechaEgreso.value;
		}

		if (seleccionFinal < hoy) {
			await Swal.fire('Error', 'No se puede seleccionar una fecha pasada', 'error');
			return;
		}

		// 🔽 5. Enviar admisión
		Swal.showLoading();
		console.log('🩺 ID Usuario médico asignado:', result.value.id_usuario);

		const admResp = await fetch('/api/admisiones', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				...result.value,
				fecha_hora_egreso,
				id_paciente: paciente.id_paciente,
				id_cama,
				id_mov,
			})
		});

		if (!admResp.ok) {
			const err = await admResp.json();
			await Swal.fire('Error', err.message || 'No se pudo registrar la admisión', 'error');
			return;
		}

		const admision = await admResp.json();
		if (!admision?.id_admision) {
			await Swal.fire('Error', 'No se pudo obtener el ID de la admisión creada.', 'error');
			return;
		}

		// 🔽 6. Registrar movimiento
		const movResp = await fetch('/api/movimientos_habitacion', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				id_admision: admision.id_admision,
				id_habitacion,
				id_cama,
				fecha_hora_ingreso: admision.fecha_hora_ingreso,
				fecha_hora_egreso: fecha_hora_egreso || admision.fecha_hora_egreso || null,
				id_mov,
				estado: 1
			})
		});

		if (!movResp.ok) {
			const err = await movResp.json();
			await Swal.fire('Error', err.message || 'No se pudo registrar el movimiento', 'error');
			return;
		}

		const mensaje = id_mov === 3 
			? 'Reserva registrada correctamente'
			: 'Paciente ingresado correctamente';

		await Swal.fire('Listo', mensaje, 'success');
		location.reload();


	} catch (error) {
		console.error(error);
		await Swal.fire('Error', 'Ocurrió un error inesperado', 'error');
	}
}
