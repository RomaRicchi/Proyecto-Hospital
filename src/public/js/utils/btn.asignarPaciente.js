import {
	calcularEdad,
	validarCompatibilidadPacienteSector,
	obtenerCriteriosPorSector,
} from './validarSectorPaciente.js';
import { mostrarFormularioYRegistrarAdmision } from './admisionCompleta.js';

$(document).on('click', '.btn-asignar-paciente', async function () {
	const id_cama = $(this).data('id');
	let pacienteSeleccionado = null;
	let habitacionId = null;

	// 🔹 Buscar paciente por DNI
	const resultado = await Swal.fire({
		title: 'Buscar Paciente por DNI',
		input: 'text',
		inputLabel: 'Ingrese DNI del paciente',
		inputPlaceholder: 'DNI',
		showCancelButton: true,
		confirmButtonText: 'Buscar',
		preConfirm: async (dni) => {
			if (!dni) {
				Swal.showValidationMessage('Debe ingresar un DNI');
				return false;
			}
			const res = await fetch(`/api/pacientes?dni=${dni}`);
			const pacientes = await res.json();
			const dniBuscado = parseInt(dni, 10);
			const paciente = pacientes.find(p => p.dni_paciente === dniBuscado);
			if (!paciente) {
				Swal.showValidationMessage('Paciente no encontrado');
				return false;
			}
			pacienteSeleccionado = paciente;
			return true;
		}
	});

	if (!resultado.isConfirmed || !pacienteSeleccionado) {
		const confirmar = await Swal.fire({
			title: 'Paciente no encontrado',
			text: '¿Desea registrar un nuevo paciente?',
			icon: 'question',
			showCancelButton: true,
			confirmButtonText: 'Registrar',
		});
		if (confirmar.isConfirmed) window.location.href = '/paciente';
		return;
	}

	// 🔹 Obtener datos de la cama seleccionada
	const camaSeleccionada = await fetch(`/api/camas/${id_cama}`).then(r => r.json());
	habitacionId = camaSeleccionada.id_habitacion;

	// 🔹 Validar conflicto de género en toda la habitación
	const generoIngresado = pacienteSeleccionado?.genero?.id_genero;

	let movimientos = [];
	try {
		const res = await fetch(`/api/movimientos_habitacion/activos/habitacion/${habitacionId}`);
		if (!res.ok) throw new Error('Error al obtener movimientos activos');
		movimientos = await res.json();
	} catch (e) {
		console.error('❌ Error al obtener movimientos:', e);
		await Swal.fire('Error', 'No se pudo verificar el estado de la habitación.', 'error');
		return;
	}

	const conflictoGenero = movimientos.some(mov => {
		const generoExistente = mov?.admision?.paciente?.genero?.id_genero;
		return generoExistente !== undefined &&
		       generoExistente !== null &&
		       generoExistente !== generoIngresado;
	});

	if (conflictoGenero) {
		await Swal.fire({
			icon: 'error',
			title: 'No permitido',
			html: `Ya hay un paciente de otro género en esta habitación.`,
		});
		return;
	}

	// 🔹 Confirmar datos del paciente
	const datos = `
		<strong>Nombre:</strong> ${pacienteSeleccionado.apellido_p}, ${pacienteSeleccionado.nombre_p}<br>
		<strong>DNI:</strong> ${pacienteSeleccionado.dni_paciente}<br>
		<strong>Género:</strong> ${pacienteSeleccionado.genero?.nombre || ''}
	`;

	const confirmar = await Swal.fire({
		title: '¿Es este el paciente correcto?',
		html: datos,
		showCancelButton: true,
		confirmButtonText: 'Sí, continuar',
	});

	if (!confirmar.isConfirmed) return;

	// 🔹 Validar compatibilidad edad/género con el sector
	const fechaBase = $('#fecha_busqueda').val();
	const fechaDashboard = fechaBase || null;
	const edad = calcularEdad(pacienteSeleccionado.fecha_nac);
	const sectorNombre = camaSeleccionada?.habitacion?.sector?.nombre?.trim() || 'el sector';

	if (!validarCompatibilidadPacienteSector(edad, generoIngresado, sectorNombre)) {
		const criterios = obtenerCriteriosPorSector(sectorNombre);
		await Swal.fire({
			icon: 'warning',
			title: 'Sector no compatible',
			html: `El paciente no cumple con los criterios para <strong>${sectorNombre}</strong>.<br><em>Requisitos:</em> ${criterios}`,
		});
		return;
	}
	
	// 🔹 Mostrar formulario
	mostrarFormularioYRegistrarAdmision(
		pacienteSeleccionado,
		id_cama,
		habitacionId,
		fechaDashboard,
		edad,
		sectorNombre
	);
});
