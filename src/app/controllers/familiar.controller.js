import { Familiar, Paciente, Parentesco } from '../models/index.js';

export const getFamiliares = async (req, res) => {
	try {
		const familiares = await Familiar.findAll({
			where: { estado: true },
			include: ['paciente', 'parentesco'],
		});
		res.json(familiares);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const getFamiliarById = async (req, res) => {
	try {
		const familiar = await Familiar.findByPk(req.params.id, {
			include: ['paciente', 'parentesco'],
		});
		if (!familiar)
			return res.status(404).json({ message: 'Familiar no encontrado' });
		res.json(familiar);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const getFamiliarByPacienteId = async (req, res) => {
	try {
		const { pacienteId } = req.query;
		const familiar = await Familiar.findOne({
			where: {
				id_paciente: pacienteId,
				estado: true,
			},
			include: ['parentesco'],
		});
		res.json(familiar || null);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const createFamiliar = async (req, res) => {
	try {
		const familiar = await Familiar.create(req.body);
		res.status(201).json(familiar);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const updateFamiliar = async (req, res) => {
	try {
		const familiar = await Familiar.findByPk(req.params.id);
		if (!familiar)
			return res.status(404).json({ message: 'Familiar no encontrado' });
		await familiar.update(req.body);
		res.json(familiar);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const deleteFamiliar = async (req, res) => {
	try {
		const familiar = await Familiar.findByPk(req.params.id);
		if (!familiar)
			return res.status(404).json({ message: 'Familiar no encontrado' });
		familiar.estado = false;
		await familiar.save();
		res.sendStatus(204);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};
