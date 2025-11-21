import { Parentesco } from '../models/index.js';

export const getParentescos = async (req, res) => {
	try {
		const parentescos = await Parentesco.findAll();
		res.json(parentescos);
	} catch (error) {
		res.status(500).json({ message: 'Error al obtener parentescos' });
	}
};

export const getParentescoById = async (req, res) => {
	try {
		const parentesco = await Parentesco.findByPk(req.params.id);
		if (!parentesco) {
			return res.status(404).json({ message: 'Parentesco no encontrado' });
		}
		res.json(parentesco);
	} catch (error) {
		res.status(500).json({ message: 'Error al obtener parentesco' });
	}
};

export const createParentesco = async (req, res) => {
	try {
		const { nombre } = req.body;
		if (!nombre) {
			return res.status(400).json({ message: 'El nombre es obligatorio' });
		}

		const parentesco = await Parentesco.create({ nombre });
		res.status(201).json(parentesco);
	} catch (error) {
		res.status(500).json({ message: 'Error al crear parentesco' });
	}
};

export const updateParentesco = async (req, res) => {
	try {
		const { id } = req.params;
		const { nombre } = req.body;

		const parentesco = await Parentesco.findByPk(id);
		if (!parentesco) {
			return res.status(404).json({ message: 'Parentesco no encontrado' });
		}

		if (!nombre) {
			return res.status(400).json({ message: 'El nombre es obligatorio' });
		}

		await parentesco.update({ nombre });
		res.json(parentesco);
	} catch (error) {
		res.status(500).json({ message: 'Error al actualizar parentesco' });
	}
};

export const deleteParentesco = async (req, res) => {
	try {
		const { id } = req.params;
		const parentesco = await Parentesco.findByPk(id);
		if (!parentesco) {
			return res.status(404).json({ message: 'Parentesco no encontrado' });
		}

		await parentesco.destroy();
		res.status(204).send();
	} catch (error) {
		res.status(500).json({ message: 'Error al eliminar parentesco' });
	}
};

export const vistaParentescos = async (req, res) => {
	try {
		const parentescos = await Parentesco.findAll();
		res.render('parentesco', { 
			parentescos , 
  			usuario: req.session.usuario,
  			autenticado: true
		});
	} catch (error) {
		res.status(500).send('Error al cargar parentescos');
	}
};
