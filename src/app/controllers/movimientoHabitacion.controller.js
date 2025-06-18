import {
	MovimientoHabitacion,
	Admision,
	Habitacion,
	Movimiento,
	Paciente,
	Sector,
	Genero,
	Cama,
} from '../models/index.js';
import { Op } from 'sequelize';

export const verificarGenero = async (req, res) => {
	try {
		const { id_habitacion, id_cama, id_genero } = req.body;

		const mov = await MovimientoHabitacion.findOne({
			where: {
				id_habitacion,
				id_cama: { [Op.ne]: id_cama },
				estado: 1, // Movimiento activo
				id_mov: 1, // Ingreso
				fecha_hora_egreso: null,
			},
			include: [
				{
					model: Admision,
					as: 'admision',
					include: [{ model: Paciente, as: 'paciente' }],
				},
			],
		});

		if (mov?.admision?.paciente) {
			const generoExistente = parseInt(mov.admision.paciente.id_genero);
			const generoNuevo = parseInt(id_genero);

			if (generoExistente !== generoNuevo) {
				return res.status(409).json({
					message: 'No se puede ingresar un paciente de diferente género en la habitación.',
				});
			}
		}

		return res.json({ ok: true });
	} catch (error) {
		console.error('Error al verificar género:', error);
		res.status(500).json({ message: 'Error al verificar género' });
	}
};


// 🔸 Obtener todos los movimientos habitación con relaciones (API)
export const getMovimientosHabitacion = async (req, res) => {
	try {
		const where = {};
		if (req.query.habitacion) {
			where.id_habitacion = req.query.habitacion;
		}
		const movimientos = await MovimientoHabitacion.findAll({
			where,
			include: [
				{
					model: Admision,
					as: 'admision',
					include: [
						{
							model: Paciente,
							as: 'paciente',
							include: [
								{
									model: Genero,
									as: 'genero',
									attributes: ['id_genero', 'nombre'],
								},
							],
						},
					],
				},
				{
					model: Habitacion,
					as: 'habitacion',
					include: [{ model: Sector, as: 'sector' }],
				},
				{ model: Movimiento, as: 'tipo_movimiento' },
				{ model: Cama, as: 'cama' },
			],
		});
		res.json(movimientos);
	} catch (error) {
		res
			.status(500)
			.json({ message: 'Error al obtener movimientos habitación' });
	}
};

// 🔸 Obtener un movimiento habitación por ID (API)
export const getMovimientoHabitacionById = async (req, res) => {
	try {
		const movimiento = await MovimientoHabitacion.findByPk(req.params.id, {
			include: [
				{
					model: Admision,
					as: 'admision',
					include: [{ model: Paciente, as: 'paciente' }],
				},
				{
					model: Habitacion,
					as: 'habitacion',
					include: [{ model: Sector, as: 'sector' }],
				},
				{ model: Movimiento, as: 'tipo_movimiento' }, // <--- alias corregido
			],
		});
		if (!movimiento)
			return res.status(404).json({ message: 'Movimiento no encontrado' });
		res.json(movimiento);
	} catch (error) {
		res.status(500).json({ message: 'Error al obtener movimiento habitación' });
	}
};

export const createMovimientoHabitacion = async (req, res) => {
	try {
		const {
			id_admision,
			id_habitacion,
			id_cama,
			fecha_hora_ingreso,
			fecha_hora_egreso,
			id_mov,
			estado,
		} = req.body;

		// Buscar la admisión y el paciente a internar
		const admisionNueva = await Admision.findByPk(id_admision, {
			include: [{ model: Paciente, as: 'paciente' }],
		});
		if (!admisionNueva)
			return res.status(404).json({ message: 'Admisión no encontrada' });

		// Obtener el género del paciente actual
		const generoNuevo = admisionNueva.paciente.id_genero;

		// Verificar conflicto de género en la habitación
		const movExistente = await MovimientoHabitacion.findOne({
			where: {
				id_habitacion,
				id_cama: { [Op.ne]: id_cama },
				estado: 1,
				id_mov: 1,
				fecha_hora_egreso: null,
			},
			include: [{
				model: Admision,
				as: 'admision',
				include: [{ model: Paciente, as: 'paciente' }],
			}],
		});

		if (
			movExistente &&
			movExistente.admision?.paciente?.id_genero !== generoNuevo
		) {
			return res.status(400).json({
				message: 'No se puede ingresar un paciente de diferente género en la habitación.',
			});
		}

		// Si pasa la validación, crea el movimiento normalmente
		const nuevo = await MovimientoHabitacion.create({
			id_admision,
			id_habitacion,
			id_cama,
			fecha_hora_ingreso,
			fecha_hora_egreso: fecha_hora_egreso || null,
			id_mov,
			estado: estado || 1,
		});

		// Cambiar estado de la cama a ocupada solo si es un ingreso actual o pasado
		if (
			id_mov == 1 &&
			id_cama &&
			fecha_hora_ingreso &&
			new Date(fecha_hora_ingreso) <= new Date()
		) {
			const cama = await Cama.findByPk(id_cama);
			if (cama) {
				cama.estado = 1;
				await cama.save();
			}
		}

		res.status(201).json(nuevo);
	} catch (error) {
		console.error('Error al crear movimiento habitación:', error);
		res.status(500).json({ message: 'Error al crear movimiento habitación' });
	}
};


