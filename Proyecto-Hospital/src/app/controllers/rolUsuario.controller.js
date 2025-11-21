import { RolUsuario } from '../models/index.js';

export const listarRoles = async (req, res) => {
  try {
    const roles = await RolUsuario.findAll();
    res.json(roles);
  } catch (error) {
    res.status(500).json({ message: 'Error al listar roles' });
  }
};

export const crearRol = async (req, res) => {
  const { nombre } = req.body;
  try {
    const existe = await RolUsuario.findOne({ where: { nombre } });
    if (existe) return res.status(409).json({ message: 'Ya existe' });
    const nuevo = await RolUsuario.create({ nombre });
    res.json(nuevo);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear rol' });
  }
};

export const actualizarRol = async (req, res) => {
  const { id } = req.params;
  const { nombre } = req.body;
  try {
    const rol = await RolUsuario.findByPk(id);
    if (!rol) return res.status(404).json({ message: 'No encontrado' });
    await rol.update({ nombre });
    res.json({ message: 'Actualizado' });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar' });
  }
};

export const eliminarRol = async (req, res) => {
  const { id } = req.params;
  try {
    const rol = await RolUsuario.findByPk(id);
    if (!rol) return res.status(404).json({ message: 'No encontrado' });
    await rol.destroy();
    res.json({ message: 'Eliminado' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar' });
  }
};

export const vistaRolUsuario = async (req, res) => {
	try {
		const roles = await RolUsuario.findAll();
		res.render('rolUsuario', { 
      roles, 
      usuario: req.session.usuario,
      autenticado: true
    });
	} catch (error) {
		res.status(500).send('Error al mostrar roles de usuario');
	}
};