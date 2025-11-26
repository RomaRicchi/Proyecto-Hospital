import {
  MovimientoHabitacion,
  Admision,
  Paciente,
  Cama,
  Habitacion,
  Sector,
  TipoRegistro,
  RegistroHistoriaClinica,
  sequelize,
} from '../models/index.js';
import { Op } from 'sequelize';
import {  verificarGeneroHabitacion,
} from '../validators/admision.validator.js';
import {
  calcularEdad,
  validarCompatibilidadPacienteSector
} from '../validators/validarSectorPaciente.js';

export const vistaReservarCama = (req, res) => {
  try {
    res.render('reservaCama', {
    usuario: req.session.usuario,
    autenticado: true
  });
  } catch (error) {
    res.status(500).send('Error al cargar reservas');
  }
};

export const confirmarReserva = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id_admision } = req.params;

    const admision = await Admision.findByPk(id_admision, { transaction: t });
    if (!admision) return res.status(404).json({ message: 'Admisión no encontrada' });

    // Buscar movimiento de reserva activo
    const movReserva = await MovimientoHabitacion.findOne({
      where: {
        id_admision,
        id_mov: 3,
        estado: 1,
      },
      transaction: t,
    });

    if (!movReserva) return res.status(400).json({ message: 'No hay reserva activa para confirmar.' });

    // Desactivar reserva
    movReserva.estado = 0;
    await movReserva.save({ transaction: t });

    // Actualizar admisión: nueva fecha de ingreso = ahora, nuevo egreso = +7 días
    const nuevaFechaIngreso = new Date(); // ahora
    const nuevaFechaEgreso = new Date(nuevaFechaIngreso.getTime() + 7 * 24 * 60 * 60 * 1000); // +7 días

    await admision.update({
      fecha_hora_ingreso: nuevaFechaIngreso,
      fecha_hora_egreso: nuevaFechaEgreso,
      motivo_egr: null,
    }, { transaction: t });

    // Crear nuevo movimiento de tipo ingreso (1)
    await MovimientoHabitacion.create({
      id_admision,
      id_cama: movReserva.id_cama,
      id_habitacion: movReserva.id_habitacion,
      id_mov: 1,
      fecha_hora_ingreso: nuevaFechaIngreso,
      fecha_hora_egreso: nuevaFechaEgreso,
      estado: 1,
    }, { transaction: t });

    // Actualizar estado de la cama (por seguridad ya estaba ocupada, pero se asegura)
    const cama = await Cama.findByPk(movReserva.id_cama, { transaction: t });
    if (cama) {
      cama.estado = 1;
      await cama.save({ transaction: t });
    }

    // Agregar registro en historia clínica
    const tipoIngreso = await TipoRegistro.findOne({
      where: { nombre: { [sequelize.Op.like]: '%ingreso%' } },
      transaction: t,
    });

    if (tipoIngreso) {
      await RegistroHistoriaClinica.create({
        id_admision,
        id_tipo: tipoIngreso.id_tipo,
        fecha_hora_reg: nuevaFechaIngreso,
        id_usuario: admision.id_usuario || null,
        detalle: 'Confirmación de reserva. Ingreso hospitalario.',
        estado: 1,
      }, { transaction: t });
    }

    await t.commit();
    res.json({ message: 'Reserva confirmada como ingreso' });

  } catch (error) {
    await t.rollback();
    console.error('Error al confirmar reserva:', error);
    res.status(500).json({ message: 'Error al confirmar reserva' });
  }
};

