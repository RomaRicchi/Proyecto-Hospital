import { Habitacion, Sector, Cama } from '../models/index.js';

export const getHabitaciones = async (req, res) => {
	try {
		const habitaciones = await Habitacion.findAll({
			include: ['sector', 'cama'],
			where: { estado: true },
		});
		res.json(habitaciones);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const getHabitacionById = async (req, res) => {
	try {
		const habitacion = await Habitacion.findByPk(req.params.id, {
			include: ['sector', 'cama'],
		});
		if (!habitacion)
			return res.status(404).json({ message: 'Habitación no encontrada' });
		res.json(habitacion);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const createHabitacion = async (req, res) => {
	try {
		const nueva = await Habitacion.create(req.body);
		res.status(201).json(nueva);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const updateHabitacion = async (req, res) => {
	try {
		const habitacion = await Habitacion.findByPk(req.params.id);
		if (!habitacion)
			return res.status(404).json({ message: 'Habitación no encontrada' });
		await habitacion.update(req.body);
		res.json(habitacion);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const deleteHabitacion = async (req, res) => {
	try {
		const habitacion = await Habitacion.findByPk(req.params.id);
		if (!habitacion)
			return res.status(404).json({ message: 'Habitación no encontrada' });
		habitacion.estado = false;
		await habitacion.save();
		res.sendStatus(204);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};
