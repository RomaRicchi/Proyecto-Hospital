import {
  MovimientoHabitacion,
  Cama,
  Admision,
  Paciente,
  MotivoIngreso
} from '../models/index.js';
import { Op } from 'sequelize';

// ✅ Mostrar vista con camas reservadas
export const vistaReservarCama = async (req, res) => {
  try {
    const camas = await Cama.findAll({
      include: [
        {
          model: MovimientoHabitacion,
          as: 'movimientos',
          where: {
            id_mov: 3,
            fecha_hora_ingreso: { [Op.gt]: new Date() },
            estado: 1
          },
          required: false,
          include: [
            {
              model: Admision,
              as: 'admision',
              include: [
                { model: Paciente, as: 'paciente' },
                { model: MotivoIngreso, as: 'motivo_ingreso' }
              ]
            }
          ]
        }
      ],
      order: [['id_cama', 'ASC']]
    });

    res.render('reservaCama', { camas });
  } catch (error) {
    console.error('Error al mostrar camas reservadas:', error);
    res.status(500).send('Error al cargar reservas');
  }
};

// ✅ Confirmar reserva → convertir a ingreso activo
export const confirmarReserva = async (req, res) => {
  const { id_paciente, fecha_actual } = req.body;

  if (!id_paciente || !fecha_actual) {
    return res.status(400).json({ message: 'Faltan datos requeridos' });
  }

  try {
    const movimiento = await MovimientoHabitacion.findOne({
      where: {
        id_mov: 3,
        estado: 1,
        fecha_hora_ingreso: new Date(fecha_actual)
      },
      include: [{
        model: Admision,
        as: 'admision',
        where: { id_paciente }
      }]
    });

    if (!movimiento) {
      return res.status(404).json({ message: 'No se encontró una reserva activa para este paciente' });
    }

    movimiento.id_mov = 1; // Cambiar a ingreso
    movimiento.fecha_hora_ingreso = fecha_actual;
    await movimiento.save();

    const cama = await Cama.findByPk(movimiento.id_cama);
    if (cama) {
      cama.estado = 1;
      await cama.save();
    }

    res.json({ message: 'Reserva confirmada exitosamente' });
  } catch (error) {
    console.error('Error al confirmar reserva:', error);
    res.status(500).json({ message: 'Error al confirmar la reserva' });
  }
};

// ✅ Cancelar reserva si el paciente no se presenta
export const cancelarReserva = async (req, res) => {
  const { id } = req.params;

  try {
    const movimiento = await MovimientoHabitacion.findByPk(id, {
      include: [Admision]
    });

    if (!movimiento) {
      return res.status(404).send('Reserva no encontrada');
    }

    if (movimiento.id_mov !== 3) {
      return res.status(400).send('Solo se pueden cancelar reservas');
    }

    // Guardar el id_admision antes de eliminar
    const idAdmision = movimiento.id_admision;

    // Eliminar el movimiento
    await movimiento.destroy();

    // Verificar si la admisión ya no tiene más movimientos
    const movimientosRestantes = await MovimientoHabitacion.findAll({
      where: { id_admision: idAdmision },
    });

    if (movimientosRestantes.length === 0) {
      await Admision.destroy({ where: { id_admision: idAdmision } });
    }

    res.redirect('reserva-cama');
  } catch (error) {
    console.error('Error al cancelar reserva:', error);
    res.status(500).send('Error al cancelar la reserva');
  }
};
