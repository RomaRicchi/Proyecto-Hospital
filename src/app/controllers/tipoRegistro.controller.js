import { TipoRegistro, RegistroHistoriaClinica } from '../models/index.js';
import { Op } from 'sequelize';

export const listarTipos = async (req, res) => {
  try {
    const tipos = await TipoRegistro.findAll();
    res.json(tipos);
  } catch (e) {
    res.status(500).json({ message: 'Error al listar' });
  }
};

export const crearTipo = async (req, res) => {
  const { descripcion } = req.body;
  try {
    const existe = await TipoRegistro.findOne({ where: { descripcion } });
    if (existe) return res.status(409).json({ message: 'Ya existe' });
    const nuevo = await TipoRegistro.create({ descripcion });
    res.json(nuevo);
  } catch (e) {
    res.status(500).json({ message: 'Error al crear' });
  }
};

export const actualizarTipo = async (req, res) => {
  const { id } = req.params;
  const { descripcion } = req.body;
  try {
    const tipo = await TipoRegistro.findByPk(id);
    if (!tipo) return res.status(404).json({ message: 'No encontrado' });
    await tipo.update({ descripcion });
    res.json({ message: 'Actualizado' });
  } catch (e) {
    res.status(500).json({ message: 'Error al actualizar' });
  }
};

export const eliminarTipo = async (req, res) => {
  const { id } = req.params;
  try {
    /* Evitar eliminar si está en uso */
    const enUso = await RegistroHistoriaClinica.findOne({
      where: { id_tipo_registro: id }
    });
    if (enUso) return res.status(409).json({ message: 'En uso por registros clínicos' });

    const tipo = await TipoRegistro.findByPk(id);
    if (!tipo) return res.status(404).json({ message: 'No encontrado' });
    await tipo.destroy();
    res.json({ message: 'Eliminado' });
  } catch (e) {
    res.status(500).json({ message: 'Error al eliminar' });
  }
};

export const vistaTipoRegistro = async (req, res) => {
  try {
    const tipos = await TipoRegistro.findAll({
      where: { /* si tenés un campo estado, por ej. estado:true */ },
      order: [['descripcion', 'ASC']]
    });

    const tiposAdaptados = tipos.map(t => ({
      id_tipo_registro: t.id_tipo_registro,
      descripcion: t.descripcion
    }));

    res.render('tipoRegistro', { tipos: tiposAdaptados });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al mostrar tipos de registro');
  }
};
