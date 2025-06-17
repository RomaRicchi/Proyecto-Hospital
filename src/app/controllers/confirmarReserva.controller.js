import {
  MovimientoHabitacion,
  Cama,
  Habitacion,
  Sector,
  Admision,
  Paciente,
} from '../models/index.js';
import { Op } from 'sequelize';

// 🔸 Vista de camas con posibilidad de reservar
export const vistaReservarCama = async (req, res) => {
  try {
    const camas = await Cama.findAll({
      include: [
        {
          model: Habitacion,
          as: 'habitacion',
          include: [{ model: Sector, as: 'sector' }],
        },
        {
          model: MovimientoHabitacion,
          as: 'movimientos',
          required: false,
          where: {
            id_mov: 3, // Reserva
            fecha_hora_ingreso: { [Op.gt]: new Date() }, // Futuras
          },
          limit: 1,
          order: [['fecha_hora_ingreso', 'ASC']],
        },
      ],
    });

    // Marcar camas con reserva futura como "reservadas"
    const camasConEstado = camas.map((c) => {
      let estado = c.estado;
      if (c.movimientos?.length > 0) {
        estado = 2; // Reservada
      }
      return {
        ...c.toJSON(),
        estado,
      };
    });

    res.render('reservaCama', { camas: camasConEstado });
  } catch (error) {
    console.error('Error al cargar camas:', error);
    res.status(500).send('Error al cargar camas para reserva');
  }
};

// 🔸 Confirmar que el paciente llegó en la fecha de reserva
export const confirmarReserva = async (req, res) => {
  const { id_paciente, fecha_actual } = req.body;

  if (!id_paciente || !fecha_actual) {
    return res.status(400).json({ message: 'Faltan datos requeridos' });
  }

  try {
    const reserva = await MovimientoHabitacion.findOne({
      where: {
        id_mov: 3, // RESERVA
        estado: 1,
        fecha_hora_ingreso: {
          [Op.lte]: new Date(fecha_actual),
        },
        fecha_hora_egreso: {
          [Op.or]: [{ [Op.gte]: new Date(fecha_actual) }, { [Op.is]: null }],
        },
      },
      include: [
        {
          model: Admision,
          as: 'admision',
          where: { id_paciente },
          include: [{ model: Paciente, as: 'paciente' }],
        },
        { model: Cama, as: 'cama' },
      ],
    });

    if (!reserva) {
      return res.status(404).json({
        message: 'No se encontró una reserva activa para este paciente en la fecha actual',
      });
    }

    // 1. Cambiar tipo de movimiento a INGRESA/OCUPA
    reserva.id_mov = 1;
    reserva.fecha_hora_ingreso = new Date(fecha_actual);
    await reserva.save();

    // 2. Actualizar estado de la cama
    const cama = await Cama.findByPk(reserva.id_cama);
    if (cama) {
      cama.estado = 1;
      await cama.save();
    }

    return res.json({
      success: true,
      message: 'Reserva confirmada y paciente ingresado correctamente',
      cama: cama?.numero || reserva.id_cama,
    });
  } catch (error) {
    console.error('Error al confirmar reserva:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};
