import { Admision, Paciente, Genero, MovimientoHabitacion, Cama, Habitacion, Sector } from '../models/index.js';
import { Op } from 'sequelize';

export const verificarPacienteConMovimientoActivo = async (req, res) => {
  const { id_paciente, fecha_hora_ingreso } = req.body;

  if (!id_paciente || !fecha_hora_ingreso) {
    return res.status(400).json({ message: 'Faltan datos requeridos' });
  }

  try {
    const fecha = new Date(fecha_hora_ingreso);
    if (isNaN(fecha.getTime())) {
      return res.status(400).json({ message: 'Fecha inválida' });
    }

    const admisiones = await Admision.findAll({
      where: { id_paciente },
      include: [{
        model: MovimientoHabitacion,
        as: 'movimientos_habitacion',
        where: {
          [Op.or]: [
            { fecha_hora_egreso: null },
            { fecha_hora_egreso: { [Op.gt]: fecha } }
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
    console.error('❌ Error en verificarPacienteConMovimientoActivo:', error);
    return res.status(500).json({ message: 'Error del servidor' });
  }
};

export const vistaDashboard = async (req, res) => {
  try {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); 

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
            [Op.or]: [
              {
                id_mov: 1, // internación activa
                estado: 1,
                fecha_hora_egreso: null
              },
              {
                id_mov: 3, // reserva vigente 
                fecha_hora_ingreso: { [Op.lte]: hoy },
                fecha_hora_egreso: {
                  [Op.and]: [
                    { [Op.not]: null },
                    { [Op.gt]: hoy } 
                  ]
                }
              }
            ]
          },
          required: false,
          include: [
            {
              model: Admision,
              as: 'admision',
              required: true,
              include: [
                {
                  model: Paciente,
                  as: 'paciente_admision',
                  required: true,
                  include: [
                    {
                      model: Genero,
                      as: 'genero'
                    }
                  ]
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

    res.render('dashboard', {
      camas,
      usuario: req.session.usuario,
      autenticado: true
    });
  } catch (error) {
    console.error('❌ Error en vistaDashboard:', error);
    res.status(500).send('Error al cargar el panel principal');
  }
};
