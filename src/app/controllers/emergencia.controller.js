import {
	Paciente,
	Genero,
	Admision,
	ObraSocial,
	MotivoIngreso,
	Cama,
	Habitacion,
	Movimiento,
	MovimientoHabitacion,
} from '../models/index.js';
import { Op } from 'sequelize';

// Controlador principal para ingreso de emergencia
export const ingresoEmergencia = async (req, res) => {
	try {
		const { fecha_hora_ingreso, sexo, identificador } = req.body;

		if (!fecha_hora_ingreso || !sexo || !identificador) {
			return res.status(400).json({ error: 'Faltan datos obligatorios.' });
		}

		let paciente = await Paciente.findOne({
			where: { dni_paciente: identificador },
		});

		if (!paciente) {
			paciente = await Paciente.create({
				dni_paciente: identificador,
				apellido_p: 'NN',
				nombre_p: 'No identificado',
				fecha_nac: null,
				id_genero: sexo,
				telefono: null,
				direccion: null,
				id_localidad: null,
				email: null,
				estado: 1,
			});
		}

		// Validar si ya existe una admisión activa para este paciente
		const admisionActiva = await Admision.findOne({
			where: {
				id_paciente: paciente.id_paciente,
				fecha_hora_egreso: null,
			},
		});
		if (admisionActiva) {
			return res.status(409).json({
				error: 'El paciente ya tiene una admisión activa.',
			});
		}

		const obraSocial = await ObraSocial.findOne({
			where: { nombre: { [Op.like]: '%Sin obra social%' } },
		});
		if (!obraSocial) {
			return res
				.status(400)
				.json({ error: 'No se encontró la obra social "Sin obra social".' });
		}

		const motivo = await MotivoIngreso.findOne({
			where: { tipo: { [Op.like]: '%emergencia%' } },
		});
		if (!motivo) {
			return res
				.status(400)
				.json({ error: 'No se encontró el motivo "Ingreso por emergencia".' });
		}

		const admision = await Admision.create({
			id_paciente: paciente.id_paciente,
			id_obra_social: obraSocial.id_obra_social,
			num_asociado: identificador,
			fecha_hora_ingreso,
			id_motivo: motivo.id_motivo,
			descripcion: 'Ingreso por emergencia',
			fecha_hora_egreso: null,
			motivo_egr: null,
			id_personal_salud: null,
		});

		const camasLibres = await Cama.findAll({
			where: { estado: 0 },
			include: [{ model: Habitacion, as: 'habitacion' }],
		});

		let camaAsignada = null;

		for (const cama of camasLibres) {
			const movimientosActivos = await MovimientoHabitacion.findAll({
				where: {
					id_habitacion: cama.id_habitacion,
					fecha_hora_egreso: null,
					estado: 1,
				},
				include: [
					{
						model: Admision,
						as: 'admision',
						include: [
							{
								model: Paciente,
								as: 'paciente',
							},
						],
					},
				],
			});

			if (movimientosActivos.length === 0) {
				camaAsignada = cama;
				break;
			}

			const sexos = movimientosActivos.map((mov) =>
				mov.admision && mov.admision.paciente
					? mov.admision.paciente.id_genero
					: null
			);
			const todosMismoSexo = sexos.every((s) => s === parseInt(sexo));

			if (todosMismoSexo) {
				camaAsignada = cama;
				break;
			}
		}

		if (camaAsignada) {
			const movIngreso = await Movimiento.findOne({
				where: { nombre: { [Op.like]: '%Ingresa%' } },
			});

			await MovimientoHabitacion.create({
				id_admision: admision.id_admision,
				id_habitacion: camaAsignada.id_habitacion,
				fecha_hora_ingreso,
				fecha_hora_egreso: null,
				id_mov: movIngreso ? movIngreso.id_mov : 1,
				estado: 1,
			});

			await camaAsignada.update({ estado: 1 });

			return res.status(200).json({
				mensaje: 'Paciente ingresado y cama asignada correctamente.',
				paciente: {
					id: paciente.id_paciente,
					nombre: paciente.nombre_p,
					apellido: paciente.apellido_p,
					dni: paciente.dni_paciente,
				},
				habitacion: camaAsignada.id_habitacion,
				cama: camaAsignada.nombre,
			});
		} else {
			return res.status(409).json({
				error: 'No hay camas disponibles compatibles con el sexo del paciente.',
			});
		}
	} catch (error) {
		console.error(error);
		return res
			.status(500)
			.json({ error: 'Error en el ingreso de emergencia.' });
	}
};
