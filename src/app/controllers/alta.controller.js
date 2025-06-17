import {
	Admision,
	Paciente,
	Cama,
	MovimientoHabitacion,
} from '../models/index.js';

export const verificarAdmisionActiva = async (req, res) => {
	try {
		const { id_paciente } = req.params;

		const admision = await Admision.findOne({
			where: {
				id_paciente,
				fecha_hora_egreso: null,
			},
		});

		res.json({ admisionActiva: !!admision });
	} catch (error) {
		console.error('Error al verificar admisión activa:', error);
		res.status(500).json({ message: 'Error al verificar admisión activa' });
	}
};

export const buscarAdmisionVigente = async (req, res) => {
	try {
		const { dni } = req.params;

		const paciente = await Paciente.findOne({ where: { dni_paciente: dni } });
		if (!paciente)
			return res.json({ success: false, message: 'Paciente no encontrado' });

		const admision = await Admision.findOne({
			where: {
				id_paciente: paciente.id_paciente,
				fecha_hora_egreso: null,
			},
		});

		res.json({ success: true, paciente, admision });
	} catch (error) {
		res.json({ success: false, message: 'Error interno del servidor' });
	}
};

export const darAltaPaciente = async (req, res) => {
	try {
		const { dni } = req.params;
		const { fecha_hora_egreso, motivo_egr, id_personal_salud } = req.body;

		const paciente = await Paciente.findOne({ where: { dni_paciente: dni } });
		if (!paciente) {
			return res
				.status(404)
				.json({ success: false, message: 'Paciente no encontrado' });
		}

		const admision = await Admision.findOne({
			where: {
				id_paciente: paciente.id_paciente,
				fecha_hora_egreso: null,
			},
		});
		if (!admision) {
			return res
				.status(404)
				.json({ success: false, message: 'No hay admisión vigente' });
		}

		// 🔄 Actualizar admisión con egreso
		admision.fecha_hora_egreso = fecha_hora_egreso;
		admision.motivo_egr = motivo_egr;
		admision.id_personal_salud = id_personal_salud;
		await admision.save();

		// 🔍 Buscar último movimiento activo
		const ultimoMov = await MovimientoHabitacion.findOne({
			where: {
				id_admision: admision.id_admision,
				id_mov: 1, // Ingresa/Ocupa
				estado: 1,
				fecha_hora_egreso: null,
			},
			order: [['fecha_hora_ingreso', 'DESC']],
		});

		if (!ultimoMov) {
			return res
				.status(400)
				.json({ success: false, message: 'No se encontró movimiento activo' });
		}

		// ✅ Marcar fecha egreso del movimiento anterior
		ultimoMov.fecha_hora_egreso = fecha_hora_egreso;
		await ultimoMov.save();

		// 🆕 Registrar nuevo movimiento tipo egreso
		await MovimientoHabitacion.create({
			id_admision: admision.id_admision,
			id_habitacion: ultimoMov.id_habitacion,
			id_cama: ultimoMov.id_cama,
			fecha_hora_ingreso: fecha_hora_egreso,
			id_mov: 2, // Egresa/Libera
			estado: 1,
		});

		// 🛏️ Liberar cama
		const cama = await Cama.findByPk(ultimoMov.id_cama);
		if (cama) {
			cama.estado = 0; // libre
			await cama.save();
		}

		return res.json({
			success: true,
			message: 'Alta registrada correctamente',
		});
	} catch (error) {
		res
			.status(500)
			.json({ success: false, message: 'Error inesperado del servidor' });
	}
};

export const vistaAltaPaciente = (req, res) => {
  try {
    res.render('altaPaciente');
  } catch (error) {
    res.status(500).send('Error al cargar el formulario de alta de paciente');
  }
};