export const updateMovimientoHabitacion = async (req, res) => {
	try {
		const { id } = req.params;
		const movimiento = await MovimientoHabitacion.findByPk(id);
		if (!movimiento)
			return res.status(404).json({ message: 'Movimiento no encontrado' });

		const {
			id_admision,
			id_habitacion,
			id_cama,
			fecha_hora_ingreso,
			fecha_hora_egreso,
			id_mov,
			estado,
		} = req.body;

		// Buscar la admisión y su paciente para obtener el género
		const admisionNueva = await Admision.findByPk(id_admision, {
			include: [{ model: Paciente, as: 'paciente' }],
		});
		if (!admisionNueva)
			return res.status(404).json({ message: 'Admisión no encontrada' });

		const generoNuevo = admisionNueva.paciente.id_genero;

		// Verificar conflicto de género si hay otro paciente en otra cama de la misma habitación
		const movExistente = await MovimientoHabitacion.findOne({
			where: {
				id_habitacion,
				id_cama: { [Op.ne]: id_cama },
				estado: 1,
				id_mov: 1,
				fecha_hora_egreso: null,
			},
			include: [{
				model: Admision,
				as: 'admision',
				include: [{ model: Paciente, as: 'paciente' }],
			}],
		});

		if (
			movExistente &&
			movExistente.admision?.paciente?.id_genero !== generoNuevo
		) {
			return res.status(400).json({
				message: 'No se puede actualizar porque hay un paciente de diferente género en otra cama de la habitación.',
			});
		}

		await movimiento.update({
			id_admision,
			id_habitacion,
			id_cama,
			fecha_hora_ingreso,
			fecha_hora_egreso: fecha_hora_egreso || null,
			id_mov,
			estado,
		});

		res.json(movimiento);
	} catch (error) {
		console.error('Error al actualizar movimiento habitación:', error);
		res.status(500).json({ message: 'Error al actualizar movimiento habitación' });
	}
};


// 🔸 Eliminar movimiento habitación (API)
export const deleteMovimientoHabitacion = async (req, res) => {
	try {
		const movimiento = await MovimientoHabitacion.findByPk(req.params.id);
		if (!movimiento)
			return res.status(404).json({ message: 'Movimiento no encontrado' });

		await movimiento.destroy();
		res.sendStatus(204);
	} catch (error) {
		res
			.status(500)
			.json({ message: 'Error al eliminar movimiento habitación' });
	}
};

// 🔸 Vista para mostrar movimientos habitación (datatable)
export const vistaMovimientosHabitacion = async (req, res) => {
	try {
		const movimientos = await MovimientoHabitacion.findAll({
			include: [
				{
					model: Admision,
					as: 'admision',
					include: [{ model: Paciente, as: 'paciente' }],
				},
				{
					model: Habitacion,
					as: 'habitacion',
					include: [{ model: Sector, as: 'sector' }],
				},
				{ model: Movimiento, as: 'tipo_movimiento' }, // <--- alias corregido
			],
		});
		res.render('movHabitacion', { movimientos }); // ← nombre de tu archivo pug y variable
	} catch (error) {
		res.status(500).send('Error al cargar movimientos habitación');
	}
};

export const reservarCama = async (req, res) => {
	const id_cama = req.params.id_cama;
	const { id_paciente, fecha_reserva } = req.body; // opcionalmente puede venir paciente

	try {
		const cama = await Cama.findByPk(id_cama, {
			include: [{ model: Habitacion, as: 'habitacion' }],
		});
		if (!cama) return res.status(404).send('Cama no encontrada');

		const id_habitacion = cama.id_habitacion;

		// Validar género si se recibe un paciente
		if (id_paciente) {
			const paciente = await Paciente.findByPk(id_paciente);
			if (!paciente) return res.status(404).send('Paciente no encontrado');

			const generoNuevo = paciente.id_genero;

			const movExistente = await MovimientoHabitacion.findOne({
				where: {
					id_habitacion,
					id_cama: { [Op.ne]: id_cama },
					estado: 1,
					id_mov: 1,
					fecha_hora_egreso: null,
				},
				include: [{
					model: Admision,
					as: 'admision',
					include: [{ model: Paciente, as: 'paciente' }],
				}],
			});

			if (
				movExistente &&
				movExistente.admision?.paciente?.id_genero !== generoNuevo
			) {
				return res.status(409).json({
					message:
						'No se puede reservar porque hay un paciente de diferente género en la habitación.',
				});
			}
		}

		// Cambiar estado de la cama a reservada
		await Cama.update({ estado: true }, { where: { id_cama } });

		// Crear movimiento de tipo 'Reserva' (id_mov = 3)
		await MovimientoHabitacion.create({
			id_admision: null, // aún no está asociada a admisión
			id_habitacion,
			id_cama,
			fecha_hora_ingreso: fecha_reserva ? new Date(fecha_reserva) : new Date(),
			id_mov: 3,
			estado: 1,
		});

		res.send('Cama reservada');
	} catch (error) {
		console.error('Error al reservar cama:', error);
		res.status(500).send('Error al reservar cama');
	}
};
