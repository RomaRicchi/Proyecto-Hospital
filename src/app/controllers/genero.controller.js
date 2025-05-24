import { Genero } from '../models/index.js';

export const getGeneros = async (req, res) => {
	try {
		const generos = await Genero.findAll();
		res.json(generos);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const getGeneroById = async (req, res) => {
	try {
		const genero = await Genero.findByPk(req.params.id);
		if (!genero)
			return res.status(404).json({ message: 'Género no encontrado' });
		res.json(genero);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const createGenero = async (req, res) => {
	try {
		const genero = await Genero.create(req.body);
		res.status(201).json(genero);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const updateGenero = async (req, res) => {
	try {
		const genero = await Genero.findByPk(req.params.id);
		if (!genero)
			return res.status(404).json({ message: 'Género no encontrado' });
		await genero.update(req.body);
		res.json(genero);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const deleteGenero = async (req, res) => {
	try {
		const genero = await Genero.findByPk(req.params.id);
		if (!genero)
			return res.status(404).json({ message: 'Género no encontrado' });
		await genero.destroy();
		res.sendStatus(204);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};
