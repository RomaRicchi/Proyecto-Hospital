import { Op } from 'sequelize';
import {Admision} from '../models/index.js';

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

