import { ObraSocial } from '../models/index.js';

export const getObrasSociales = async (req, res) => {
	try {
		const obras = await ObraSocial.findAll();
		res.json(obras);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const getObraSocialById = async (req, res) => {
	try {
		const obra = await ObraSocial.findByPk(req.params.id);
		if (!obra)
			return res.status(404).json({ message: 'Obra social no encontrada' });
		res.json(obra);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const createObraSocial = async (req, res) => {
	try {
		const nuevaObra = await ObraSocial.create(req.body);
		res.status(201).json(nuevaObra);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const updateObraSocial = async (req, res) => {
	try {
		const obra = await ObraSocial.findByPk(req.params.id);
		if (!obra)
			return res.status(404).json({ message: 'Obra social no encontrada' });
		await obra.update(req.body);
		res.json(obra);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const deleteObraSocial = async (req, res) => {
	try {
		const obra = await ObraSocial.findByPk(req.params.id);
		if (!obra)
			return res.status(404).json({ message: 'Obra social no encontrada' });
		await obra.destroy();
		res.sendStatus(204);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const vistaObrasSociales = async (req, res) => {
	try {
		const obras = await ObraSocial.findAll();
		res.render('obraSocial', { 
			obras_sociales: obras , 
  			usuario: req.session.usuario,
  			autenticado: true
		});
	} catch (error) {
		res.status(500).send('Error al cargar obras sociales');
	}
};
