import {
	PersonalAdministrativo,
	Usuario,
	RolUsuario,
} from '../models/index.js';

export const getPersonalAdministrativo = async (req, res) => {
	try {
		const lista = await PersonalAdministrativo.findAll({
			include: ['usuario', 'rol'],
		});
		res.json(lista);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const getPersonalAdministrativoById = async (req, res) => {
	try {
		const persona = await PersonalAdministrativo.findByPk(req.params.id, {
			include: ['usuario', 'rol'],
		});
		if (!persona) return res.status(404).json({ message: 'No encontrado' });
		res.json(persona);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const createPersonalAdministrativo = async (req, res) => {
	try {
		const nuevo = await PersonalAdministrativo.create(req.body);
		res.status(201).json(nuevo);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const updatePersonalAdministrativo = async (req, res) => {
	try {
		const persona = await PersonalAdministrativo.findByPk(req.params.id);
		if (!persona) return res.status(404).json({ message: 'No encontrado' });
		await persona.update(req.body);
		res.json(persona);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const deletePersonalAdministrativo = async (req, res) => {
	try {
		const persona = await PersonalAdministrativo.findByPk(req.params.id);
		if (!persona) return res.status(404).json({ message: 'No encontrado' });
		persona.activo = false;
		await persona.save();
		res.sendStatus(204);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};
