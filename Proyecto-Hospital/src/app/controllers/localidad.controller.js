import { Localidad } from '../models/index.js';

export const getLocalidades = async (req, res) => {
	try {
		const localidades = await Localidad.findAll();
		res.json(localidades);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const getLocalidadById = async (req, res) => {
	try {
		const localidad = await Localidad.findByPk(req.params.id);
		if (!localidad)
			return res.status(404).json({ message: 'Localidad no encontrada' });
		res.json(localidad);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const createLocalidad = async (req, res) => {
	try {
		const nombre = req.body.nombre?.trim();

		if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ -]+$/.test(nombre)) {
			return res.status(400).json({ message: 'El nombre solo puede contener letras, espacios y guiones.' });
		}

		const localidad = await Localidad.create({ nombre });
		res.status(201).json(localidad);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const updateLocalidad = async (req, res) => {
	try {
		const localidad = await Localidad.findByPk(req.params.id);
		if (!localidad)
			return res.status(404).json({ message: 'Localidad no encontrada' });

		const nombre = req.body.nombre?.trim();

		if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ \-]+$/.test(nombre)) {
			return res.status(400).json({ message: 'El nombre solo puede contener letras, espacios y guiones.' });
		}

		await localidad.update({ nombre });
		res.json(localidad);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const deleteLocalidad = async (req, res) => {
	try {
		const localidad = await Localidad.findByPk(req.params.id);
		if (!localidad)
			return res.status(404).json({ message: 'Localidad no encontrada' });
		await localidad.destroy();
		res.sendStatus(204);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const vistaLocalidades = async (req, res) => {
	try {
		const localidades = await Localidad.findAll();
		res.render('localidad', { 
			localidades, 
			usuario: req.session.usuario,
			autenticado: true
		});
	} catch (error) {
		res.status(500).send('Error al cargar la vista de localidades');
	};
};
