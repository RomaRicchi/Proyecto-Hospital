import { Especialidad, PersonalSalud } from '../models/index.js';

export const listarEspecialidades = async (req, res) => {
  try {
    const especialidades = await Especialidad.findAll();
    res.json(especialidades);
  } catch (error) {
    res.status(500).json({ message: 'Error al listar especialidades' });
  }
};

export const crearEspecialidad = async (req, res) => {
  const { nombre } = req.body;
  try {
    const existente = await Especialidad.findOne({ where: { nombre } });
    if (existente) return res.status(409).json({ message: 'Ya existe' });
    const nueva = await Especialidad.create({ nombre });
    res.json(nueva);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear especialidad' });
  }
};

export const actualizarEspecialidad = async (req, res) => {
  const { id } = req.params;
  const { nombre } = req.body;
  try {
    const esp = await Especialidad.findByPk(id);
    if (!esp) return res.status(404).json({ message: 'No encontrada' });
    await esp.update({ nombre });
    res.json({ message: 'Actualizada' });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar' });
  }
};

export const eliminarEspecialidad = async (req, res) => {
  const { id } = req.params;
  try {
    const esp = await Especialidad.findByPk(id);
    if (!esp) return res.status(404).json({ message: 'No encontrada' });

    const enUso = await PersonalSalud.count({
      where: { id_especialidad: id }
    });

    if (enUso > 0) {
      return res.status(409).json({ message: 'La especialidad está asociada a profesionales' });
    }

    await esp.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar' });
  }
};

export const vistaEspecialidades = async (req, res) => {
  try {
    const especialidades = await Especialidad.findAll();
    res.render('especialidad', { 
      especialidades , 
      usuario: req.session.usuario,
      autenticado: true
    });
  } catch (error) {
    res.status(500).send('Error al mostrar especialidades');
  }
};