import {
  MovimientoHabitacion,
  Admision,
  Paciente,
  Genero,
  Cama,
  Habitacion,
  Sector,
} from '../models/index.js';
import { Op } from 'sequelize';

export const vistaPacientesCamas = async (req, res) => {
  try {
    const ahora = new Date();

    const movimientos = await MovimientoHabitacion.findAll({
      where: {
        id_mov: 1,
        estado: 1,
        fecha_hora_ingreso: { [Op.lte]: ahora },
        [Op.or]: [
          { fecha_hora_egreso: null },
          { fecha_hora_egreso: { [Op.gte]: ahora } },
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
          ? new Date(mov.fecha_hora_ingreso).toLocaleDateString('es-AR')
          : '-',
        fecha_egreso: mov.fecha_hora_egreso
          ? new Date(mov.fecha_hora_egreso).toLocaleDateString('es-AR')
          : '-',
      };
    });

    res.render('pacientesCamas', { 
      pacientes_camas , 
      usuario: req.session.usuario,
      autenticado: true
    });
  } catch (error) {
    res.status(500).send('Error al cargar pacientes en cama.');
  }
};

export const obtenerCamaActual = async (id_admision) => {
  const ahora = new Date();

  const mov = await MovimientoHabitacion.findOne({
    where: {
      id_mov: 1, // ingreso
      estado: 1,
      id_admision,
      fecha_hora_ingreso: { [Op.lte]: ahora },
      [Op.or]: [
        { fecha_hora_egreso: null },
        { fecha_hora_egreso: { [Op.gte]: ahora } },
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

