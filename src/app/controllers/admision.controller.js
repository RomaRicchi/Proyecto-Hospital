import { Admision, Paciente, ObraSocial, Usuario } from '../models/index.js';

export const getAdmisiones = async (req, res) => {
	try {
		const admisiones = await Admision.findAll({
			include: ['paciente', 'obra_social', 'personal_admin', 'personal_salud'],
		});
		res.json(admisiones);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const getAdmisionById = async (req, res) => {
	try {
		const admision = await Admision.findByPk(req.params.id, {
			include: ['paciente', 'obra_social', 'personal_admin', 'personal_salud'],
		});
		if (!admision)
			return res.status(404).json({ message: 'Admisión no encontrada' });
		res.json(admision);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const createAdmision = async (req, res) => {
	try {
		const nueva = await Admision.create(req.body);
		res.status(201).json(nueva);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const updateAdmision = async (req, res) => {
	try {
		const admision = await Admision.findByPk(req.params.id);
		if (!admision)
			return res.status(404).json({ message: 'Admisión no encontrada' });
		await admision.update(req.body);
		res.json(admision);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const deleteAdmision = async (req, res) => {
	try {
		const admision = await Admision.findByPk(req.params.id);
		if (!admision)
			return res.status(404).json({ message: 'Admisión no encontrada' });
		await admision.destroy(); // Si fuera baja lógica: admision.estado = false
		res.sendStatus(204);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};
