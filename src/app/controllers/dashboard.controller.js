import { Admision, Paciente, MovimientoHabitacion, Cama, Habitacion, Sector } from '../models/index.js';
import { Op } from 'sequelize';
import { toUTC } from '../helpers/timezone.helper.js';

export const verificarPacienteConMovimientoActivo = async (req, res) => {
  const { id_paciente, fecha_hora_ingreso } = req.body;

  if (!id_paciente || !fecha_hora_ingreso) {
    return res.status(400).json({ message: 'Faltan datos requeridos' });
  }

  try {
    const fechaUTC = toUTC(fecha_hora_ingreso);

    const admisiones = await Admision.findAll({
      where: {
        id_paciente,
      },
      include: [{
        model: MovimientoHabitacion,
        as: 'movimientos_habitacion',
        where: {
          [Op.or]: [
            { fecha_hora_egreso: null },
            { fecha_hora_egreso: { [Op.gt]: fechaUTC } }
          ]
        },
        required: true
      }]
    });

    if (admisiones.length > 0) {
      return res.status(409).json({
        message: 'El paciente ya tiene una cama asignada para esa fecha o aún no fue dado de alta.'
      });
    }

    return res.json({ ok: true });

  } catch (error) {
    console.error('Error al verificar paciente con cama activa:', error);
    return res.status(500).json({ message: 'Error del servidor' });
  }
};

export const vistaDashboard = async (req, res) => {
  try {
    const camas = await Cama.findAll({
      include: [
        {
          model: Habitacion,
          as: 'habitacion',
          include: [{ model: Sector, as: 'sector' }]
        },
        {
          model: MovimientoHabitacion,
          as: 'movimientos',
          where: {
            fecha_hora_egreso: null,
            estado: 1
          },
          required: false,
          include: [
            {
              model: Admision,
              as: 'admision',
              include: [
                {
                  model: Paciente,
                  as: 'paciente'
                }
              ]
            }
          ]
        }
      ],
      order: [['id_cama', 'ASC']]
    });

    camas.forEach((cama) => {
      cama.descripcionHabitacion =
        cama.habitacion && cama.habitacion.sector
          ? `Habitación ${cama.habitacion.num} - ${cama.habitacion.sector.nombre}`
          : '-';

      cama.dataValues.desinfeccion = cama.desinfeccion;
    });

    res.render('dashboard', { camas });
  } catch (error) {
    console.error('Error al cargar el panel principal:', error);
    res.status(500).send('Error al cargar el panel principal');
  }
};

