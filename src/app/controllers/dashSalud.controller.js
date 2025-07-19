import {
  MovimientoHabitacion,
  Admision,
  MotivoIngreso,
  Paciente,
  Cama,
  Habitacion,
  Sector
} from '../models/index.js';
import { Op } from 'sequelize';

export const vistaPanelSalud = async (req, res) => {
  try {
    const usuario = req.session.usuario;
    res.render('panelSalud', {
      usuario
    });
  } catch (error) {
    console.error('❌ Error en vistaPanelSalud:', error);
    res.status(500).send('Error al cargar el panel de salud');
  }
};

export const getPacientesAsignadosPorMedico = async (req, res) => {
  try {
    const usuario = req.session.usuario;
    if (!usuario || !usuario.id) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }
    const id_usuario = usuario.id;

    const ahora = new Date();

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
          where: { id_usuario },
          include: [
            { model: Paciente, as: 'paciente' },
            { model: MotivoIngreso, as: 'motivo_ingreso' }
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
                { model: Sector, as: 'sector' }
              ]
            }
          ]
        }
      ],
      order: [['fecha_hora_ingreso', 'DESC']]
    });

    const datos = movimientos.map(m => ({
      dni: m.admision.paciente.dni_paciente,
      nombre: `${m.admision.paciente.apellido_p}, ${m.admision.paciente.nombre_p}`,
      cama: m.cama
        ? `${m.cama.nombre} - Hab ${m.cama.habitacion?.num || '?'} / ${m.cama.habitacion?.sector?.nombre || '?'}`
        : '-',
      fecha_ingreso: m.fecha_hora_ingreso,
      motivo: m.admision.motivo_ingreso?.tipo || '-'
    }));

    res.json(datos);
  } catch (error) {
    console.error('❌ Error al obtener pacientes asignados:', error);
    res.status(500).json({ message: 'Error al obtener pacientes asignados' });
  }
};
