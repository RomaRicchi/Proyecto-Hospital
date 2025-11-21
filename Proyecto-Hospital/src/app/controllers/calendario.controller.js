import {
  Agenda,
  Turno,
  EstadoTurno,
  Dia,
  PersonalSalud,
  Paciente,
  Especialidad
} from '../models/index.js';
import { parseFechaUTC } from '../helper/timeZone.js';

export const vistaCalendario = async (req, res) => {
  res.render('calendario', {
    usuario: req.session.usuario,
    autenticado: true
  });
};

export const getCalendarioCompleto = async (req, res) => {
  try {
    const { profesionalId } = req.query;
    const usuario = req.session.usuario;

    let idProfesional = null;

    if (usuario.rol === 4) {
      const profesional = await PersonalSalud.findOne({ where: { id_usuario: usuario.id } });
      if (!profesional) return res.status(403).json({ message: 'Profesional no encontrado' });
      idProfesional = profesional.id_personal_salud;
    } else if (profesionalId && profesionalId !== 'null') {
      idProfesional = parseInt(profesionalId);
    }

    const agendaWhere = {};
    const turnoWhere = {};

    if (idProfesional) {
      agendaWhere.id_personal_salud = idProfesional;
      turnoWhere['$agenda.id_personal_salud$'] = idProfesional;
    }

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
      title: a.personal
        ? `${a.personal.apellido}, ${a.personal.nombre} (${a.personal.especialidad?.nombre || '-'})`
        : 'Agenda sin profesional',
      daysOfWeek: [(a.id_dia === 7 ? 0 : a.id_dia)],
      startTime: a.hora_inicio,
      endTime: a.hora_fin,
      display: 'background',
      color: '#d0e7ff'
    }));

    const turnos = await Turno.findAll({
      where: turnoWhere,
      include: [
        {
          model: Agenda,
          as: 'agenda',
          include: [{ model: PersonalSalud, as: 'personal', attributes: ['apellido', 'nombre'] }]
        },
        { model: Paciente, as: 'cliente', attributes: ['nombre_p', 'apellido_p'] },
        { model: EstadoTurno, as: 'estado_turno', attributes: ['nombre'] }
      ]
    });

    const eventosTurnos = turnos.map(t => {
      const duracion = t.agenda?.duracion || 30;
      const startUTC = parseFechaUTC(t.fecha_hora);
      const fin = new Date(startUTC.getTime() + duracion * 60000);

      return {
        id: t.id_turno,
        title: t.cliente
          ? `${t.cliente.apellido_p}, ${t.cliente.nombre_p}`
          : 'Paciente no asignado',
        start: startUTC.toISOString(),
        end: fin.toISOString(),
        extendedProps: {
          paciente: t.cliente
            ? `${t.cliente.apellido_p}, ${t.cliente.nombre_p}`
            : 'Sin asignar',
          estado: t.estado_turno?.nombre || '---',
          profesional: t.agenda?.personal
            ? `${t.agenda.personal.apellido}, ${t.agenda.personal.nombre}`
            : ''
        },
        color: '#ffe0b3'
      };
    });

    res.json([...eventosAgendas, ...eventosTurnos]);
  } catch (error) {
    console.error('❌ Error al cargar el calendario combinado:', error);
    res.status(500).json([]);
  }
};

