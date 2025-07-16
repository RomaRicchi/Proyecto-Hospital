import { 
  Turno, 
  Agenda, 
  EstadoTurno, 
  Paciente, 
  PersonalSalud, 
  Usuario, 
  Especialidad,
  MotivoIngreso
} from '../models/index.js';
import { Op } from 'sequelize';

function calcularHoraFin(fechaHoraInicio, duracionMinutos) {
  const inicio = new Date(fechaHoraInicio);
  if (isNaN(inicio.getTime())) return null;

  const fin = new Date(inicio.getTime() + duracionMinutos * 60000);
  return fin.toISOString();
}

export const getTurnos = async (req, res) => {
  try {
    const { profesionalId } = req.query;

    const whereAgenda = {};
    if (profesionalId) {
      whereAgenda.id_personal_salud = profesionalId;
    }

    const turnos = await Turno.findAll({
      include: [
        { model: Paciente, as: 'cliente' },
        { model: EstadoTurno, as: 'estado_turno' },
        { model: MotivoIngreso, as: 'motivo_turno' },
        {
          model: Agenda,
          as: 'agenda',
          where: whereAgenda,
          include: [{
            model: PersonalSalud,
            as: 'personal',
            include: [
              { model: Usuario, as: 'usuario' },
              { model: Especialidad, as: 'especialidad' }
            ]
          }]
        }
      ]
    });

    const eventos = turnos.map(t => {
      const profesional = t.agenda?.personal;
      const paciente = t.paciente;
      return {
        title: `${profesional?.apellido}, ${profesional?.nombre} (${profesional?.especialidad?.nombre || ''})`,
        start: t.fecha_hora,
        end: calcularHoraFin(t.fecha_hora, t.agenda?.duracion || 30),
        extendedProps: {
          paciente: `${paciente?.apellido_p || ''}, ${paciente?.nombre_p || ''}`,
          estado: t.estado_turno?.nombre
        }
      };
    });

    res.json(eventos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al cargar turnos para calendario' });
  }
};

export const getTurnosListado = async (req, res) => {
  try {
    const turnos = await Turno.findAll({
      include: [
        { model: Paciente, as: 'cliente' },
        { model: EstadoTurno, as: 'estado_turno' },
        { model: MotivoIngreso, as: 'motivo_turno' },
        {
          model: Agenda,
          as: 'agenda',
          include: [
            {
              model: PersonalSalud,
              as: 'personal',
              include: [
                { model: Especialidad, as: 'especialidad' }
              ]
            }
          ]
        }
      ]
    });

    res.json(turnos);
  } catch (error) {
    console.error('Error al obtener turnos para listado:', error);
    res.status(500).json({ message: 'Error al cargar turnos' });
  }
};

export const createTurno = async (req, res) => {
  try {
    const { id_paciente, id_agenda, fecha_turno, hora_turno, id_estado, id_motivo } = req.body;

    if (!id_paciente || !id_agenda || !fecha_turno || !hora_turno || !id_motivo) {
      return res.status(400).json({ message: 'Campos obligatorios faltantes' });
    }

    const fechaHora = new Date(`${fecha_turno}T${hora_turno}`);
    if (isNaN(fechaHora.getTime()) || fechaHora < new Date()) {
      return res.status(400).json({ message: 'La fecha y hora del turno deben ser futuras' });
    }

    // Buscar agenda base
    const agendaBase = await Agenda.findByPk(id_agenda);
    if (!agendaBase) return res.status(404).json({ message: 'Agenda no encontrada' });

    const diaSemana = fechaHora.getDay(); // 0 = domingo

    // Verificar que haya agenda activa para ese día del profesional
    const agendaDia = await Agenda.findOne({
      where: {
        id_personal_salud: agendaBase.id_personal_salud,
        id_dia: diaSemana
      }
    });

    if (!agendaDia) {
      return res.status(400).json({ message: 'El profesional no tiene agenda ese día' });
    }

    // Validar rango horario
    const [hInicio, mInicio] = agendaDia.hora_inicio.split(':').map(Number);
    const [hFin, mFin] = agendaDia.hora_fin.split(':').map(Number);
    const minutosInicio = hInicio * 60 + mInicio;
    const minutosFin = hFin * 60 + mFin;

    const horaTurno = fechaHora.getHours();
    const minutoTurno = fechaHora.getMinutes();
    const minutosTurno = horaTurno * 60 + minutoTurno;

    if (minutosTurno < minutosInicio || minutosTurno >= minutosFin) {
      return res.status(400).json({ message: 'La hora del turno está fuera del horario permitido ese día' });
    }

    // Verificar solapamiento con otro turno
    const existe = await Turno.findOne({
      where: {
        id_agenda: agendaDia.id_agenda,
        fecha_hora: fechaHora
      }
    });

    if (existe) {
      return res.status(400).json({ message: 'Ya existe un turno en esa fecha y hora' });
    }

    // Crear el turno con la agenda correcta (del día válido)
    const nuevo = await Turno.create({
      id_paciente,
      id_agenda: agendaDia.id_agenda,
      fecha_hora: fechaHora,
      id_estado: id_estado || 1,
      id_motivo
    });

    res.status(201).json(nuevo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear turno' });
  }
};

export const getTurnoById = async (req, res) => {
  try {
    const turno = await Turno.findByPk(req.params.id, {
      include: [
        { model: Agenda, as: 'agenda', include: [{ model: PersonalSalud, as: 'personal' }] },
        { model: EstadoTurno, as: 'estado_turno' },
        { model: Paciente, as: 'cliente' },
        { model: MotivoIngreso, as: 'motivo_turno' }
      ]
    });

    if (!turno) return res.status(404).json({ message: 'No encontrado' });

    const json = turno.toJSON();

    // Agregamos fecha_turno y hora_turno desde fecha_hora
    if (json.fecha_hora) {
      const iso = new Date(json.fecha_hora).toISOString();
      json.fecha_turno = iso.split('T')[0];
      json.hora_turno = iso.split('T')[1].slice(0, 5); // HH:MM
    }

    res.json(json);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al buscar turno' });
  }
};

export const updateTurno = async (req, res) => {
  try {
    const turno = await Turno.findByPk(req.params.id);
    if (!turno) return res.status(404).json({ message: 'Turno no encontrado' });

    const nuevaFechaHora = new Date(req.body.fecha_hora);
    if (isNaN(nuevaFechaHora.getTime()) || nuevaFechaHora < new Date()) {
      return res.status(400).json({ message: 'La fecha y hora deben ser válidas y futuras' });
    }

    const agenda = await Agenda.findByPk(turno.id_agenda);
    if (!agenda) return res.status(404).json({ message: 'Agenda asociada no encontrada' });

    // 🗓️ Validar día de semana (agenda activa)
    const diaSemana = nuevaFechaHora.getDay(); // 0=Domingo ... 6=Sábado
    const agendaActiva = await Agenda.findOne({
      where: {
        id_personal_salud: agenda.id_personal_salud,
        id_dia: diaSemana
      }
    });

    if (!agendaActiva) {
      return res.status(400).json({
        message: 'El profesional no tiene agenda activa para ese día'
      });
    }

    // 🕑 Validar hora dentro del rango de la agenda activa
    const [hInicio, mInicio] = agendaActiva.hora_inicio.split(':').map(Number);
    const [hFin, mFin] = agendaActiva.hora_fin.split(':').map(Number);
    const minutosInicio = hInicio * 60 + mInicio;
    const minutosFin = hFin * 60 + mFin;

    const horaTurno = nuevaFechaHora.getHours();
    const minutoTurno = nuevaFechaHora.getMinutes();
    const minutosTurno = horaTurno * 60 + minutoTurno;

    if (minutosTurno < minutosInicio || minutosTurno >= minutosFin) {
      return res.status(400).json({
        message: 'La hora del turno está fuera del horario permitido ese día'
      });
    }

    // ⛔ Evitar solapamiento con otros turnos en la misma agenda
    const existe = await Turno.findOne({
      where: {
        id_agenda: agendaActiva.id_agenda,
        fecha_hora: nuevaFechaHora,
        id_turno: { [Op.ne]: turno.id_turno }
      }
    });

    if (existe) {
      return res.status(400).json({
        message: 'Ya existe un turno en esa fecha y hora'
      });
    }

    // ✅ Actualizar turno con agenda nueva si cambió de día
    await turno.update({
      fecha_hora: nuevaFechaHora,
      id_agenda: agendaActiva.id_agenda
    });

    res.json(turno);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar turno' });
  }
};

export const deleteTurno = async (req, res) => {
  try {
    const turno = await Turno.findByPk(req.params.id);
    if (!turno) return res.status(404).json({ message: 'Turno no encontrado' });

    await turno.destroy(); // o marcarlo como cancelado si preferís
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ message: 'Error al cancelar turno' });
  }
};

export const vistaTurnos = (req, res) => {
  res.render('turno');
};
