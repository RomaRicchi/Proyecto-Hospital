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

// 🔸 Verificar conflicto de género antes de admisión
export const verificarGenero = async (req, res) => {
	try {
		const { id_habitacion, id_cama, id_genero } = req.body;

		const mov = await MovimientoHabitacion.findOne({
			where: {
				id_habitacion,
				id_cama: { [Op.ne]: id_cama },
				estado: 1,
				id_mov: 1,
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

		if (mov && mov.admision && mov.admision.paciente) {
			if (mov.admision.paciente.id_genero !== id_genero) {
				return res.status(400).json({
					message:
						'No se puede ingresar un paciente de diferente género en la habitación.',
				});
			}
		}
		return res.json({ ok: true });
	} catch (error) {
		res.status(500).json({ message: 'Error al verificar género' });
	}
};

// 🔸 Obtener todos los movimientos habitación
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

// 🔸 Obtener un movimiento habitación por ID 
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
				{ model: Movimiento, as: 'tipo_movimiento' }, 
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

		// 🕒 Detectar si es reserva (por tipo o fecha futura)
		const fechaIngreso = new Date(fecha_hora_ingreso);
		const esReserva = id_mov === 3 || fechaIngreso > new Date();

		// 🔍 Buscar admisión y paciente
		const admisionNueva = await Admision.findByPk(id_admision, {
			include: [{ model: Paciente, as: 'paciente' }],
		});
		if (!admisionNueva)
			return res.status(404).json({ message: 'Admisión no encontrada' });

		// 🔒 Validar género de otro paciente en misma habitación
		const movimientoOcupado = await MovimientoHabitacion.findOne({
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
			movimientoOcupado &&
			movimientoOcupado.admision?.paciente?.id_genero !== admisionNueva.paciente.id_genero
		) {
			return res.status(400).json({
				message: 'No se puede internar porque hay un paciente de diferente género en la otra cama.',
			});
		}

		// ✅ Crear movimiento habitación
		const nuevo = await MovimientoHabitacion.create({
			id_admision,
			id_habitacion,
			id_cama,
			fecha_hora_ingreso,
			fecha_hora_egreso: fecha_hora_egreso || null,
			id_mov,
			estado: estado || 1,
		});

		// 🛏️ Marcar cama como ocupada en cualquier caso (ingreso o reserva)
		if (id_cama) {
			const cama = await Cama.findByPk(id_cama);
			if (cama) {
				cama.estado = 1; // Ocupada
				await cama.save();
			}
		}

		res.status(201).json(nuevo);
	} catch (error) {
		console.error('Error en createMovimientoHabitacion:', error);
		res.status(500).json({ message: 'Error al crear movimiento habitación' });
	}
};


// 🔸 Actualizar movimiento habitación (API)
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
		res
			.status(500)
			.json({ message: 'Error al actualizar movimiento habitación' });
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
				{
					model: Movimiento,
					as: 'tipo_movimiento',
				},
				{
					model: Cama,
					as: 'cama', // 
				},
			],
		});
		res.render('movHabitacion', { movimientos });
	} catch (error) {
		console.error(error);
		res.status(500).send('Error al cargar movimientos habitación');
	}
};
