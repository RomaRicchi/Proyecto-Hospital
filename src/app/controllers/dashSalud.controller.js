import {
  MovimientoHabitacion,
  Admision,
  Paciente,
  Cama,
  Habitacion,
  Sector
} from '../models/index.js';

export const vistaPanelSalud = async (req, res) => {
  try {
    const movimientos = await MovimientoHabitacion.findAll({
      where: { id_mov: 1, estado: 1 },
      include: [
        {
          model: Admision,
          as: 'admision',
          include: [
            {
              model: Paciente,
              as: 'paciente_admision'
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
              include: [{ model: Sector, as: 'sector' }]
            }
          ]
        }
      ]
    });

    const pacientes = movimientos.map(m => {
      const p = m.admision.paciente_admision;
      return {
        dni_paciente: p.dni_paciente,
        nombre_p: p.nombre_p,
        apellido_p: p.apellido_p,
        cama: m.cama?.nro_cama || '—',
        fecha_ingreso: m.fecha_mov || '—'
      };
    });

    res.render('panelSalud', {
      usuario: req.session.usuario,
      pacientes
    });
  } catch (err) {
    console.error('Error en vistaPanelSalud:', err);
    res.status(500).send('Error interno');
  }
};
