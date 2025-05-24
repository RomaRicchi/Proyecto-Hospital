import {
	MovimientoHabitacion,
	Admision,
	Habitacion,
	Movimiento,
} from '../models/index.js';

export const getMovimientosHabitacion = async (req, res) => {
	try {
		const movimientos = await MovimientoHabitacion.findAll({
			where: { estado: true },
			include: ['admision', 'habitacion', 'tipo_movimiento'],
		});
		res.json(movimientos);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const getMovimientoHabitacionById = async (req, res) => {
	try {
		const movimiento = await MovimientoHabitacion.findByPk(req.params.id, {
			include: ['admision', 'habitacion', 'tipo_movimiento'],
		});
		if (!movimiento)
			return res.status(404).json({ message: 'Movimiento no encontrado' });
		res.json(movimiento);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const createMovimientoHabitacion = async (req, res) => {
	try {
		const nuevo = await MovimientoHabitacion.create(req.body);
		res.status(201).json(nuevo);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const updateMovimientoHabitacion = async (req, res) => {
	try {
		const movimiento = await MovimientoHabitacion.findByPk(req.params.id);
		if (!movimiento)
			return res.status(404).json({ message: 'Movimiento no encontrado' });
		await movimiento.update(req.body);
		res.json(movimiento);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const deleteMovimientoHabitacion = async (req, res) => {
	try {
		const movimiento = await MovimientoHabitacion.findByPk(req.params.id);
		if (!movimiento)
			return res.status(404).json({ message: 'Movimiento no encontrado' });
		movimiento.estado = false;
		await movimiento.save();
		res.sendStatus(204);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};
