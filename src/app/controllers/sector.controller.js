import { Sector } from '../models/index.js';

// 🔸 Obtener todos los sectores
export const getSectores = async (req, res) => {
	try {
		const sectores = await Sector.findAll();
		res.json(sectores);
	} catch (error) {
		res.status(500).json({ message: 'Error al obtener sectores' });
	}
};

// 🔸 Obtener sector por ID
export const getSectorById = async (req, res) => {
	try {
		const sector = await Sector.findByPk(req.params.id);
		if (!sector) {
			return res.status(404).json({ message: 'Sector no encontrado' });
		}
		res.json(sector);
	} catch (error) {
		res.status(500).json({ message: 'Error al obtener sector' });
	}
};

// 🔸 Crear sector
export const createSector = async (req, res) => {
	try {
		const { nombre } = req.body;
		if (!nombre) {
			return res.status(400).json({ message: 'El nombre es obligatorio' });
		}

		const sector = await Sector.create({ nombre });
		res.status(201).json(sector);
	} catch (error) {
		res.status(500).json({ message: 'Error al crear sector' });
	}
};

// 🔸 Actualizar sector
export const updateSector = async (req, res) => {
	try {
		const { id } = req.params;
		const { nombre } = req.body;

		const sector = await Sector.findByPk(id);
		if (!sector) {
			return res.status(404).json({ message: 'Sector no encontrado' });
		}

		if (!nombre) {
			return res.status(400).json({ message: 'El nombre es obligatorio' });
		}

		await sector.update({ nombre });
		res.json(sector);
	} catch (error) {
		res.status(500).json({ message: 'Error al actualizar sector' });
	}
};

// 🔸 Eliminar sector
export const deleteSector = async (req, res) => {
	try {
		const { id } = req.params;
		const sector = await Sector.findByPk(id);
		if (!sector) {
			return res.status(404).json({ message: 'Sector no encontrado' });
		}

		await sector.destroy();
		res.status(204).send();
	} catch (error) {
		res.status(500).json({ message: 'Error al eliminar sector' });
	}
};
// En sector.controller.js
export const vistaSectores = async (req, res) => {
	try {
		const sectores = await Sector.findAll();
		res.render('sector', { sectores });
	} catch (error) {
		res.status(500).send('Error al cargar sectores');
	}
};
