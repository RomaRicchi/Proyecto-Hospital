import { Dia } from '../models/index.js';

export const getDia = async (req, res) => {
  try {
    const dias = await Dia.findAll();
    res.json(dias);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener días de semana' });
  }
};

export const getDiaById = async (req, res) => {
  try {
    const dia = await Dia.findByPk(req.params.id);
    if (!dia) return res.status(404).json({ message: 'Día no encontrado' });
    res.json(dia);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el día' });
  }
};

export const createDia = async (req, res) => {
  try {
    const { nombre } = req.body;
    const nuevoDia = await Dia.create({ nombre });
    res.status(201).json(nuevoDia);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el día' });
  }
};

export const updateDia = async (req, res) => {
  try {
    const dia = await Dia.findByPk(req.params.id);
    if (!dia) return res.status(404).json({ message: 'Día no encontrado' });

    const { nombre } = req.body;
    dia.nombre = nombre;
    await dia.save();

    res.json(dia);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el día' });
  }
};

export const deleteDia = async (req, res) => {
  try {
    const dia = await Dia.findByPk(req.params.id);
    if (!dia) return res.status(404).json({ message: 'Día no encontrado' });

    await dia.destroy();
    res.json({ message: 'Día eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el día' });
  }
};

export const vistaDias = async (req, res) => {
    res.render('dia', {
    usuario: req.session.usuario,
    autenticado: true
  });
};
