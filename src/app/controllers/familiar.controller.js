import { Familiar, Paciente, Parentesco } from '../models/index.js';

export const getFamiliares = async (req, res) => {
	try {
		const familiares = await Familiar.findAll({
			where: { estado: true },
			include: [
				{ model: Paciente, as: 'paciente' },
				{ model: Parentesco, as: 'parentesco' },
			],
		});
		res.json(familiares);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const vistaFamiliares = async (req, res) => {
	try {
		const familiares = await Familiar.findAll({
			where: { estado: true },
			include: [
				{
					model: Paciente,
					as: 'paciente',
					attributes: [
						'nombre_p',
						'apellido_p',
						'dni_paciente',
						'telefono',
						'email',
					],
				},
				{
					model: Parentesco,
					as: 'parentesco',
					attributes: ['nombre'],
				},
			],
		});

		const familiaresAdaptados = familiares.map((f) => ({
			id_familiar: f.id_familiar,
			nombre: f.nombre,
			apellido: f.apellido,
			telefono: f.telefono,
			paciente: f.paciente
				? `${f.paciente.nombre_p} ${f.paciente.apellido_p}`
				: 'Sin asignar',
			dni_paciente: f.paciente?.dni_paciente || '-',
			email_paciente: f.paciente?.email || '-',
			telefono_paciente: f.paciente?.telefono || '-',
			parentesco: f.parentesco?.nombre || '-', 
		}));

		res.render('familiar', { 
			familiares: familiaresAdaptados || [] , 
			usuario: req.session.usuario,
			autenticado: true
		});
	} catch (error) {
		res.status(500).send('Error interno al mostrar familiares');
	}
};

export const getFamiliarById = async (req, res) => {
	try {
		const familiar = await Familiar.findByPk(req.params.id, {
			include: [
				{ model: Paciente, as: 'paciente' },
				{ model: Parentesco, as: 'parentesco' },
			],
		});
		if (!familiar)
			return res.status(404).json({ message: 'Familiar no encontrado' });
		res.json(familiar);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const getFamiliarByPaciente = async (req, res) => {
	try {
		const familiar = await Familiar.findOne({
			where: { id_paciente: req.params.id, estado: true },
			include: [
				{
					model: Paciente,
					as: 'paciente',
					attributes: ['nombre_p', 'apellido_p', 'dni_paciente'],
				},
				{ model: Parentesco, as: 'parentesco', attributes: ['nombre'] },
			],
		});
		if (!familiar)
			return res
				.status(404)
				.json({ message: 'No se encontró un familiar para este paciente.' });

		res.json(familiar);
	} catch (error) {
		res.status(500).json({ message: 'Error interno al buscar el familiar.' });
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
