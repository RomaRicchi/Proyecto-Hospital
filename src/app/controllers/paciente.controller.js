import { Paciente, Genero, Localidad } from '../models/index.js';

export const getPacientes = async (req, res) => {
	try {
		const pacientes = await Paciente.findAll({
			where: { estado: true },
			include: ['genero', 'localidad'],
		});
		res.json(pacientes);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const getPacienteById = async (req, res) => {
	try {
		const paciente = await Paciente.findByPk(req.params.id, {
			include: ['genero', 'localidad'],
		});
		if (!paciente)
			return res.status(404).json({ message: 'Paciente no encontrado' });
		res.json(paciente);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const createPaciente = async (req, res) => {
	try {
		const paciente = await Paciente.create(req.body);
		res.status(201).json(paciente);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const updatePaciente = async (req, res) => {
	try {
		const paciente = await Paciente.findByPk(req.params.id);
		if (!paciente)
			return res.status(404).json({ message: 'Paciente no encontrado' });
		await paciente.update(req.body);
		res.json(paciente);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const deletePaciente = async (req, res) => {
	try {
		const paciente = await Paciente.findByPk(req.params.id);
		if (!paciente)
			return res.status(404).json({ message: 'Paciente no encontrado' });
		paciente.estado = false;
		await paciente.save();
		res.sendStatus(204);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};
