import { Agenda, Turno, Dia, PersonalSalud, Usuario, Paciente, Especialidad } from '../models/index.js';
import { Op } from 'sequelize';

export const getCalendarioCompleto = async (req, res) => {
  try {
    const { profesionalId } = req.query;

    // 1. Agendas
    const agendaWhere = profesionalId ? { id_personal_salud: profesionalId } : {};

    const agendas = await Agenda.findAll({
      where: agendaWhere,
      include: [
        { model: Dia, as: 'dia' },
        {
          model: PersonalSalud,
          as: 'personal',
          include: [{ model: Especialidad, as: 'especialidad', attributes: ['nombre'] }]
        }
      ]
    });

    const eventosAgendas = agendas.map(a => ({
      title: `${a.personal.apellido}, ${a.personal.nombre} (${a.personal.especialidad?.nombre || ''})`,
      daysOfWeek: [a.id_dia % 7],
      startTime: a.hora_inicio,
      endTime: a.hora_fin,
      display: 'background',
      color: '#d0e7ff'
    }));

    // 2. Turnos
    const turnoWhere = profesionalId
      ? { '$agenda.id_personal_salud$': profesionalId }
      : {};

    const turnos = await Turno.findAll({
      where: turnoWhere,
      include: [
        {
          model: Agenda,
          as: 'agenda',
          attributes: [],
        },
        {
          model: Paciente,
          as: 'cliente',
          attributes: ['nombre_p', 'apellido_p']
        }
      ]
    });

    const eventosTurnos = turnos.map(t => {
      const fin = new Date(new Date(t.fecha_hora).getTime() + t.duracion * 60000);
      return {
        title: `${t.cliente?.apellido_p || ''}, ${t.cliente?.nombre_p || ''}`,
        start: t.fecha_hora,
        end: fin.toISOString(),
        color: '#ffe0b3',
      };
    });

    res.json([...eventosAgendas, ...eventosTurnos]);
  } catch (error) {
    console.error('Error al cargar el calendario combinado:', error);
    res.status(500).json({ message: 'Error al cargar el calendario combinado' });
  }
};

export const buscarPersonal = async (req, res) => {
  try {
    const q = req.query.q?.toLowerCase() || '';

    const personal = await PersonalSalud.findAll({
      where: {
        activo: true,
        [Op.or]: [
          { nombre: { [Op.like]: `%${q}%` } },
          { apellido: { [Op.like]: `%${q}%` } }
        ]
      },
      include: [
        {
          model: Especialidad,
          as: 'especialidad',
          attributes: ['nombre'],
          where: q ? { nombre: { [Op.like]: `%${q}%` } } : {},
          required: false
        }
      ],
      attributes: ['id_personal_salud', 'nombre', 'apellido'],
      limit: 10
    });

    const resultados = personal.map(p => ({
      id: p.id_personal_salud,
      text: `${p.apellido}, ${p.nombre} (${p.especialidad?.nombre || 'Sin especialidad'})`
    }));

    res.json(resultados);
  } catch (error) {
    console.error('Error al buscar personal de salud:', error);
    res.status(500).json({ message: 'Error al buscar profesionales' });
  }
};

export const getAgendasRecurrentes = async (req, res) => {
  try {
    const agendas = await Agenda.findAll({
      include: [
        {
          model: PersonalSalud,
          as: 'personal',
          include: [{ model: Especialidad, as: 'especialidad', attributes: ['nombre'] }]
        },
        {
          model: Dia,
          as: 'dia',
          attributes: ['id_dia', 'nombre']
        }
      ]
    });

    const eventos = agendas.map(a => ({
      title: `${a.personal.apellido}, ${a.personal.nombre} - ${a.personal.especialidad?.nombre || ''}`,
      daysOfWeek: [a.id_dia % 7], // FullCalendar: 0=domingo
      startTime: a.hora_inicio,
      endTime: a.hora_fin
    }));

    res.json(eventos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener agendas semanales' });
  }
};

export const getAgendas = async (req, res) => {
  try {
    const agendas = await Agenda.findAll({
      include: [
        {
          model: PersonalSalud,
          as: 'personal',
          attributes: ['id_personal_salud', 'nombre', 'apellido'],
          include: [
            {
              model: Usuario,
              as: 'datos_usuario',
              attributes: ['username']
            },
            {
              model: Especialidad,
              as: 'especialidad',
              attributes: ['nombre']
            }
          ]
        },
        {
          model: Dia,
          as: 'dia',
          attributes: ['nombre']
        }
      ]
    });

    res.json(agendas); 
  } catch (error) {
    console.error('Error en getAgendas:', error);
    res.status(500).json({ message: 'Error al obtener agendas' });
  }
};

export const createAgenda = async (req, res) => {
  try {
    const nueva = await Agenda.create(req.body);
    const completa = await Agenda.findByPk(nueva.id_agenda, {
      include: [
        {
          model: PersonalSalud,
          as: 'personal',
          attributes: ['id_personal_salud', 'nombre', 'apellido'],
          include: [
            { model: Usuario, as: 'datos_usuario', attributes: ['username'] },
            { model: Especialidad, as: 'especialidad', attributes: ['nombre'] }
          ]
        },
        {
          model: Dia,
          as: 'dia',
          attributes: ['nombre']
        }
      ]
    });
    res.status(201).json(completa);
  } catch (error) {
    console.error('Error al crear agenda:', error);
    res.status(500).json({ message: 'Error al crear agenda' });
  }
};

export const getAgendaById = async (req, res) => {
  try {
    const agenda = await Agenda.findByPk(req.params.id, {
    include: [
      {
        model: PersonalSalud,
        as: 'personal',
        attributes: ['id_personal_salud', 'nombre', 'apellido'],
        include: [
          { model: Usuario, as: 'usuario', attributes: ['username'] },
          { model: Especialidad, as: 'especialidad', attributes: ['nombre'] }
        ]
      },
      { model: Dia, as: 'dia', attributes: ['nombre'] }
    ]
  });
    if (!agenda) return res.status(404).json({ message: 'No encontrada' });
    res.json(agenda);
  } catch (error) {
    res.status(500).json({ message: 'Error al buscar agenda' });
  }
};

export const updateAgenda = async (req, res) => {
  try {
    const agenda = await Agenda.findByPk(req.params.id);
    if (!agenda) return res.status(404).json({ message: 'No encontrada' });
    await agenda.update(req.body);
    res.json(agenda);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar agenda' });
  }
};

export const deleteAgenda = async (req, res) => {
  try {
    const agenda = await Agenda.findByPk(req.params.id);
    if (!agenda) return res.status(404).json({ message: 'No encontrada' });
    await agenda.destroy();
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar agenda' });
  }
};

export const vistaAgendas = async (req, res) => {
  res.render('agenda');
};
