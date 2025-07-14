import { Turno, Agenda, EstadoTurno, Paciente } from '../models/index.js';

// Vista
export const vistaTurnos = (req, res) => {
  res.render('turno');
};

// Obtener todos los turnos
export const getTurnos = async (req, res) => {
  try {
    const turnos = await Turno.findAll({
      include: [
        { model: Agenda, as: 'agenda' },
        { model: EstadoTurno, as: 'estado' },
        { model: Paciente, as: 'paciente' }
      ]
    });
    res.json(turnos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener turnos' });
  }
};

// Crear turno
export const createTurno = async (req, res) => {
  try {
    const nuevo = await Turno.create(req.body);
    res.status(201).json(nuevo);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear turno' });
  }
};

// Obtener por ID
export const getTurnoById = async (req, res) => {
  try {
    const turno = await Turno.findByPk(req.params.id);
    if (!turno) return res.status(404).json({ message: 'No encontrado' });
    res.json(turno);
  } catch (error) {
    res.status(500).json({ message: 'Error al buscar turno' });
  }
};

// Actualizar
export const updateTurno = async (req, res) => {
  try {
    const turno = await Turno.findByPk(req.params.id);
    if (!turno) return res.status(404).json({ message: 'No encontrado' });
    await turno.update(req.body);
    res.json(turno);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar turno' });
  }
};

// Eliminar
export const deleteTurno = async (req, res) => {
  try {
    const turno = await Turno.findByPk(req.params.id);
    if (!turno) return res.status(404).json({ message: 'No encontrado' });
    await turno.destroy();
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar turno' });
  }
};
