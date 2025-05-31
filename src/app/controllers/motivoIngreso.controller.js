import { MotivoIngreso } from '../models/index.js';

// 🔸 Obtener todos los motivos
export const getMotivosIngreso = async (req, res) => {
  try {
    const motivos = await MotivoIngreso.findAll();
    res.json(motivos);
  } catch (error) {
    console.error('Error al obtener motivos de ingreso:', error);
    res.status(500).json({ message: 'Error al obtener motivos de ingreso' });
  }
};

// 🔸 Obtener motivo por ID
export const getMotivoIngresoById = async (req, res) => {
  try {
    const motivo = await MotivoIngreso.findByPk(req.params.id);
    if (!motivo) {
      return res.status(404).json({ message: 'Motivo de ingreso no encontrado' });
    }
    res.json(motivo);
  } catch (error) {
    console.error('Error al obtener motivo:', error);
    res.status(500).json({ message: 'Error al obtener motivo de ingreso' });
  }
};

// 🔸 Crear motivo
export const createMotivoIngreso = async (req, res) => {
  try {
    const { tipo } = req.body;
    if (!tipo) {
      return res.status(400).json({ message: 'El tipo es obligatorio' });
    }

    const nuevoMotivo = await MotivoIngreso.create({ tipo });
    res.status(201).json(nuevoMotivo);
  } catch (error) {
    console.error('Error al crear motivo:', error);
    res.status(500).json({ message: 'Error al crear motivo de ingreso' });
  }
};

// 🔸 Actualizar motivo
export const updateMotivoIngreso = async (req, res) => {
  try {
    const { id } = req.params;
    const { tipo } = req.body;

    const motivo = await MotivoIngreso.findByPk(id);
    if (!motivo) {
      return res.status(404).json({ message: 'Motivo de ingreso no encontrado' });
    }

    if (!tipo) {
      return res.status(400).json({ message: 'El tipo es obligatorio' });
    }

    await motivo.update({ tipo });
    res.json(motivo);
  } catch (error) {
    console.error('Error al actualizar motivo:', error);
    res.status(500).json({ message: 'Error al actualizar motivo de ingreso' });
  }
};

// 🔸 Eliminar motivo
export const deleteMotivoIngreso = async (req, res) => {
  try {
    const { id } = req.params;
    const motivo = await MotivoIngreso.findByPk(id);
    if (!motivo) {
      return res.status(404).json({ message: 'Motivo de ingreso no encontrado' });
    }

    await motivo.destroy();
    res.status(204).send();  // No Content
  } catch (error) {
    console.error('Error al eliminar motivo:', error);
    res.status(500).json({ message: 'Error al eliminar motivo de ingreso' });
  }
};

// 🔸 Vista Pug para motivos de ingreso
export const vistaMotivosIngreso = async (req, res) => {
  try {
    const motivos = await MotivoIngreso.findAll();
    res.render('motivoIngreso', { motivos });
  } catch (error) {
    console.error('Error al cargar vista de motivos:', error);
    res.status(500).send('Error al cargar motivos de ingreso');
  }
};
