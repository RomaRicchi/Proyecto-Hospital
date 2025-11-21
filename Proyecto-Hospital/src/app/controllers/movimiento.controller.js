import { Movimiento } from '../models/index.js';

export const getMovimientos = async (req, res) => {
	try {
		const movimientos = await Movimiento.findAll();
		res.json(movimientos);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const getMovimientoById = async (req, res) => {
	try {
		const movimiento = await Movimiento.findByPk(req.params.id);
		if (!movimiento)
			return res.status(404).json({ message: 'Movimiento no encontrado' });
		res.json(movimiento);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const createMovimiento = async (req, res) => {
	try {
		const nuevo = await Movimiento.create(req.body);
		res.status(201).json(nuevo);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const updateMovimiento = async (req, res) => {
	try {
		const movimiento = await Movimiento.findByPk(req.params.id);
		if (!movimiento)
			return res.status(404).json({ message: 'Movimiento no encontrado' });
		await movimiento.update(req.body);
		res.json(movimiento);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const deleteMovimiento = async (req, res) => {
	try {
		const movimiento = await Movimiento.findByPk(req.params.id);
		if (!movimiento)
			return res.status(404).json({ message: 'Movimiento no encontrado' });
		await movimiento.destroy();
		res.sendStatus(204);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const vistaMovimientos = async (req, res) => {
	try {
		const movimientos = await Movimiento.findAll();
		res.render('movimiento', { 
			movimientos , 
			usuario: req.session.usuario,
			autenticado: true
		});
	} catch (error) {
		res.status(500).send('Error al cargar movimientos');
	}
};
