import { Parentesco } from '../models/index.js';

// 🔸 Obtener todos los parentescos
export const getParentescos = async (req, res) => {
  try {
    const parentescos = await Parentesco.findAll();
    res.json(parentescos);
  } catch (error) {
    console.error('Error al obtener parentescos:', error);
    res.status(500).json({ message: 'Error al obtener parentescos' });
  }
};

// 🔸 Obtener parentesco por ID
export const getParentescoById = async (req, res) => {
  try {
    const parentesco = await Parentesco.findByPk(req.params.id);
    if (!parentesco) {
      return res.status(404).json({ message: 'Parentesco no encontrado' });
    }
    res.json(parentesco);
  } catch (error) {
    console.error('Error al obtener parentesco:', error);
    res.status(500).json({ message: 'Error al obtener parentesco' });
  }
};

// 🔸 Crear parentesco
export const createParentesco = async (req, res) => {
  try {
    const { nombre } = req.body;
    if (!nombre) {
      return res.status(400).json({ message: 'El nombre es obligatorio' });
    }

    const parentesco = await Parentesco.create({ nombre });
    res.status(201).json(parentesco);
  } catch (error) {
    console.error('Error al crear parentesco:', error);
    res.status(500).json({ message: 'Error al crear parentesco' });
  }
};

// 🔸 Actualizar parentesco
export const updateParentesco = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre } = req.body;

    const parentesco = await Parentesco.findByPk(id);
    if (!parentesco) {
      return res.status(404).json({ message: 'Parentesco no encontrado' });
    }

    if (!nombre) {
      return res.status(400).json({ message: 'El nombre es obligatorio' });
    }

    await parentesco.update({ nombre });
    res.json(parentesco);
  } catch (error) {
    console.error('Error al actualizar parentesco:', error);
    res.status(500).json({ message: 'Error al actualizar parentesco' });
  }
};

// 🔸 Eliminar parentesco
export const deleteParentesco = async (req, res) => {
  try {
    const { id } = req.params;
    const parentesco = await Parentesco.findByPk(id);
    if (!parentesco) {
      return res.status(404).json({ message: 'Parentesco no encontrado' });
    }

    await parentesco.destroy();
    res.status(204).send();
  } catch (error) {
    console.error('Error al eliminar parentesco:', error);
    res.status(500).json({ message: 'Error al eliminar parentesco' });
  }
};

// 🔸 Vista para mostrar parentescos en pug
export const vistaParentescos = async (req, res) => {
  try {
    const parentescos = await Parentesco.findAll();
    res.render('parentesco', { parentescos });
  } catch (error) {
    console.error('Error al cargar vista de parentescos:', error);
    res.status(500).send('Error al cargar parentescos');
  }
};
