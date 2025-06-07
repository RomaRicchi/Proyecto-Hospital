import {
	Admision,
	Paciente,
	ObraSocial,
	Usuario,
	Cama,
	MotivoIngreso,
	MovimientoHabitacion,
} from '../models/index.js';

export const getOpcionesAdmision = async (req, res) => {
	try {
		const [pacientes, obrasSociales, motivos, personal] = await Promise.all([
			Paciente.findAll({
				attributes: ['id_paciente', 'apellido_p', 'nombre_p'],
			}),
			ObraSocial.findAll({ attributes: ['id_obra_social', 'nombre'] }),
			MotivoIngreso.findAll({ attributes: ['id_motivo', 'tipo'] }),
			Usuario.findAll({ attributes: ['id_usuario', 'username'] }),
		]);
		res.json({
			pacientes,
			obrasSociales,
			motivos,
			personal,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const getAdmisiones = async (req, res) => {
	try {
		const admisiones = await Admision.findAll({
			include: ['paciente', 'obra_social', 'personal_admin', 'personal_salud'],
		});
		res.json(admisiones);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const getAdmisionById = async (req, res) => {
	try {
		const admision = await Admision.findByPk(req.params.id, {
			include: ['paciente', 'obra_social', 'personal_admin', 'personal_salud'],
		});
		if (!admision)
			return res.status(404).json({ message: 'Admisión no encontrada' });
		res.json(admision);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const vistaAdmisiones = async (req, res) => {
	try {
		const admisiones = await Admision.findAll({
			include: [
				{
					model: Paciente,
					as: 'paciente',
					attributes: ['apellido_p', 'nombre_p', 'dni_paciente'],
				},
				{ model: ObraSocial, as: 'obra_social', attributes: ['nombre'] },
				{ model: Usuario, as: 'personal_salud', attributes: ['username'] },
				{ model: MotivoIngreso, as: 'motivo_ingreso', attributes: ['tipo'] }, // <-- Agregado
			],
		});

		const adaptados = admisiones.map((a) => ({
			id_admision: a.id_admision,
			paciente: a.paciente
				? `${a.paciente.apellido_p} ${a.paciente.nombre_p}`
				: 'Sin paciente',
			dni_paciente: a.paciente ? a.paciente.dni_paciente : '-',
			obra_social: a.obra_social ? a.obra_social.nombre : 'Sin cobertura',
			num_asociado: a.num_asociado,
			motivo_ingreso: a.motivo_ingreso ? a.motivo_ingreso.tipo : '-', // <-- Mostrar nombre
			descripcion: a.descripcion || '-',
			fecha_ingreso: a.fecha_hora_ingreso
				? new Date(a.fecha_hora_ingreso).toLocaleString()
				: '-',
			fecha_egreso: a.fecha_hora_egreso
				? new Date(a.fecha_hora_egreso).toLocaleString()
				: 'En internación',
			motivo_egr: a.motivo_egr || '-',
			personal_salud: a.personal_salud ? a.personal_salud.username : '-',
		}));

		res.render('admision', { admisiones: adaptados });
	} catch (error) {
		console.error('Error al cargar vista de admisiones:', error);
		res.status(500).send('Error al mostrar admisiones');
	}
};

export const createAdmision = async (req, res) => {
	try {
		const nueva = await Admision.create(req.body);

		// Si se crea con fecha de egreso, actualizar movimiento_habitacion activo
		if (req.body.fecha_hora_egreso) {
			await MovimientoHabitacion.update(
				{ fecha_hora_egreso: req.body.fecha_hora_egreso },
				{
					where: {
						id_admision: nueva.id_admision,
						fecha_hora_egreso: null,
						estado: 1,
						id_mov: 1,
					},
				}
			);
		}

		res.status(201).json(nueva);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const updateAdmision = async (req, res) => {
	try {
		const admision = await Admision.findByPk(req.params.id);
		if (!admision)
			return res.status(404).json({ message: 'Admisión no encontrada' });
		await admision.update(req.body);

		// Si se actualiza la fecha de egreso, sincronizar en movimiento_habitacion
		if (req.body.fecha_hora_egreso) {
			await MovimientoHabitacion.update(
				{ fecha_hora_egreso: req.body.fecha_hora_egreso },
				{
					where: {
						id_admision: admision.id_admision,
						fecha_hora_egreso: null,
						estado: 1,
						id_mov: 1,
					},
				}
			);
		}

		res.json(admision);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const deleteAdmision = async (req, res) => {
	try {
		const admision = await Admision.findByPk(req.params.id);
		if (!admision)
			return res.status(404).json({ message: 'Admisión no encontrada' });
		await admision.destroy();
		res.sendStatus(204);
	} catch (error) {
		res.status(500).json({ message: error.message });
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
		console.error('Error al buscar admisión vigente:', error);
		res.json({ success: false, message: 'Error interno del servidor' });
	}
};

export const darAltaPaciente = async (req, res) => {
	try {
		console.log('🔍 darAltaPaciente llamado:', req.params, req.body);

		const { dni } = req.params;
		const { fecha_hora_egreso, motivo_egr, id_personal_salud } = req.body;

		// Validación básica
		if (!fecha_hora_egreso || !motivo_egr || !id_personal_salud) {
			return res.json({
				success: false,
				message: 'Todos los campos son obligatorios',
			});
		}

		// Buscar paciente
		const paciente = await Paciente.findOne({ where: { dni_paciente: dni } });
		if (!paciente)
			return res.json({ success: false, message: 'Paciente no encontrado' });

		// Buscar admisión activa
		const admision = await Admision.findOne({
			where: {
				id_paciente: paciente.id_paciente,
				fecha_hora_egreso: null,
			},
		});
		if (!admision)
			return res.json({ success: false, message: 'No hay admisión activa' });

		// Actualizar admisión con datos de alta
		admision.fecha_hora_egreso = fecha_hora_egreso;
		admision.motivo_egr = motivo_egr;
		admision.id_personal_salud = id_personal_salud;
		await admision.save();
		console.log('✅ Admisión actualizada');

		// Buscar último movimiento de internación
		const ultimoMovimiento = await MovimientoHabitacion.findOne({
			where: { id_admision: admision.id_admision },
			order: [['fecha_hora_ingreso', 'DESC']],
		});

		if (ultimoMovimiento) {
			// Crear nuevo movimiento de egreso
			await MovimientoHabitacion.create({
				id_admision: admision.id_admision,
				id_habitacion: ultimoMovimiento.id_habitacion,
				fecha_hora_ingreso: fecha_hora_egreso,
				id_mov: 2, // ID del tipo "Egresa/Libera"
				estado: 1,
			});
			console.log('✅ Movimiento registrado');

			// Liberar cama ocupada
			const cama = await Cama.findOne({
				where: {
					id_habitacion: ultimoMovimiento.id_habitacion,
					estado: 1,
				},
			});

			if (cama) {
				cama.estado = 0;
				await cama.save();
				console.log('✅ Cama liberada');
			} else {
				console.warn('⚠️ No se encontró cama ocupada para liberar');
			}
		} else {
			console.warn('⚠️ No se encontró movimiento previo de habitación');
		}

		res.json({ success: true });
	} catch (error) {
		console.error('❌ Error en darAltaPaciente:', error);
		res.json({ success: false, message: 'Error al dar de alta' });
	}
};
