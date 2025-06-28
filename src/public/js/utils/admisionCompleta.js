export async function mostrarFormularioYRegistrarAdmision(paciente, id_cama, id_habitacion) {
	try {
		// Cargar datos para los selects
		const [motivos, obras, medicos] = await Promise.all([
			fetch('/api/motivos_ingreso').then(r => r.json()),
			fetch('/api/obras-sociales').then(r => r.json()),
			fetch('/api/personal-salud').then(r => r.json()),
		]);

		const motivosOptions = motivos.map(m =>
			`<option value="${m.id_motivo}">${m.tipo}</option>`).join('');
		const obrasOptions = obras.map(o =>
			`<option value="${o.id_obra_social}">${o.nombre}</option>`).join('');
		const medicosOptions = medicos.map(m =>
			`<option value="${m.id_personal_salud}">${m.apellido}, ${m.nombre} - Matrícula: ${m.matricula}</option>`).join('');


	    // Mostrar formulario SweetAlert
	    const result = await Swal.fire({
			title: 'Registrar Admisión',
			html: `
                <select id="id_obra_social" class="swal2-input">${obrasOptions}</select>
                <input type="text" id="num_asociado" class="swal2-input" placeholder="N° Asociado">
                <label for="fecha_hora_ingreso" style="display:block;text-align:left;margin-top:8px;">Fecha y hora de ingreso</label>
                <input type="datetime-local" id="fecha_hora_ingreso" class="swal2-input" placeholder="Fecha y hora ingreso">
                <select id="id_motivo" class="swal2-input">${motivosOptions}</select>
                <input type="text" id="descripcion" class="swal2-input" placeholder="Descripción sintomatologica">
                <label for="fecha_hora_egreso" style="display:block;text-align:left;margin-top:8px;">Fecha y hora de egreso (opcional)</label>
                <input type="datetime-local" id="fecha_hora_egreso" class="swal2-input" placeholder="Fecha y hora egreso (opcional)">
                <input type="text" id="motivo_egr" class="swal2-input" placeholder="Motivo egreso (opcional)">
                <select id="id_personal_salud" class="swal2-input">
                <option value="">Seleccione médico</option>
                ${medicosOptions}
                </select>
            `,
            showCancelButton: true,
            confirmButtonText: 'Guardar',
            preConfirm: () => {
                const getVal = id => Swal.getPopup().querySelector(id)?.value;
                const fecha_ingreso = getVal('#fecha_hora_ingreso');
                if (!getVal('#id_obra_social') || !getVal('#id_motivo') || !fecha_ingreso) {
                    Swal.showValidationMessage('Completa todos los campos obligatorios');
                    return false;
                }
                return {
                    id_obra_social: getVal('#id_obra_social'),
                    num_asociado: getVal('#num_asociado'),
                    fecha_hora_ingreso: fecha_ingreso,
                    id_motivo: getVal('#id_motivo'),
                    descripcion: getVal('#descripcion'),
                    fecha_hora_egreso: getVal('#fecha_hora_egreso') || null,
                    motivo_egr: getVal('#motivo_egr'),
                    id_personal_salud: getVal('#id_personal_salud') || null,
                };
            }
        });

	    if (!result.isConfirmed) return;

        Swal.showLoading(); 
        const { fecha_hora_ingreso } = result.value;
        const seleccion = new Date(fecha_hora_ingreso);
        const hoy = new Date();
        const id_mov = seleccion > hoy ? 3 : 1;

        if (seleccion < hoy) {
            await Swal.fire('Error', 'No se puede seleccionar una fecha pasada', 'error');
            return;
        }

		// Crear admisión
		const admResp = await fetch('/api/admisiones', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				...result.value,
				id_paciente: paciente.id_paciente
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

		// Crear movimiento de habitación (ya sea ingreso o reserva)
		const movResp = await fetch('/api/movimientos_habitacion', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				id_admision: admision.id_admision,
				id_habitacion,
				id_cama,
				fecha_hora_ingreso: admision.fecha_hora_ingreso,
				fecha_hora_egreso: admision.fecha_hora_egreso || null,
				id_mov,
				estado: 1
			})
		});

		if (!movResp.ok) {
			const err = await movResp.json();
			await Swal.fire('Error', err.message || 'No se pudo registrar el movimiento', 'error');
			return;
		}

		await Swal.fire('Listo', 'Paciente asignado y admitido correctamente', 'success');
		location.reload();

	} catch (error) {
		console.error(error);
		await Swal.fire('Error', 'Ocurrió un error inesperado', 'error');
	}
}
