import { Admision, Paciente, ObraSocial, Usuario } from '../models/index.js';

export const getAdmisiones = async (req, res) => {
	try {
		const admisiones = await Admision.findAll({
			include: ['paciente', 'obra_social', 'personal_admin', 'personal_salud'],
		});
		res.json(admisiones);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const getAdmisionById = async (req, res) => {
	try {
		const admision = await Admision.findByPk(req.params.id, {
			include: ['paciente', 'obra_social', 'personal_admin', 'personal_salud'],
		});
		if (!admision)
			return res.status(404).json({ message: 'Admisión no encontrada' });
		res.json(admision);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const vistaAdmisiones = async (req, res) => {
	try {
		const admisiones = await Admision.findAll({
			include: [
				{
					model: Paciente,
					as: 'paciente',
					attributes: ['apellido_p', 'nombre_p', 'dni_paciente'],
				},
				{ model: ObraSocial, as: 'obra_social', attributes: ['nombre'] },
				{ model: Usuario, as: 'personal_admin', attributes: ['username'] },
				{ model: Usuario, as: 'personal_salud', attributes: ['username'] },
			],
		});

		const adaptados = admisiones.map((a) => ({
			id_admision: a.id_admision,
			paciente: a.paciente
				? `${a.paciente.apellido_p} ${a.paciente.nombre_p} (DNI: ${a.paciente.dni_paciente})`
				: 'Sin paciente',
			obra_social: a.obra_social ? a.obra_social.nombre : 'Sin cobertura',
			num_asociado: a.num_asociado,
			fecha_ingreso: a.fecha_hora_ingreso
				? new Date(a.fecha_hora_ingreso).toLocaleString()
				: '-',
			fecha_egreso: a.fecha_hora_egreso
				? new Date(a.fecha_hora_egreso).toLocaleString()
				: 'En internación',
			motivo_ingreso: a.descripcion || '-',
			personal_admin: a.personal_admin ? a.personal_admin.username : '-',
			personal_salud: a.personal_salud ? a.personal_salud.username : '-',
		}));

		res.render('admision', { admisiones: adaptados });
	} catch (error) {
		console.error('Error al cargar vista de admisiones:', error);
		res.status(500).send('Error al mostrar admisiones');
	}
};

export const createAdmision = async (req, res) => {
	try {
		const nueva = await Admision.create(req.body);
		res.status(201).json(nueva);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const updateAdmision = async (req, res) => {
	try {
		const admision = await Admision.findByPk(req.params.id);
		if (!admision)
			return res.status(404).json({ message: 'Admisión no encontrada' });
		await admision.update(req.body);
		res.json(admision);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const deleteAdmision = async (req, res) => {
	try {
		const admision = await Admision.findByPk(req.params.id);
		if (!admision)
			return res.status(404).json({ message: 'Admisión no encontrada' });
		await admision.destroy(); // Si fuera baja lógica: admision.estado = false
		res.sendStatus(204);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};
