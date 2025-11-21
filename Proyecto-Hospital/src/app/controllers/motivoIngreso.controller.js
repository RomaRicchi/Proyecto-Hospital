import { MotivoIngreso } from '../models/index.js';

export const getMotivosIngreso = async (req, res) => {
	try {
		const motivos = await MotivoIngreso.findAll();
		res.json(motivos);
	} catch (error) {
		res.status(500).json({ message: 'Error al obtener motivos de ingreso' });
	}
};

export const getMotivoIngresoById = async (req, res) => {
	try {
		const motivo = await MotivoIngreso.findByPk(req.params.id);
		if (!motivo) {
			return res
				.status(404)
				.json({ message: 'Motivo de ingreso no encontrado' });
		}
		res.json(motivo);
	} catch (error) {
		res.status(500).json({ message: 'Error al obtener motivo de ingreso' });
	}
};

export const createMotivoIngreso = async (req, res) => {
	try {
		const { tipo } = req.body;
		if (!tipo) {
			return res.status(400).json({ message: 'El tipo es obligatorio' });
		}

		const nuevoMotivo = await MotivoIngreso.create({ tipo });
		res.status(201).json(nuevoMotivo);
	} catch (error) {
		res.status(500).json({ message: 'Error al crear motivo de ingreso' });
	}
};

export const updateMotivoIngreso = async (req, res) => {
	try {
		const { id } = req.params;
		const { tipo } = req.body;

		const motivo = await MotivoIngreso.findByPk(id);
		if (!motivo) {
			return res
				.status(404)
				.json({ message: 'Motivo de ingreso no encontrado' });
		}

		if (!tipo) {
			return res.status(400).json({ message: 'El tipo es obligatorio' });
		}

		await motivo.update({ tipo });
		res.json(motivo);
	} catch (error) {
		res.status(500).json({ message: 'Error al actualizar motivo de ingreso' });
	}
};

export const deleteMotivoIngreso = async (req, res) => {
	try {
		const { id } = req.params;
		const motivo = await MotivoIngreso.findByPk(id);
		if (!motivo) {
			return res
				.status(404)
				.json({ message: 'Motivo de ingreso no encontrado' });
		}

		await motivo.destroy();
		res.status(204).send(); 
	} catch (error) {
		res.status(500).json({ message: 'Error al eliminar motivo de ingreso' });
	}
};

export const vistaMotivosIngreso = async (req, res) => {
	try {
		const motivos = await MotivoIngreso.findAll();
		res.render('motivoIngreso', { 
			motivos, 
			usuario: req.session.usuario,
			autenticado: true
		});
	} catch (error) {
		res.status(500).send('Error al cargar motivos de ingreso');
	}
};
