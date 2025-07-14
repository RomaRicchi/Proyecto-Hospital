import { Dia } from '../models/index.js';

export const getDiasSemana = async (req, res) => {
  try {
    const dias = await Dia.findAll();
    res.json(dias);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener días de semana' });
  }
};

export const vistaDiasSemana = async (req, res) => {
  res.render('diaSemana'); // si hacés una tabla o algo para verlos
};

