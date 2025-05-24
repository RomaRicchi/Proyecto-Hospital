import { RegistroHistoriaClinica, Admision, Usuario } from '../models/index.js';

export const getRegistrosHistoria = async (req, res) => {
	try {
		const registros = await RegistroHistoriaClinica.findAll({
			where: { estado: true },
			include: ['admision', 'usuario'],
		});
		res.json(registros);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const getRegistroById = async (req, res) => {
	try {
		const registro = await RegistroHistoriaClinica.findByPk(req.params.id, {
			include: ['admision', 'usuario'],
		});
		if (!registro)
			return res.status(404).json({ message: 'Registro no encontrado' });
		res.json(registro);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const createRegistroHistoria = async (req, res) => {
	try {
		const nuevo = await RegistroHistoriaClinica.create(req.body);
		res.status(201).json(nuevo);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const updateRegistroHistoria = async (req, res) => {
	try {
		const registro = await RegistroHistoriaClinica.findByPk(req.params.id);
		if (!registro)
			return res.status(404).json({ message: 'Registro no encontrado' });
		await registro.update(req.body);
		res.json(registro);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const deleteRegistroHistoria = async (req, res) => {
	try {
		const registro = await RegistroHistoriaClinica.findByPk(req.params.id);
		if (!registro)
			return res.status(404).json({ message: 'Registro no encontrado' });
		registro.estado = false;
		await registro.save();
		res.sendStatus(204);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};