export const updateReserva = async (req, res) => {
  const { id_movimiento } = req.params;
  const { nueva_fecha_hora } = req.body;
  const t = await sequelize.transaction();

  try {
    const movimiento = await MovimientoHabitacion.findByPk(id_movimiento, {
      include: [
        {
          model: Admision,
          as: 'admision',
          include: [{ model: Paciente, as: 'paciente' }]
        },
        {
          model: Habitacion,
          as: 'habitacion',
          include: [{ model: Sector, as: 'sector' }]
        },
        { model: Cama, as: 'cama' }
      ],
      transaction: t
    });

    if (!movimiento) {
      await t.rollback();
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }

    if (movimiento.id_mov !== 3) {
      await t.rollback();
      return res.status(400).json({ message: 'Solo se pueden modificar reservas' });
    }

    const fechaReserva = new Date(nueva_fecha_hora);
    const ahora = new Date();
    if (isNaN(fechaReserva.getTime()) || fechaReserva < ahora) {
      await t.rollback();
      return res.status(400).json({ message: 'La nueva fecha debe ser futura' });
    }

    const paciente = movimiento.admision.paciente;
    const habitacion = movimiento.habitacion;
    const sector = habitacion?.sector?.nombre || '';
    const genero = paciente.id_genero;
    const edad = calcularEdad(paciente.fecha_nac);

    await verificarGeneroHabitacion(habitacion.id_habitacion, genero, t);

    const compatible = validarCompatibilidadPacienteSector(edad, genero, sector);
    if (!compatible) {
      await t.rollback();
      return res.status(409).json({
        message: `El paciente no cumple los requisitos del sector "${sector}".`
      });
    }

    movimiento.fecha_hora_ingreso = fechaReserva;
    await movimiento.save({ transaction: t });

    await t.commit();
    return res.json({ message: 'Reserva actualizada correctamente' });
  } catch (error) {
    console.error('❌ Error al actualizar reserva:', error);
    if (t) await t.rollback();
    res.status(500).json({ message: error.message || 'Error interno' });
  }
};

export const cancelarReserva = async (req, res) => {
  const { id_movimiento } = req.params;

  try {
    const movimiento = await MovimientoHabitacion.findByPk(id_movimiento, {
      include: [{ model: Admision, as: 'admision' }]
    });

    if (!movimiento) {
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }

    if (movimiento.id_mov !== 3) {
      return res.status(400).json({ message: 'Solo se pueden cancelar reservas' });
    }

    const idAdmision = movimiento.id_admision;

    // ✅ Liberar cama si corresponde
    if (movimiento.id_cama) {
      const cama = await Cama.findByPk(movimiento.id_cama);
      if (cama) {
        cama.estado = 0;
        await cama.save();
      }
    }

    await movimiento.destroy();

    const movimientosRestantes = await MovimientoHabitacion.count({
      where: { id_admision: idAdmision }
    });

    if (movimientosRestantes === 0) {
      await Admision.destroy({ where: { id_admision: idAdmision } });
    }

    res.json({ message: 'Reserva cancelada correctamente' });

  } catch (error) {
    console.error('❌ Error en cancelarReserva:', error);
    res.status(500).json({ message: 'Error al cancelar la reserva' });
  }
};

export const eliminarReservasVencidas = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); // hoy a las 00:00

    const reservasVencidas = await MovimientoHabitacion.findAll({
      where: {
        id_mov: 3, // tipo reserva
        fecha_hora_ingreso: {
          [Op.lt]: hoy
        }
      },
      transaction: t
    });

    for (const mov of reservasVencidas) {
      const idAdmision = mov.id_admision;

      // Eliminar el movimiento de reserva
      await mov.destroy({ transaction: t });

      // Verificar si hay otros movimientos ligados a la misma admisión
      const otrosMov = await MovimientoHabitacion.count({
        where: { id_admision: idAdmision },
        transaction: t
      });

      // Si no hay más movimientos, eliminar la admisión también
      if (otrosMov === 0) {
        await Admision.destroy({ where: { id_admision: idAdmision }, transaction: t });
      }
    }

    await t.commit();
    res.json({ message: `Reservas vencidas eliminadas: ${reservasVencidas.length}` });
  } catch (error) {
    if (t) await t.rollback();
    console.error('❌ Error eliminando reservas vencidas:', error);
    res.status(500).json({ message: 'Error al eliminar reservas vencidas' });
  }
};

