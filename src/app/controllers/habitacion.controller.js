import { Habitacion } from '../models/index.js';

// 🔸 Obtener todas las habitaciones
export const getHabitaciones = async (req, res) => {
  try {
    const habitaciones = await Habitacion.findAll();
    res.json(habitaciones);
  } catch (error) {
    console.error('Error al obtener habitaciones:', error);
    res.status(500).json({ message: 'Error al obtener habitaciones' });
  }
};

// 🔸 Obtener habitación por ID
export const getHabitacionById = async (req, res) => {
  try {
    const habitacion = await Habitacion.findByPk(req.params.id);
    if (!habitacion) {
      return res.status(404).json({ message: 'Habitación no encontrada' });
    }
    res.json(habitacion);
  } catch (error) {
    console.error('Error al obtener habitación:', error);
    res.status(500).json({ message: 'Error al obtener habitación' });
  }
};

// 🔸 Crear habitación
export const createHabitacion = async (req, res) => {
  try {
    const { num, id_sector, id_cama, estado } = req.body;
    if (!num) {
      return res.status(400).json({ message: 'El número es obligatorio' });
    }

    const habitacion = await Habitacion.create({
      num,
      id_sector: id_sector || null,
      id_cama: id_cama || null,
      estado: estado || 1,
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
    const { num, id_sector, id_cama, estado } = req.body;

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
      id_cama: id_cama || null,
      estado: estado || 1,
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
    res.status(204).send();  // No Content
  } catch (error) {
    console.error('Error al eliminar habitación:', error);
    res.status(500).json({ message: 'Error al eliminar habitación' });
  }
};

// 🔸 Vista para mostrar habitaciones en habitacion.pug
export const vistaHabitaciones = async (req, res) => {
  try {
    const habitaciones = await Habitacion.findAll();
    res.render('habitacion', { habitaciones });
  } catch (error) {
    console.error('Error al cargar vista de habitaciones:', error);
    res.status(500).send('Error al cargar habitaciones');
  }
};
