import { Especialidad } from '../models/index.js';

export const getEspecialidades = async (req, res) => {
	try {
		const lista = await Especialidad.findAll();
		res.json(lista);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const getEspecialidadById = async (req, res) => {
	try {
		const especialidad = await Especialidad.findByPk(req.params.id);
		if (!especialidad)
			return res.status(404).json({ message: 'Especialidad no encontrada' });
		res.json(especialidad);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const createEspecialidad = async (req, res) => {
	try {
		const nueva = await Especialidad.create(req.body);
		res.status(201).json(nueva);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const updateEspecialidad = async (req, res) => {
	try {
		const especialidad = await Especialidad.findByPk(req.params.id);
		if (!especialidad)
			return res.status(404).json({ message: 'Especialidad no encontrada' });
		await especialidad.update(req.body);
		res.json(especialidad);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const deleteEspecialidad = async (req, res) => {
	try {
		const especialidad = await Especialidad.findByPk(req.params.id);
		if (!especialidad)
			return res.status(404).json({ message: 'Especialidad no encontrada' });
		await especialidad.destroy();
		res.sendStatus(204);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};
