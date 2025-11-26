import { TipoRegistro, RegistroHistoriaClinica } from '../models/index.js';

export const listarTipos = async (req, res) => {
  try {
    const tipos = await TipoRegistro.findAll();
    res.json(tipos);
  } catch (e) {
    res.status(500).json({ message: 'Error al listar' });
  }
};

export const crearTipo = async (req, res) => {
  const { nombre } = req.body;
  try {
    const existe = await TipoRegistro.findOne({ where: { nombre } });
    if (existe) return res.status(409).json({ message: 'Ya existe' });
    const nuevo = await TipoRegistro.create({ nombre });
    res.json(nuevo);
  } catch (e) {
    res.status(500).json({ message: 'Error al crear' });
  }
};

export const actualizarTipo = async (req, res) => {
  const { id } = req.params;
  const { nombre } = req.body;
  try {
    const tipo = await TipoRegistro.findByPk(id);
    if (!tipo) return res.status(404).json({ message: 'No encontrado' });
    await tipo.update({ nombre });
    res.json({ message: 'Actualizado' });
  } catch (e) {
    res.status(500).json({ message: 'Error al actualizar' });
  }
};

export const eliminarTipo = async (req, res) => {
  const { id } = req.params;
  try {
    const enUso = await RegistroHistoriaClinica.findOne({
      where: { id_tipo: id }
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
      order: [['nombre', 'ASC']]
    });

    const tiposAdaptados = tipos.map(t => ({
      id_tipo: t.id_tipo,
      nombre: t.nombre
    }));

    res.render('tiposRegistro', { 
      tipos: tiposAdaptados, 
      usuario: req.session.usuario,
      autenticado: true
    }); 
  } catch (error) {
    res.status(500).send('Error al mostrar tipos de registro');
  }
};
