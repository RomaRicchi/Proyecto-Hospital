import { Habitacion, Sector, Cama } from '../models/index.js';

// 🔸 Obtener todas las habitaciones con JOIN
export const getHabitaciones = async (req, res) => {
	try {
		const habitaciones = await Habitacion.findAll({
			include: [
				{ model: Sector, as: 'sector', attributes: ['nombre'] },
				{ model: Cama, as: 'camas', attributes: ['nombre'] },
			],
		});
		res.json(habitaciones);
	} catch (error) {
		console.error('Error al obtener habitaciones:', error);
		res.status(500).json({ message: 'Error al obtener habitaciones' });
	}
};

// 🔸 Obtener habitación por ID con JOIN
export const getHabitacionById = async (req, res) => {
	try {
		const habitacion = await Habitacion.findByPk(req.params.id, {
			include: [
				{ model: Sector, as: 'sector', attributes: ['nombre'] },
				{ model: Cama, as: 'camas', attributes: ['nombre'] },
			],
		});
		if (!habitacion) {
			return res.status(404).json({ message: 'Habitación no encontrada' });
		}
		res.json(habitacion);
	} catch (error) {
		console.error('Error al obtener habitación:', error);
		res.status(500).json({ message: 'Error al obtener habitación' });
	}
};

// 🔸 Vista para mostrar todas las habitaciones (PUG)
export const vistaHabitaciones = async (req, res) => {
	try {
		const habitaciones = await Habitacion.findAll({
			include: [
				{ model: Sector, as: 'sector', attributes: ['nombre'] },
				{ model: Cama, as: 'camas', attributes: ['nombre'] },
			],
		});

		const habitacionesAdaptadas = habitaciones.map((h) => ({
			id_habitacion: h.id_habitacion,
			num: h.num,
			sector: h.sector?.nombre || 'Sin sector',
			camas: h.camas?.map((c) => c.nombre).join(', ') || 'Sin camas',
		}));

		res.render('habitacion', { habitaciones: habitacionesAdaptadas });
	} catch (error) {
		console.error('Error al mostrar habitaciones:', error);
		res.status(500).send('Error interno al mostrar habitaciones');
	}
};

// 🔸 Crear habitación
export const createHabitacion = async (req, res) => {
	try {
		const { num, id_sector } = req.body;
		if (!num) {
			return res.status(400).json({ message: 'El número es obligatorio' });
		}

		const habitacion = await Habitacion.create({
			num,
			id_sector: id_sector || null,
		});
		res.status(201).json(habitacion);
	} catch (error) {
		console.error('Error al crear habitación:', error);
		res.status(500).json({ message: 'Error al crear habitación' });
	}
};

// 🔸 Actualizar habitación
export const updateHabitacion = async (req, res) => {
	try {
		const { id } = req.params;
		const { num, id_sector } = req.body;

		const habitacion = await Habitacion.findByPk(id);
		if (!habitacion) {
			return res.status(404).json({ message: 'Habitación no encontrada' });
		}
		if (!num) {
			return res.status(400).json({ message: 'El número es obligatorio' });
		}

		await habitacion.update({
			num,
			id_sector: id_sector || null,
		});
		res.json(habitacion);
	} catch (error) {
		console.error('Error al actualizar habitación:', error);
		res.status(500).json({ message: 'Error al actualizar habitación' });
	}
};

// 🔸 Eliminar habitación
export const deleteHabitacion = async (req, res) => {
	try {
		const { id } = req.params;
		const habitacion = await Habitacion.findByPk(id);
		if (!habitacion) {
			return res.status(404).json({ message: 'Habitación no encontrada' });
		}

		await habitacion.destroy();
		res.status(204).send();
	} catch (error) {
		console.error('Error al eliminar habitación:', error);
		res.status(500).json({ message: 'Error al eliminar habitación' });
	}
};
