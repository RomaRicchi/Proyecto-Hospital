// src/utils/validacionesAdmision.js
import { MovimientoHabitacion, Cama, Admision } from '../../../app/models/index.js';
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
