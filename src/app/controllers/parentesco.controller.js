import { Parentesco } from '../models/index.js';

export const getParentescos = async (req, res) => {
	try {
		const lista = await Parentesco.findAll();
		res.json(lista);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const getParentescoById = async (req, res) => {
	try {
		const parentesco = await Parentesco.findByPk(req.params.id);
		if (!parentesco)
			return res.status(404).json({ message: 'Parentesco no encontrado' });
		res.json(parentesco);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const createParentesco = async (req, res) => {
	try {
		const nuevo = await Parentesco.create(req.body);
		res.status(201).json(nuevo);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const updateParentesco = async (req, res) => {
	try {
		const parentesco = await Parentesco.findByPk(req.params.id);
		if (!parentesco)
			return res.status(404).json({ message: 'Parentesco no encontrado' });
		await parentesco.update(req.body);
		res.json(parentesco);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const deleteParentesco = async (req, res) => {
	try {
		const parentesco = await Parentesco.findByPk(req.params.id);
		if (!parentesco)
			return res.status(404).json({ message: 'Parentesco no encontrado' });
		await parentesco.destroy();
		res.sendStatus(204);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};
