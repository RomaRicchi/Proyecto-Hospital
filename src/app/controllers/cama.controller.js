import { Cama } from '../models/index.js';

// 🔸 Obtener todas las camas
export const getCamas = async (req, res) => {
  try {
    const camas = await Cama.findAll();
    res.json(camas);
  } catch (error) {
    console.error('Error al obtener camas:', error);
    res.status(500).json({ message: 'Error al obtener camas' });
  }
};

// 🔸 Obtener cama por ID
export const getCamaById = async (req, res) => {
  try {
    const cama = await Cama.findByPk(req.params.id);
    if (!cama) {
      return res.status(404).json({ message: 'Cama no encontrada' });
    }
    res.json(cama);
  } catch (error) {
    console.error('Error al obtener cama:', error);
    res.status(500).json({ message: 'Error al obtener cama' });
  }
};

// 🔸 Crear cama
export const createCama = async (req, res) => {
  try {
    const { nombre } = req.body;
    if (!nombre) {
      return res.status(400).json({ message: 'El nombre es obligatorio' });
    }

    const cama = await Cama.create({ nombre });
    res.status(201).json(cama);
  } catch (error) {
    console.error('Error al crear cama:', error);
    res.status(500).json({ message: 'Error al crear cama' });
  }
};

// 🔸 Actualizar cama
export const updateCama = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre } = req.body;

    const cama = await Cama.findByPk(id);
    if (!cama) {
      return res.status(404).json({ message: 'Cama no encontrada' });
    }

    if (!nombre) {
      return res.status(400).json({ message: 'El nombre es obligatorio' });
    }

    await cama.update({ nombre });
    res.json(cama);
  } catch (error) {
    console.error('Error al actualizar cama:', error);
    res.status(500).json({ message: 'Error al actualizar cama' });
  }
};

// 🔸 Eliminar cama
export const deleteCama = async (req, res) => {
  try {
    const { id } = req.params;
    const cama = await Cama.findByPk(id);
    if (!cama) {
      return res.status(404).json({ message: 'Cama no encontrada' });
    }

    await cama.destroy();
    res.status(204).send();  // No Content
  } catch (error) {
    console.error('Error al eliminar cama:', error);
    res.status(500).json({ message: 'Error al eliminar cama' });
  }
};

// 🔸 Vista para mostrar todas las camas en la vista pug
export const vistaCamas = async (req, res) => {
  try {
    const camas = await Cama.findAll();
    res.render('cama', { camas });  // Renderiza cama.pug con datos
  } catch (error) {
    console.error('Error al cargar camas:', error);
    res.status(500).send('Error al cargar camas');
  }
};

