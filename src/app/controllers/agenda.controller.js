import { Agenda, Usuario, Dia } from '../models/index.js';

// Vista
export const vistaAgendas = async (req, res) => {
  res.render('agenda');
};

// Obtener todas las agendas
export const getAgendas = async (req, res) => {
  try {
    const agendas = await Agenda.findAll({
      include: [
        { model: Usuario, as: 'profesional', attributes: ['id_usuario', 'username'] },
        { model: Dia, as: 'dia', attributes: ['nombre'] },
      ]
    });
    res.json(agendas);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener agendas' });
  }
};

// Crear agenda
export const createAgenda = async (req, res) => {
  try {
    const nueva = await Agenda.create(req.body);
    res.status(201).json(nueva);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear agenda' });
  }
};

// Obtener por ID
export const getAgendaById = async (req, res) => {
  try {
    const agenda = await Agenda.findByPk(req.params.id);
    if (!agenda) return res.status(404).json({ message: 'No encontrada' });
    res.json(agenda);
  } catch (error) {
    res.status(500).json({ message: 'Error al buscar agenda' });
  }
};

// Actualizar
export const updateAgenda = async (req, res) => {
  try {
    const agenda = await Agenda.findByPk(req.params.id);
    if (!agenda) return res.status(404).json({ message: 'No encontrada' });
    await agenda.update(req.body);
    res.json(agenda);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar agenda' });
  }
};

// Eliminar
export const deleteAgenda = async (req, res) => {
  try {
    const agenda = await Agenda.findByPk(req.params.id);
    if (!agenda) return res.status(404).json({ message: 'No encontrada' });
    await agenda.destroy();
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar agenda' });
  }
};
