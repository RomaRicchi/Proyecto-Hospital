import { Op } from 'sequelize';
import {Admision,
	MovimientoHabitacion,
} from '../models/index.js';



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

// ✅ Validar que la cama no esté ocupada en la fecha seleccionada por otra admisión activa
export async function validarOcupacionCamaPorAdmision(id_cama, fecha, transaction = null) {
  const fechaConsulta = new Date(fecha);

  const conflicto = await MovimientoHabitacion.findOne({
    where: {
      id_cama,
      id_mov: 1, // Ingreso
      estado: 1,
    },
    include: [
      {
        model: Admision,
        as: 'admision',
        where: {
          fecha_hora_ingreso: { [Op.lte]: fechaConsulta },
          [Op.or]: [
            { fecha_hora_egreso: null },
            { fecha_hora_egreso: { [Op.gte]: fechaConsulta } },
          ],
        },
      },
    ],
    transaction,
  });

  if (conflicto) {
    throw new Error('La cama ya está ocupada por otra admisión en esa fecha.');
  }
}

// ✅ Validar ocupación de cama por otra admisión activa (excluyendo una admisión específica)
export async function validarOcupacionCamaPorAdmisionExcepto(id_cama, fecha, id_admision_excluir, transaction = null) {
  const fechaConsulta = new Date(fecha);

  const conflicto = await MovimientoHabitacion.findOne({
    where: {
      id_cama,
      id_mov: 1, // Ingreso
      estado: 1,
    },
    include: [
      {
        model: Admision,
        as: 'admision',
        where: {
          id_admision: { [Op.ne]: id_admision_excluir }, // excluir la actual
          fecha_hora_ingreso: { [Op.lte]: fechaConsulta },
          [Op.or]: [
            { fecha_hora_egreso: null },
            { fecha_hora_egreso: { [Op.gte]: fechaConsulta } },
          ],
        },
      },
    ],
    transaction,
  });

  if (conflicto) {
    throw new Error('La cama ya está ocupada por otra admisión en esa fecha.');
  }
}

// ✅ Verifica si una admisión ya tiene movimiento de egreso activo
export async function validarMovimientoEgresoExistente(id_admision, transaction = null) {
  const egreso = await MovimientoHabitacion.findOne({
    where: {
      id_admision,
      id_mov: 2, // tipo "Egreso"
      estado: 1,
    },
    transaction,
  });

  if (egreso) {
    throw new Error('No se puede modificar la admisión: ya tiene un movimiento de egreso registrado.');
  }
}



