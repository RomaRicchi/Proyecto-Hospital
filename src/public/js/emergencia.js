import {
  Paciente,
  Admision,
  ObraSocial,
  MotivoIngreso,
  Cama,
  Habitacion,
  Movimiento,
  MovimientoHabitacion,
  RegistroHistoriaClinica
} from '../models/index.js';
import { Op } from 'sequelize';

import {
  validarEstadoCama,
  validarFechaNoPasada,
  validarAdmisionActiva,
  validarConflictoReserva,
  verificarGeneroHabitacion
} from '../validators/admision.validator.js';

export const ingresoEmergencia = async (req, res) => {
  const sequelize = Admision.sequelize;
  const t = await sequelize.transaction();
  try {
    const { fecha_hora_ingreso, sexo, identificador } = req.body;

    if (!fecha_hora_ingreso || !sexo || !identificador) {
      return res.status(400).json({ error: 'Faltan datos obligatorios.' });
    }

    await validarFechaNoPasada(fecha_hora_ingreso);

    let paciente = await Paciente.findOne({
      where: { dni_paciente: identificador },
      transaction: t,
    });

    if (paciente) {
      await t.rollback();
      return res.status(409).json({ error: 'El paciente ya existe en el sistema.' });
    }

    paciente = await Paciente.create({
      dni_paciente: identificador,
      apellido_p: 'NN',
      nombre_p: 'No identificado',
      fecha_nac: null,
      id_genero: sexo,
      telefono: null,
      direccion: null,
      id_localidad: null,
      email: null,
      estado: 1,
    }, { transaction: t });

    await validarAdmisionActiva(paciente.id_paciente, fecha_hora_ingreso, t);

    const obraSocial = await ObraSocial.findOne({
      where: { nombre: { [Op.like]: '%Sin obra social%' } },
      transaction: t,
    });
    if (!obraSocial) {
      await t.rollback();
      return res.status(400).json({ error: 'No se encontró "Sin obra social".' });
    }

    const motivo = await MotivoIngreso.findOne({
      where: { tipo: { [Op.like]: '%emergencia%' } },
      transaction: t,
    });
    if (!motivo) {
      await t.rollback();
      return res.status(400).json({ error: 'No se encontró el motivo "emergencia".' });
    }

    const camasLibres = await Cama.findAll({
      where: { estado: 0 },
      include: [{ model: Habitacion, as: 'habitacion' }],
      transaction: t,
    });

    let camaAsignada = null;

    for (const cama of camasLibres) {
      try {
        await verificarGeneroHabitacion(cama.id_habitacion, sexo, t);
        camaAsignada = cama;
        break;
      } catch (e) {
        continue;
      }
    }

    if (!camaAsignada) {
      await t.rollback();
      return res.status(409).json({
        error: 'No hay camas disponibles compatibles con el sexo del paciente.',
      });
    }

    await validarEstadoCama(camaAsignada.id_cama, t);
    await validarConflictoReserva({
      id_cama: camaAsignada.id_cama,
      fecha_hora_ingreso
    }, t);

    const admision = await Admision.create({
      id_paciente: paciente.id_paciente,
      id_obra_social: obraSocial.id_obra_social,
      num_asociado: identificador,
      fecha_hora_ingreso,
      id_motivo: motivo.id_motivo,
      descripcion: 'Ingreso por emergencia',
      fecha_hora_egreso: null,
      motivo_egr: null,
      id_personal_salud: null,
    }, { transaction: t });

    const movIngreso = await Movimiento.findOne({
      where: { nombre: { [Op.like]: '%Ingresa%' } },
      transaction: t,
    });

    await MovimientoHabitacion.create({
      id_admision: admision.id_admision,
      id_habitacion: camaAsignada.id_habitacion,
      id_cama: camaAsignada.id_cama,
      fecha_hora_ingreso,
      fecha_hora_egreso: null,
      id_mov: movIngreso ? movIngreso.id_mov : 1,
      estado: 1,
    }, { transaction: t });

    await camaAsignada.update({ estado: 1 }, { transaction: t });

    await RegistroHistoriaClinica.create({
      id_admision: admision.id_admision,
      fecha_registro: new Date(fecha_hora_ingreso),
      id_usuario: null,
      descripcion: 'Ingreso por emergencia',
      estado: 1,
    }, { transaction: t });

    await t.commit();

    return res.status(200).json({
      mensaje: 'Paciente ingresado y cama asignada correctamente.',
      paciente: {
        id: paciente.id_paciente,
        nombre: paciente.nombre_p,
        apellido: paciente.apellido_p,
        dni: paciente.dni_paciente,
      },
      habitacion: camaAsignada.id_habitacion,
      num_habitacion: camaAsignada.habitacion.num,
      cama: camaAsignada.nombre,
    });

  } catch (error) {
    if (t) await t.rollback();
    console.error('Error en ingresoEmergencia:', error);
    return res.status(500).json({ error: 'Error en el ingreso de emergencia.' });
  }
};

export const vistaEmergencias = (req, res) => {
  try {
    res.render('emergencia');
  } catch (error) {
    res.status(500).send('Error al cargar la vista de emergencias');
  }
};
