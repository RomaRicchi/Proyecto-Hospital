import { RolUsuario } from '../models/index.js';

export const getRolesUsuario = async (req, res) => {
	try {
		const roles = await RolUsuario.findAll();
		res.json(roles);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const getRolUsuarioById = async (req, res) => {
	try {
		const rol = await RolUsuario.findByPk(req.params.id);
		if (!rol) return res.status(404).json({ message: 'Rol no encontrado' });
		res.json(rol);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const createRolUsuario = async (req, res) => {
	try {
		const nuevo = await RolUsuario.create(req.body);
		res.status(201).json(nuevo);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const updateRolUsuario = async (req, res) => {
	try {
		const rol = await RolUsuario.findByPk(req.params.id);
		if (!rol) return res.status(404).json({ message: 'Rol no encontrado' });
		await rol.update(req.body);
		res.json(rol);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const deleteRolUsuario = async (req, res) => {
	try {
		const rol = await RolUsuario.findByPk(req.params.id);
		if (!rol) return res.status(404).json({ message: 'Rol no encontrado' });
		await rol.destroy();
		res.sendStatus(204);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};
