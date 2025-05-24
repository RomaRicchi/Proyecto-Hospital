import {
	PersonalSalud,
	Usuario,
	RolUsuario,
	Especialidad,
} from '../models/index.js';

export const getPersonalSalud = async (req, res) => {
	try {
		const lista = await PersonalSalud.findAll({
			include: ['usuario', 'rol', 'especialidad'],
		});
		res.json(lista);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const getPersonalSaludById = async (req, res) => {
	try {
		const persona = await PersonalSalud.findByPk(req.params.id, {
			include: ['usuario', 'rol', 'especialidad'],
		});
		if (!persona) return res.status(404).json({ message: 'No encontrado' });
		res.json(persona);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const createPersonalSalud = async (req, res) => {
	try {
		const nuevo = await PersonalSalud.create(req.body);
		res.status(201).json(nuevo);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const updatePersonalSalud = async (req, res) => {
	try {
		const persona = await PersonalSalud.findByPk(req.params.id);
		if (!persona) return res.status(404).json({ message: 'No encontrado' });
		await persona.update(req.body);
		res.json(persona);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const deletePersonalSalud = async (req, res) => {
	try {
		const persona = await PersonalSalud.findByPk(req.params.id);
		if (!persona) return res.status(404).json({ message: 'No encontrado' });
		persona.activo = false;
		await persona.save();
		res.sendStatus(204);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};
