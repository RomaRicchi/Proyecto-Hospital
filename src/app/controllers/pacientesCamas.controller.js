  import {
  MovimientoHabitacion,
  Admision,
  Paciente,
  Genero,
  Cama,
  Habitacion,
  Sector,
} from '../models/index.js';
import { fromUTCToArgentina } from '../helpers/timezone.helper.js';

export const vistaPacientesCamas = async (req, res) => {
  try {
    const movimientos = await MovimientoHabitacion.findAll({
      where: {
        id_mov: 1,               // ingreso/ocupa
        estado: 1,               // activo
      },
      include: [
        {
          model: Admision,
          as: 'admision_relacionada',
          include: [
            {
              model: Paciente,
              as: 'paciente',
              include: [{ model: Genero, as: 'genero' }],
            },
          ],
        },
        {
          model: Cama,
          as: 'cama',
          include: [
            {
              model: Habitacion,
              as: 'habitacion',
              include: [{ model: Sector, as: 'sector' }],
            },
          ],
        },
      ],
    });

    const pacientes_camas = movimientos.map((mov) => {
      const paciente   = mov.admision_relacionada?.paciente;
      const cama       = mov.cama;
      const habitacion = cama?.habitacion;
      const sector     = habitacion?.sector;

      return {
        nombre:        paciente?.nombre_p || '',
        apellido:      paciente?.apellido_p || '',
        dni:           paciente?.dni_paciente || '',
        genero:        paciente?.genero?.nombre || '',
        cama_letra:    cama?.nombre || '',
        cama_numero:   habitacion?.num || '',
        cama_sector:   sector?.nombre || '',
        fecha_ingreso: mov.fecha_hora_ingreso
          ? fromUTCToArgentina(mov.fecha_hora_ingreso).toLocaleDateString('es-AR')
          : null,
        fecha_egreso: mov.fecha_hora_egreso
          ? fromUTCToArgentina(mov.fecha_hora_egreso).toLocaleDateString('es-AR')
          : null,
      };
    });

    res.render('pacientesCamas', { pacientes_camas });
  } catch (error) {
    console.error('Error en vistaPacientesCamas:', error);
    res.status(500).send('Error al cargar la información de camas asignadas.');
  }
};
