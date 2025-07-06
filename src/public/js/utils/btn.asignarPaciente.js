import {
	calcularEdad,
	validarCompatibilidadPacienteSector,
	obtenerCriteriosPorSector,
} from './validarSectorPaciente.js';
import { mostrarFormularioYRegistrarAdmision } from './admisionCompleta.js';

$(document).on('click', '.btn-asignar-paciente', function () {
	const id_cama = $(this).data('id');
	let pacienteSeleccionado = null;
	let camaSeleccionada = null;
	let habitacionId = null;

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
			camaSeleccionada = await fetch(`/api/camas/${id_cama}`).then((r) =>
				r.json()
			);
			habitacionId = camaSeleccionada.id_habitacion;

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
					let fechaHoraIngreso = new Date();
					const fechaBase = $('#fecha_busqueda').val();
					if (fechaBase) {
					fechaHoraIngreso = new Date(`${fechaBase}T09:00`);
					}
					const fechaISO = fechaHoraIngreso.toISOString().slice(0, 16);

					const verificarGenero = await fetch('/api/movimientos_habitacion/verificar-genero', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
							id_habitacion: habitacionId,
							id_cama: id_cama,
							id_genero: pacienteSeleccionado.genero.id_genero
						}),
					});

					if (!verificarGenero.ok) {
						const data = await verificarGenero.json();
						await Swal.fire('No permitido', data.message || 'Conflicto de género', 'error');
						return;
					}
					// ⚠️ Validación de edad y género por sector
					const edad = calcularEdad(pacienteSeleccionado.fecha_nac);
					const sectorNombre = camaSeleccionada?.habitacion?.sector?.nombre.trim() || 'el sector seleccionado';
					const criterios = obtenerCriteriosPorSector(sectorNombre);
					console.log('🧠 Sector detectado:', `"${sectorNombre}"`);
					console.log('🛏️ Cama seleccionada:', camaSeleccionada);
					

					const esCompatible = validarCompatibilidadPacienteSector(
						edad,
						pacienteSeleccionado.genero.id_genero,
						sectorNombre
					);

					if (!esCompatible) {
						Swal.fire({
							icon: 'warning',
							title: 'Sector no compatible',
							html:  `
								El paciente no cumple con los criterios para ingresar a <strong>${sectorNombre}</strong>.<br><br>
								<em>Requisitos:</em> ${criterios}
							`,
						});
						return;
					}
					console.log(`Edad: ${edad}, Género: ${pacienteSeleccionado.genero?.id_genero}, Sector: ${sectorNombre}, Compatible: ${esCompatible}`);
				
                    mostrarFormularioYRegistrarAdmision(
						pacienteSeleccionado,
						id_cama,
						habitacionId,
						fechaISO,
                    );

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