import { Localidad } from '../models/index.js';

export const getLocalidades = async (req, res) => {
	try {
		const localidades = await Localidad.findAll();
		res.json(localidades);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const getLocalidadById = async (req, res) => {
	try {
		const localidad = await Localidad.findByPk(req.params.id);
		if (!localidad)
			return res.status(404).json({ message: 'Localidad no encontrada' });
		res.json(localidad);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const createLocalidad = async (req, res) => {
	try {
		const localidad = await Localidad.create(req.body);
		res.status(201).json(localidad);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const updateLocalidad = async (req, res) => {
	try {
		const localidad = await Localidad.findByPk(req.params.id);
		if (!localidad)
			return res.status(404).json({ message: 'Localidad no encontrada' });
		await localidad.update(req.body);
		res.json(localidad);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const deleteLocalidad = async (req, res) => {
	try {
		const localidad = await Localidad.findByPk(req.params.id);
		if (!localidad)
			return res.status(404).json({ message: 'Localidad no encontrada' });
		await localidad.destroy();
		res.sendStatus(204);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};
