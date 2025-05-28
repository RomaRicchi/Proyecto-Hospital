import { MotivoIngreso } from '../models/index.js';

export const getMotivosIngreso = async (req, res) => {
	try {
		const motivos = await MotivoIngreso.findAll();
		res.json(motivos);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const getMotivoIngresoById = async (req, res) => {
	try {
		const motivo = await MotivoIngreso.findByPk(req.params.id);
		if (!motivo)
			return res.status(404).json({ message: 'Motivo no encontrado' });
		res.json(motivo);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const createMotivoIngreso = async (req, res) => {
	try {
		const nuevo = await MotivoIngreso.create(req.body);
		res.status(201).json(nuevo);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const updateMotivoIngreso = async (req, res) => {
	try {
		const motivo = await MotivoIngreso.findByPk(req.params.id);
		if (!motivo)
			return res.status(404).json({ message: 'Motivo no encontrado' });
		await motivo.update(req.body);
		res.json(motivo);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const deleteMotivoIngreso = async (req, res) => {
	try {
		const motivo = await MotivoIngreso.findByPk(req.params.id);
		if (!motivo)
			return res.status(404).json({ message: 'Motivo no encontrado' });
		await motivo.destroy();
		res.sendStatus(204);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};
