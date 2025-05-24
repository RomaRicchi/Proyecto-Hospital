import { Sector } from '../models/index.js';

export const getSectores = async (req, res) => {
	try {
		const sectores = await Sector.findAll();
		res.json(sectores);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const getSectorById = async (req, res) => {
	try {
		const sector = await Sector.findByPk(req.params.id);
		if (!sector)
			return res.status(404).json({ message: 'Sector no encontrado' });
		res.json(sector);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const createSector = async (req, res) => {
	try {
		const nuevo = await Sector.create(req.body);
		res.status(201).json(nuevo);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const updateSector = async (req, res) => {
	try {
		const sector = await Sector.findByPk(req.params.id);
		if (!sector)
			return res.status(404).json({ message: 'Sector no encontrado' });
		await sector.update(req.body);
		res.json(sector);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const deleteSector = async (req, res) => {
	try {
		const sector = await Sector.findByPk(req.params.id);
		if (!sector)
			return res.status(404).json({ message: 'Sector no encontrado' });
		await sector.destroy();
		res.sendStatus(204);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};
