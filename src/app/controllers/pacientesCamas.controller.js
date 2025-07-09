import {
  MovimientoHabitacion,
  Admision,
  Paciente,
  Genero,
  Cama,
  Habitacion,
  Sector,
} from '../models/index.js';
import { fromUTCToArgentina, toUTC } from '../helpers/timezone.helper.js';
import { Op } from 'sequelize';

export const vistaPacientesCamas = async (req, res) => {
  try {
    const ahoraUTC = toUTC(new Date());

    const movimientos = await MovimientoHabitacion.findAll({
      where: {
        id_mov: 1, // ingreso / ocupa
        estado: 1,
        fecha_hora_ingreso: { [Op.lte]: ahoraUTC },
        [Op.or]: [
          { fecha_hora_egreso: null },
          { fecha_hora_egreso: { [Op.gte]: ahoraUTC } },
        ],
      },
      include: [
        {
          model: Admision,
          as: 'admision',
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
      const paciente = mov.admision?.paciente;
      const cama = mov.cama;
      const habitacion = cama?.habitacion;
      const sector = habitacion?.sector;

      return {
        nombre: paciente?.nombre_p || '',
        apellido: paciente?.apellido_p || '',
        dni: paciente?.dni_paciente || '',
        genero: paciente?.genero?.nombre || '',
        cama_letra: cama?.nombre || '',
        cama_numero: habitacion?.num || '',
        cama_sector: sector?.nombre || '',
        fecha_ingreso: mov.fecha_hora_ingreso
          ? fromUTCToArgentina(mov.fecha_hora_ingreso).toLocaleDateString('es-AR')
          : '-',
        fecha_egreso: mov.fecha_hora_egreso
          ? fromUTCToArgentina(mov.fecha_hora_egreso).toLocaleDateString('es-AR')
          : '-',
      };
    });

    res.render('pacientesCamas', { pacientes_camas });
  } catch (error) {
    console.error('❌ Error en vistaPacientesCamas:', error);
    res.status(500).send('Error al cargar pacientes en cama.');
  }
};

export const obtenerCamaActual = async (id_admision) => {
  const ahoraUTC = toUTC(new Date());

  const mov = await MovimientoHabitacion.findOne({
    where: {
      id_mov: 1, // ingreso
      estado: 1,
      id_admision,
      fecha_hora_ingreso: { [Op.lte]: ahoraUTC },
      [Op.or]: [
        { fecha_hora_egreso: null },
        { fecha_hora_egreso: { [Op.gte]: ahoraUTC } },
      ],
    },
    include: [
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

  return mov?.cama || null;
};
