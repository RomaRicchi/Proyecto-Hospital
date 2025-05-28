import { TipoRegistro } from '../models/index.js';

export const getTiposRegistro = async (req, res) => {
	try {
		const tipos = await TipoRegistro.findAll();
		res.json(tipos);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const getTipoRegistroById = async (req, res) => {
	try {
		const tipo = await TipoRegistro.findByPk(req.params.id);
		if (!tipo)
			return res
				.status(404)
				.json({ message: 'Tipo de registro no encontrado' });
		res.json(tipo);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const createTipoRegistro = async (req, res) => {
	try {
		const nuevo = await TipoRegistro.create(req.body);
		res.status(201).json(nuevo);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const updateTipoRegistro = async (req, res) => {
	try {
		const tipo = await TipoRegistro.findByPk(req.params.id);
		if (!tipo)
			return res
				.status(404)
				.json({ message: 'Tipo de registro no encontrado' });
		await tipo.update(req.body);
		res.json(tipo);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const deleteTipoRegistro = async (req, res) => {
	try {
		const tipo = await TipoRegistro.findByPk(req.params.id);
		if (!tipo)
			return res
				.status(404)
				.json({ message: 'Tipo de registro no encontrado' });
		await tipo.destroy();
		res.sendStatus(204);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};
