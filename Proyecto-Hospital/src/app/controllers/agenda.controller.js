import { 
  Agenda, 
  Dia, 
  PersonalSalud, 
  Usuario, 
  Especialidad 
} from '../models/index.js';
import { Op } from 'sequelize';
import { validarHoraRango } from '../helper/timeZone.js';

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
      daysOfWeek: [a.id_dia === 7 ? 0 : a.id_dia],
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
    const usuario = req.session.usuario;

    const where = {};
    if (usuario.rol === 4 && usuario.id_personal_salud) {
      where.id_personal_salud = usuario.id_personal_salud;
    }

    const agendas = await Agenda.findAll({
      where,
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
          attributes: ['id_dia', 'nombre']
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
    const { id_personal_salud, id_dia, hora_inicio, hora_fin, duracion } = req.body;

    if (!id_personal_salud || !id_dia || !hora_inicio || !hora_fin || !duracion) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    if (!validarHoraRango(hora_inicio, hora_fin)) {
      return res.status(400).json({ message: 'Formato de hora inválido o la hora de fin es anterior a la de inicio' });
    }

    const existe = await Agenda.findOne({ where: { id_personal_salud, id_dia } });
    if (existe) {
      return res.status(409).json({ message: 'Ya existe una agenda para ese profesional ese día' });
    }

    const nueva = await Agenda.create({ id_personal_salud, id_dia, hora_inicio, hora_fin, duracion });
    res.status(201).json(nueva);
  } catch (error) {
    console.error('Error al crear agenda:', error);
    res.status(500).json({ message: 'Error interno al crear la agenda' });
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
    const { id } = req.params;
    const { id_personal_salud, id_dia, hora_inicio, hora_fin, duracion } = req.body;

    const agenda = await Agenda.findByPk(id);
    if (!agenda) {
      return res.status(404).json({ message: 'Agenda no encontrada' });
    }

    if (!id_personal_salud || !id_dia || !hora_inicio || !hora_fin || !duracion) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    if (!validarHoraRango(hora_inicio, hora_fin)) {
      return res.status(400).json({ message: 'Formato de hora inválido o la hora de fin es anterior a la de inicio' });
    }

    const existente = await Agenda.findOne({
      where: {
        id_personal_salud,
        id_dia,
        id_agenda: { [Op.ne]: id }
      }
    });

    if (existente) {
      return res.status(409).json({ message: 'Ese profesional ya tiene una agenda para ese día' });
    }

    await agenda.update({ id_personal_salud, id_dia, hora_inicio, hora_fin, duracion });
    res.json(agenda);
  } catch (error) {
    console.error('Error al actualizar agenda:', error);
    res.status(500).json({ message: 'Error interno al actualizar la agenda' });
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
    res.render('agenda', {
    usuario: req.session.usuario,
    autenticado: true
  });
};

export const getAgendasByProfesional = async (req, res) => {
  try {
    const { id } = req.params;
    const agendas = await Agenda.findAll({
      where: { id_personal_salud: id },
      include: [
        { model: Dia, as: 'dia', attributes: ['id_dia', 'nombre'] }
      ]
    });

    res.json(agendas);
  } catch (error) {
    console.error('Error al obtener agendas por profesional:', error);
    res.status(500).json({ message: 'Error al obtener agendas del profesional' });
  }
};
