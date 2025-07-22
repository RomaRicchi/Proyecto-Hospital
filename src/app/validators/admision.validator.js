import { Op } from 'sequelize';
import { Admision, MovimientoHabitacion, Cama, Paciente } from '../models/index.js';

export async function validarEstadoCama(id_cama, transaction = null) {
  const cama = await Cama.findByPk(id_cama, { transaction });
  if (!cama) throw new Error('Cama no encontrada');
  if (cama.estado === 1) throw new Error('La cama ya está ocupada');
}

export function validarFechaNoPasada(fecha) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const fechaCheck = new Date(fecha);
  fechaCheck.setHours(0, 0, 0, 0);

  if (fechaCheck < hoy) {
    throw new Error('No se permite una fecha de ingreso en el pasado');
  }
}

export async function validarAdmisionActiva(id_paciente, fecha, transaction = null) {
  const fechaCheck = new Date(fecha);

  const existente = await Admision.findOne({
    where: {
      id_paciente,
      fecha_hora_ingreso: { [Op.lte]: fechaCheck },
      [Op.or]: [
        { fecha_hora_egreso: null },
        { fecha_hora_egreso: { [Op.gt]: fechaCheck } }
      ]
    },
    transaction
  });

  if (existente) throw new Error('El paciente ya tiene una admisión vigente.');
}

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

  if (conflicto) throw new Error('La cama ya está reservada en esa fecha y hora.');
}

export async function validarOcupacionCamaPorAdmision(id_cama, fecha, transaction = null) {
  const fechaConsulta = new Date(fecha);

  const conflicto = await MovimientoHabitacion.findOne({
    where: {
      id_cama,
      id_mov: 1,
      estado: 1,
    },
    include: [{
      model: Admision,
      as: 'admision',
      where: {
        fecha_hora_ingreso: { [Op.lte]: fechaConsulta },
        [Op.or]: [
          { fecha_hora_egreso: null },
          { fecha_hora_egreso: { [Op.gte]: fechaConsulta } },
        ]
      }
    }],
    transaction,
  });

  if (conflicto) throw new Error('La cama ya está ocupada por otra admisión en esa fecha.');
}

export async function validarOcupacionCamaPorAdmisionExcepto(id_cama, fecha, id_admision_excluir, transaction = null) {
  const fechaConsulta = new Date(fecha);

  const conflicto = await MovimientoHabitacion.findOne({
    where: {
      id_cama,
      id_mov: 1,
      estado: 1,
    },
    include: [{
      model: Admision,
      as: 'admision',
      where: {
        id_admision: { [Op.ne]: id_admision_excluir },
        fecha_hora_ingreso: { [Op.lte]: fechaConsulta },
        [Op.or]: [
          { fecha_hora_egreso: null },
          { fecha_hora_egreso: { [Op.gte]: fechaConsulta } },
        ]
      }
    }],
    transaction
  });

  if (conflicto) throw new Error('La cama ya está ocupada por otra admisión en esa fecha.');
}

export async function validarMovimientoEgresoExistente(id_admision, transaction = null) {
  const egreso = await MovimientoHabitacion.findOne({
    where: {
      id_admision,
      id_mov: 2,
      estado: 1,
    },
    transaction,
  });

  if (egreso) {
    throw new Error('No se puede modificar la admisión: ya tiene un movimiento de egreso registrado.');
  }
}

export async function verificarGeneroHabitacion(id_habitacion, id_genero, transaction = null) {
  const movimientos = await MovimientoHabitacion.findAll({
    where: {
      id_habitacion,
      fecha_hora_egreso: null,
      estado: 1,
    },
    include: [
      {
        model: Admision,
        as: 'admision',
        include: [
          { model: Paciente, as: 'paciente' }
        ]
      }
    ],
    transaction
  });

  const conflicto = movimientos.find(
    (mov) => mov.admision?.paciente?.id_genero !== parseInt(id_genero)
  );

  if (conflicto) {
    throw new Error('Ya hay pacientes de otro género en la habitación.');
  }
}
