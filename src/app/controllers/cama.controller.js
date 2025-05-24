import { Cama } from '../models/index.js';

export const getCamas = async (req, res) => {
	try {
		const camas = await Cama.findAll();
		res.json(camas);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const getCamaById = async (req, res) => {
	try {
		const cama = await Cama.findByPk(req.params.id);
		if (!cama) return res.status(404).json({ message: 'Cama no encontrada' });
		res.json(cama);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const createCama = async (req, res) => {
	try {
		const nueva = await Cama.create(req.body);
		res.status(201).json(nueva);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const updateCama = async (req, res) => {
	try {
		const cama = await Cama.findByPk(req.params.id);
		if (!cama) return res.status(404).json({ message: 'Cama no encontrada' });
		await cama.update(req.body);
		res.json(cama);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const deleteCama = async (req, res) => {
	try {
		const cama = await Cama.findByPk(req.params.id);
		if (!cama) return res.status(404).json({ message: 'Cama no encontrada' });
		await cama.destroy();
		res.sendStatus(204);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};
