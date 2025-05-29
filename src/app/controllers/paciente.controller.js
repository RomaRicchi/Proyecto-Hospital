import {
	Paciente,
	Genero,
	Localidad,
	Admision,
	ObraSocial,
	Familiar,
	Parentesco,
} from '../models/index.js';

export const vistaPacientes = async (req, res) => {
	try {
		const pacientes = await Paciente.findAll({
			include: [
				{ model: Genero, as: 'genero', attributes: ['nombre'] },
				{ model: Localidad, as: 'localidad', attributes: ['nombre'] },
				{
					model: Admision,
					as: 'admisiones',
					include: [
						{ model: ObraSocial, as: 'obra_social', attributes: ['nombre'] },
					],
					limit: 1,
					order: [['fecha_hora_ingreso', 'DESC']],
				},
				{
					model: Familiar,
					as: 'familiares',
					include: [
						{ model: Parentesco, as: 'parentesco', attributes: ['nombre'] },
					],
				},
			],
			where: { estado: true },
		});

		const pacientesAdaptados = pacientes.map((p) => {
			const ultimaAdmision = p.admisiones?.[0];
			const familiar = p.familiares?.[0]; // Tomar un familiar (podrías adaptar para múltiples)
			return {
				id_paciente: p.id_paciente,
				dni_paciente: p.dni_paciente,
				apellido_p: p.apellido_p,
				nombre_p: p.nombre_p,
				fecha_nac: p.fecha_nac,
				genero: p.genero?.nombre || '-',
				cobertura: ultimaAdmision?.obra_social?.nombre || '-',
				telefono: p.telefono,
				email: p.email,
				direccion: p.direccion,
				localidad: p.localidad?.nombre || '-',
				// Familiar relacionado (opcional)
				familiar: familiar
					? `${familiar.nombre} ${familiar.apellido} (${
							familiar.parentesco?.nombre || 'Sin parentesco'
					  })`
					: 'Sin familiar asignado',
			};
		});

		res.render('paciente', { pacientes: pacientesAdaptados || [] });
	} catch (error) {
		console.error('Error al listar pacientes:', error);
		res.status(500).send('Error en el servidor');
	}
};

export const vistaPacienteNuevo = async (req, res) => {
	try {
		const generos = await Genero.findAll({
			attributes: ['id_genero', 'nombre'],
		});
		const localidades = await Localidad.findAll({
			attributes: ['id_localidad', 'nombre'],
		});

		res.render('pacienteNuevo', { generos, localidades });
	} catch (error) {
		console.error('Error cargando nuevo paciente:', error);
		res.status(500).send('Error al cargar formulario de paciente');
	}
};

// Obtener todos los pacientes (API REST)
export const getPacientes = async (req, res) => {
	try {
		const pacientes = await Paciente.findAll({ where: { estado: true } });
		res.json(pacientes);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// Obtener paciente por ID
export const getPacienteById = async (req, res) => {
	try {
		const paciente = await Paciente.findByPk(req.params.id);
		if (!paciente)
			return res.status(404).json({ message: 'Paciente no encontrado' });
		res.json(paciente);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// Crear paciente
export const createPaciente = async (req, res) => {
	try {
		const nuevo = await Paciente.create(req.body);
		res.status(201).json(nuevo);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// Actualizar paciente
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

// Eliminar (borrado lógico) paciente
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
