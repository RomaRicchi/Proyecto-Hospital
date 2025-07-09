import {
  MovimientoHabitacion,
  Admision,
  Paciente,
  Cama,
  Habitacion,
  Sector
} from '../models/index.js';
import { toUTC } from '../helpers/timezone.helper.js';
import { Op } from 'sequelize';

export const vistaPanelSalud = async (req, res) => {
  try {
    const ahora = toUTC(new Date());
    const esEnfermero = req.session.usuario.rol === 3;

    const movimientos = await MovimientoHabitacion.findAll({
      where: {
        id_mov: 1,
        estado: 1,
        fecha_hora_ingreso: { [Op.lte]: ahora },
        [Op.or]: [
          { fecha_hora_egreso: null },
          { fecha_hora_egreso: { [Op.gte]: ahora } }
        ]
      },
      include: [
        {
          model: Admision,
          as: 'admision',
          ...(esEnfermero
            ? {}
            : { where: { id_usuario: req.session.usuario.id } }),
          include: [
            {
              model: Paciente,
              as: 'paciente'
            }
          ]
        },
        {
          model: Cama,
          as: 'cama',
          include: [
            {
              model: Habitacion,
              as: 'habitacion',
              include: [
                {
                  model: Sector,
                  as: 'sector'
                }
              ]
            }
          ]
        }
      ]
    });

    res.render('panelSalud', {
      usuario: req.session.usuario,
      movimientos
    });

  } catch (error) {
    console.error('❌ Error en vistaPanelSalud:', error);
    res.status(500).send('Error al cargar panel de salud');
  }
};
