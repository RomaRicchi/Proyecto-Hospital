import {
  Paciente,
  Admision,
  ObraSocial,
  MotivoIngreso,
  Cama,
  Habitacion,
  Movimiento,
  MovimientoHabitacion
} from '../models/index.js';
import { Op } from 'sequelize';

// ✅ Validar que la cama no tenga una reserva exacta o solapada
export async function validarConflictoReserva({ id_cama, fecha_hora_ingreso }, transaction = null) {
  const fecha = new Date(fecha_hora_ingreso);

  const conflicto = await MovimientoHabitacion.findOne({
    where: {
      id_cama,
      id_mov: 3, // Reserva
      estado: 1,
      [Op.or]: [
        { fecha_hora_ingreso: fecha },
        {
          [Op.and]: [
            { fecha_hora_ingreso: { [Op.lte]: fecha } },
            {
              [Op.or]: [
                { fecha_hora_egreso: null },
                { fecha_hora_egreso: { [Op.gt]: fecha } }
              ]
            }
          ]
        }
      ]
    },
    transaction
  });

  if (conflicto) {
    throw new Error('La cama ya está reservada en esa fecha y hora.');
  }
}

// ✅ Validar que la cama no esté ocupada
export async function validarEstadoCama(id_cama, transaction = null) {
  const cama = await Cama.findByPk(id_cama, { transaction });
  if (!cama) throw new Error('Cama no encontrada');
  if (cama.estado === 1) throw new Error('La cama ya está ocupada');
}

// ✅ Validar que la fecha no sea en el pasado
export function validarFechaNoPasada(fecha) {
  if (new Date(fecha) < new Date().setHours(0, 0, 0, 0)) {
    throw new Error('No se permite una fecha de ingreso en el pasado');
  }
}

// ✅ Validar que el paciente no tenga una admisión vigente
export async function validarAdmisionActiva(id_paciente, fecha, transaction = null) {
  const existente = await Admision.findOne({
    where: {
      id_paciente,
      fecha_hora_ingreso: { [Op.lte]: new Date(fecha) },
      [Op.or]: [
        { fecha_hora_egreso: null },
        { fecha_hora_egreso: { [Op.gt]: new Date(fecha) } }
      ]
    },
    transaction
  });

  if (existente) {
    throw new Error('El paciente ya tiene una admisión vigente.');
  }
}


export const ingresoEmergencia = async (req, res) => {
  const sequelize = Admision.sequelize;
  const t = await sequelize.transaction();
  try {
    const { fecha_hora_ingreso, sexo, identificador } = req.body;

    if (!fecha_hora_ingreso || !sexo || !identificador) {
      return res.status(400).json({ error: 'Faltan datos obligatorios.' });
    }

    // Validar fecha
    await validarFechaNoPasada(fecha_hora_ingreso);

    // Buscar o crear paciente NN
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

    // Validar que el paciente no tenga una admisión activa
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
      const movimientosActivos = await MovimientoHabitacion.findAll({
        where: {
          id_habitacion: cama.id_habitacion,
          fecha_hora_egreso: null,
          estado: 1,
        },
        include: [{
          model: Admision,
          as: 'admision',
          include: [{ model: Paciente, as: 'paciente' }],
        }],
        transaction: t,
      });

      if (movimientosActivos.length === 0 ||
          movimientosActivos.every((mov) => mov.admision?.paciente?.id_genero === parseInt(sexo))) {
        camaAsignada = cama;
        break;
      }
    }

    if (!camaAsignada) {
      await t.rollback();
      return res.status(409).json({
        error: 'No hay camas disponibles compatibles con el sexo del paciente.',
      });
    }

    // Validaciones adicionales sobre la cama
    await validarEstadoCama(camaAsignada.id_cama, t);
    await validarConflictoReserva({
      id_cama: camaAsignada.id_cama,
      fecha_hora_ingreso
    }, t);

    // Crear admisión
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

    // Movimiento
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
