import { EstadoTurno } from '../models/index.js';

export const getEstadosTurno = async (req, res) => {
  try {
    const estados = await EstadoTurno.findAll();
    res.json(estados);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener estados' });
  }
};

export const getEstadoTurnoById = async (req, res) => {
  const estado = await EstadoTurno.findByPk(req.params.id);
  if (!estado) return res.status(404).json({ message: 'No encontrado' });
  res.json(estado);
};

export const createEstadoTurno = async (req, res) => {
  const nuevo = await EstadoTurno.create(req.body);
  res.status(201).json(nuevo);
};

export const updateEstadoTurno = async (req, res) => {
  const estado = await EstadoTurno.findByPk(req.params.id);
  if (!estado) return res.status(404).json({ message: 'No encontrado' });
  await estado.update(req.body);
  res.json(estado);
};

export const deleteEstadoTurno = async (req, res) => {
  const estado = await EstadoTurno.findByPk(req.params.id);
  if (!estado) return res.status(404).json({ message: 'No encontrado' });
  await estado.destroy();
  res.sendStatus(204);
};

export const vistaEstadoTurno = (req, res) => 
  res.render('estadoTurno', {
  usuario: req.session.usuario,
  autenticado: true
});
