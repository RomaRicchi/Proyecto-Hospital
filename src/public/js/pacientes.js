$(document).ready(function () {
	$('#tablaPacientes').DataTable({
		language: { url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json' },
	});

	// 🔴 Borrado lógico (actualiza estado a 0(false))
	$('.delete-btn').on('click', function () {
		const id = $(this).data('id');
		Swal.fire({
			title: '¿Eliminar paciente?',
			text: 'Esta acción desactivará el paciente (borrado lógico).',
			icon: 'warning',
			showCancelButton: true,
			confirmButtonText: 'Sí, eliminar',
			cancelButtonText: 'Cancelar',
		}).then((result) => {
			if (result.isConfirmed) {
				fetch(`/api/pacientes/${id}`, { method: 'DELETE' })
					.then(() =>
						Swal.fire('Hecho', 'Paciente eliminado', 'success').then(() =>
							location.reload()
						)
					)
					.catch(() =>
						Swal.fire('Error', 'No se pudo eliminar el paciente', 'error')
					);
			}
		});
	});

	// 🖊️ Editar paciente !
	$('.edit-btn').on('click', function () {
		const id = $(this).data('id');
		fetch(`/api/pacientes/${id}`)
			.then((res) => res.json())
			.then((paciente) => {
				Swal.fire({
					title: 'Editar paciente',
					html: `
                        <input id="swal-dni" class="swal2-input" placeholder="DNI" value="${
													paciente.dni_paciente || ''
												}">
                        <input id="swal-nombre" class="swal2-input" placeholder="Nombre" value="${
													paciente.nombre_p || ''
												}">
                        <input id="swal-apellido" class="swal2-input" placeholder="Apellido" value="${
													paciente.apellido_p || ''
												}">
                        <input id="swal-fecha" class="swal2-input" type="date" value="${
													paciente.fecha_nac
														? paciente.fecha_nac.slice(0, 10)
														: ''
												}">
                        <input id="swal-telefono" class="swal2-input" placeholder="Teléfono" value="${
													paciente.telefono || ''
												}">
                        <input id="swal-direccion" class="swal2-input" placeholder="Dirección" value="${
													paciente.direccion || ''
												}">
                        <input id="swal-email" class="swal2-input" placeholder="Email" value="${
													paciente.email || ''
												}">
                    `,
					showCancelButton: true,
					confirmButtonText: 'Guardar',
					preConfirm: () => {
						return {
							dni_paciente: $('#swal-dni').val(),
							nombre_p: $('#swal-nombre').val(),
							apellido_p: $('#swal-apellido').val(),
							fecha_nac: $('#swal-fecha').val(),
							telefono: $('#swal-telefono').val(),
							direccion: $('#swal-direccion').val(),
							email: $('#swal-email').val(),
							estado: true,
						};
					},
				}).then((result) => {
					if (result.isConfirmed) {
						fetch(`/api/pacientes/${id}`, {
							method: 'PUT',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify(result.value),
						})
							.then(() =>
								Swal.fire('Actualizado', 'Paciente modificado', 'success').then(
									() => location.reload()
								)
							)
							.catch(() =>
								Swal.fire('Error', 'No se pudo actualizar el paciente', 'error')
							);
					}
				});
			});
	});

	// 👪 Agregar/Modificar familiar
	$('.family-btn').on('click', function () {
		const id = $(this).data('id');
		fetch(`/api/familiares/paciente/${id}`)
			.then((res) => res.json())
			.then((familiar) => {
				familiar = familiar || {};
				Swal.fire({
					title: 'Familiar',
					html: `
                        <input id="swal-f-nombre" class="swal2-input" placeholder="Nombre" value="${
													familiar.nombre || ''
												}">
                        <input id="swal-f-apellido" class="swal2-input" placeholder="Apellido" value="${
													familiar.apellido || ''
												}">
                        <input id="swal-f-telefono" class="swal2-input" placeholder="Teléfono" value="${
													familiar.telefono || ''
												}">
                        <input id="swal-f-parentesco" class="swal2-input" placeholder="ID Parentesco" value="${
													familiar.id_parentesco || ''
												}">
                    `,
					showCancelButton: true,
					confirmButtonText: 'Guardar',
					preConfirm: () => {
						return {
							nombre: $('#swal-f-nombre').val(),
							apellido: $('#swal-f-apellido').val(),
							telefono: $('#swal-f-telefono').val(),
							id_parentesco: $('#swal-f-parentesco').val(),
							estado: true,
							id_paciente: id,
						};
					},
				}).then((result) => {
					if (result.isConfirmed) {
						const method = familiar.id_familiar ? 'PUT' : 'POST';
						const url = familiar.id_familiar
							? `/api/familiares/${familiar.id_familiar}`
							: '/api/familiares';
						fetch(url, {
							method,
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify(result.value),
						})
							.then(() =>
								Swal.fire('Hecho', 'Familiar guardado', 'success').then(() =>
									location.reload()
								)
							)
							.catch(() =>
								Swal.fire('Error', 'No se pudo guardar el familiar', 'error')
							);
					}
				});
			});
	});

	// 👁️ Detalles del paciente
	$('.details-btn').on('click', function () {
		const id = $(this).data('id');
		fetch(`/api/pacientes/${id}`)
			.then((res) => res.json())
			.then(async (paciente) => {
				const familiar = await fetch(`/api/familiares/paciente/${id}`)
					.then((r) => r.json())
					.catch(() => null);
				Swal.fire({
					title: 'Detalles del paciente',
					html: `
                        <p><b>Nombre:</b> ${paciente.nombre_p} ${
						paciente.apellido_p
					}</p>
                        <p><b>DNI:</b> ${paciente.dni_paciente}</p>
                        <p><b>Teléfono:</b> ${paciente.telefono || '-'}</p>
                        <p><b>Email:</b> ${paciente.email || '-'}</p>
                        <p><b>Familiar:</b> ${
													familiar
														? `${familiar.nombre} ${familiar.apellido} (${
																familiar.parentesco || 'Sin parentesco'
														  })`
														: 'Sin familiar asignado'
												}</p>
                    `,
					showConfirmButton: true,
				});
			});
	});
});

// paciente.controller.js

import { Paciente, Genero, Localidad } from '../models/index.js';

// Vista para agregar nuevo paciente
export const vistaPacienteNuevo = async (req, res) => {
	try {
		const generos = await Genero.findAll({
			attributes: ['id_genero', 'nombre'],
		});
		const localidades = await Localidad.findAll({
			attributes: ['id_localidad', 'nombre'],
		});

		res.render('pacienteNuevo', { generos, localidades });
	} catch (error) {
		console.error('Error al cargar datos para nuevo paciente:', error);
		res.status(500).send('Error al cargar el formulario de nuevo paciente');
	}
};
