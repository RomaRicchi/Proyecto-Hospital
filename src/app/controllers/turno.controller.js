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
import { parseFechaUTC } from '../helper/timeZone.js';

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
    const { id_paciente, id_agenda, fecha_hora, id_estado, id_motivo } = req.body;

    if (!id_paciente || !id_agenda || !fecha_hora || !id_motivo) {
      return res.status(400).json({ message: 'Campos obligatorios faltantes' });
    }

    const fechaHora = parseFechaUTC(fecha_hora);
    if (isNaN(fechaHora.getTime()) || fechaHora < new Date()) {
      return res.status(400).json({ message: 'La fecha y hora del turno deben ser futuras' });
    }

    const agendaBase = await Agenda.findByPk(id_agenda);
    if (!agendaBase) return res.status(404).json({ message: 'Agenda no encontrada' });

    const jsToSqlDias = [7, 1, 2, 3, 4, 5, 6];
    const diaSemana = jsToSqlDias[fechaHora.getDay()];

    const agendaDia = await Agenda.findOne({
      where: {
        id_personal_salud: agendaBase.id_personal_salud,
        id_dia: diaSemana
      }
    });

    if (!agendaDia) {
      return res.status(400).json({ message: 'El profesional no tiene agenda ese día' });
    }

    const [hInicio, mInicio] = agendaDia.hora_inicio.split(':').map(Number);
    const [hFin, mFin] = agendaDia.hora_fin.split(':').map(Number);
    const minutosInicio = hInicio * 60 + mInicio;
    const minutosFin = hFin * 60 + mFin;
    const minutosTurno = fechaHora.getHours() * 60 + fechaHora.getMinutes(); // hora local


    if (minutosTurno < minutosInicio || minutosTurno >= minutosFin) {
      return res.status(400).json({ message: 'La hora del turno está fuera del horario permitido ese día' });
    }

    const existe = await Turno.findOne({
      where: {
        id_agenda: agendaDia.id_agenda,
        fecha_hora: fechaHora
      }
    });

    if (existe) {
      return res.status(400).json({ message: 'Ya existe un turno en esa fecha y hora' });
    }

    const nuevo = await Turno.create({
      id_paciente,
      id_agenda: agendaDia.id_agenda,
      fecha_hora: fechaHora,
      id_estado: id_estado || 1,
      id_motivo
    });

    res.status(201).json(nuevo);
  } catch (error) {
    console.error('❌ Error en createTurno:', error);
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

    const { fecha_hora, id_estado, id_motivo } = req.body;

    if (!fecha_hora || !id_estado || !id_motivo) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    const nuevaFechaHora = parseFechaUTC(fecha_hora);
    if (isNaN(nuevaFechaHora.getTime()) || nuevaFechaHora < new Date()) {
      return res.status(400).json({ message: 'La fecha y hora deben ser válidas y futuras' });
    }

    const agendaActual = await Agenda.findByPk(turno.id_agenda);
    if (!agendaActual) return res.status(404).json({ message: 'Agenda asociada no encontrada' });

    const jsToSqlDias = [7, 1, 2, 3, 4, 5, 6];
    const diaSemana = jsToSqlDias[nuevaFechaHora.getDay()];

    const agendaActiva = await Agenda.findOne({
      where: {
        id_personal_salud: agendaActual.id_personal_salud,
        id_dia: diaSemana
      }
    });

    if (!agendaActiva) {
      return res.status(400).json({ message: 'El profesional no tiene agenda activa para ese día' });
    }

    const [hInicio, mInicio] = agendaActiva.hora_inicio.split(':').map(Number);
    const [hFin, mFin] = agendaActiva.hora_fin.split(':').map(Number);
    const minutosInicio = hInicio * 60 + mInicio;
    const minutosFin = hFin * 60 + mFin;
    const minutosTurno = nuevaFechaHora.getHours() * 60 + nuevaFechaHora.getMinutes(); // hora local

    if (minutosTurno < minutosInicio || minutosTurno >= minutosFin) {
      return res.status(400).json({ message: 'La hora del turno está fuera del horario permitido ese día' });
    }

    const solapado = await Turno.findOne({
      where: {
        id_agenda: agendaActiva.id_agenda,
        fecha_hora: nuevaFechaHora,
        id_turno: { [Op.ne]: turno.id_turno }
      }
    });

    if (solapado) {
      return res.status(400).json({ message: 'Ya existe un turno en esa fecha y hora' });
    }

    await turno.update({
      fecha_hora: nuevaFechaHora,
      id_agenda: agendaActiva.id_agenda,
      id_estado,
      id_motivo
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
