import { Habitacion, Sector, Cama } from '../models/index.js';
import { Op } from 'sequelize';

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
		res.status(500).json({ message: 'Error al obtener habitaciones' });
	}
};

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
		res.status(500).json({ message: 'Error al obtener habitación' });
	}
};

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
			sector:   h.sector?.nombre  || 'Sin sector',
			camas:    h.camas?.map((c) => c.nombre).join(', ') || 'Sin camas',
		}));


		res.render('habitacion', { 
			habitaciones: habitacionesAdaptadas , 
			usuario: req.session.usuario,
			autenticado: true
		});
	} catch (error) {
		res.status(500).send('Error interno al mostrar habitaciones');
	}
};

export const createHabitacion = async (req, res) => {
  const { num, id_sector } = req.body;

  try {
    const existente = await Habitacion.findOne({
      where: { num, id_sector }
    });

    if (existente) {
      return res.status(409).json({ message: 'Ya existe una habitación con ese número en este sector' });
    }

    const nueva = await Habitacion.create({ num, id_sector });
    res.status(201).json(nueva);

  } catch (error) {
    res.status(500).json({ message: 'Error al crear habitación' });
  }
};

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

    const existente = await Habitacion.findOne({
      where: {
        num,
        id_sector,
        id_habitacion: { [Op.ne]: id } // Importante: excluir la actual
      }
    });

    if (existente) {
      return res.status(409).json({
        message: 'Ya existe otra habitación con ese número en este sector'
      });
    }

    await habitacion.update({
      num,
      id_sector: id_sector || null
    });

    res.json(habitacion);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar habitación' });
  }
};

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
		res.status(500).json({ message: 'Error al eliminar habitación' });
	}
};
