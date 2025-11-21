import {
	Admision,
	Paciente,
	Cama,
	MovimientoHabitacion,
	RegistroHistoriaClinica,
	Usuario,
	TipoRegistro,
	PersonalSalud  
} from '../models/index.js'; 
import { Op } from 'sequelize';

export const buscarAdmisionVigente = async (req, res) => {
	
		const { dni } = req.params;

		const paciente = await Paciente.findOne({ where: { dni_paciente: dni } });
		if (!paciente)
			return res.json({ success: false, message: 'Paciente no encontrado' });

		const admision = await Admision.findOne({
			where: {
				id_paciente: paciente.id_paciente,
				fecha_hora_egreso: null,
			},
		});

		if (!admision)
			return res.json({ success: false, message: 'No hay admisión activa para este paciente' });

		res.json({ success: true, paciente, admision });
	
};

export const darAltaPaciente = async (req, res) => {
	try {
		const { dni } = req.params;
		let { fecha_hora_egreso, motivo_egr, id_personal_salud } = req.body;

		fecha_hora_egreso = new Date();

		const paciente = await Paciente.findOne({ where: { dni_paciente: dni } });
		if (!paciente) {
			return res
				.status(404)
				.json({ success: false, message: 'Paciente no encontrado' });
		}

		const admision = await Admision.findOne({
			where: {
				id_paciente: paciente.id_paciente,
				fecha_hora_egreso: null,
			},
		});
		if (!admision) {
			return res
				.status(404)
				.json({ success: false, message: 'No hay admisión vigente' });
		}

		admision.fecha_hora_egreso = fecha_hora_egreso;
		admision.motivo_egr = motivo_egr;
		admision.id_personal_salud = id_personal_salud;
		await admision.save();

		const ultimoMov = await MovimientoHabitacion.findOne({
			where: {
				id_admision: admision.id_admision,
				id_mov: 1,
				estado: 1,
				fecha_hora_egreso: null,
			},
			order: [['fecha_hora_ingreso', 'DESC']],
		});

		if (!ultimoMov) {
			return res.status(400).json({ success: false, message: 'No se encontró movimiento activo' });
		}

		ultimoMov.fecha_hora_egreso = fecha_hora_egreso;
		await ultimoMov.save();
		await MovimientoHabitacion.create({
			id_admision: admision.id_admision,
			id_habitacion: ultimoMov.id_habitacion,
			id_cama: ultimoMov.id_cama,
			fecha_hora_ingreso: fecha_hora_egreso,
			id_mov: 2,
			estado: 1,
		});

		const cama = await Cama.findByPk(ultimoMov.id_cama);
		if (cama) {
			cama.estado = 0;
			cama.desinfeccion = false; 
			await cama.save();
		}

		let id_usuario = null;
		if (id_personal_salud) {
			const medico = await Usuario.findOne({
				include: [{
					model: PersonalSalud,
					as: 'datos_medico',
					where: { id_personal_salud }
				}]
			});
			if (medico) id_usuario = medico.id_usuario;
		}

		const tipoEgreso = await TipoRegistro.findOne({ where: { nombre: { [Op.like]: '%egreso%' } } });
		const id_tipo = tipoEgreso ? tipoEgreso.id_tipo : null;

		await RegistroHistoriaClinica.create({
			id_admision: admision.id_admision,
			id_usuario,
			fecha_hora_reg: fecha_hora_egreso,
			id_tipo,
			detalle: `Alta médica: ${motivo_egr}`,
			estado: 1
		});

		return res.json({
			success: true,
			message: 'Alta registrada correctamente',
		});
	} catch (error) {
		res.status(500).json({ success: false, message: 'Error inesperado del servidor' });
	}
};

export const vistaAltaPaciente = (req, res) => {
  try {
    	res.render('altaPaciente', {
		usuario: req.session.usuario,
		autenticado: true
	});
  } catch (error) {
    res.status(500).send('Error al cargar el formulario de alta de paciente');
  }
};


