import { 
  Turno, 
  Agenda, 
  EstadoTurno, 
  Paciente, 
  ObraSocial,
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
        },
        { model: Paciente, as: 'cliente', 
          attributes: ['nombre_p', 'apellido_p', 'dni_paciente'] 
        }
      ]
    });

    const eventos = turnos.map(t => {
      const profesional = t.agenda?.personal;
      const paciente = t.paciente;
      const inicioUTC = new Date(t.fecha_hora).toISOString();
      const finUTC = calcularHoraFin(inicioUTC, t.agenda?.duracion || 30);

      return {
        title: `${profesional?.apellido}, ${profesional?.nombre} (${profesional?.especialidad?.nombre || ''})`,
        start: inicioUTC,
        end: finUTC,
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
    const usuario = req.session.usuario;
    const esMedico = usuario && usuario.rol === 4;

    const whereAgenda = {};

    if (esMedico) {
      const profesional = await PersonalSalud.findOne({
        where: { id_usuario: usuario.id }
      });

      if (!profesional) {
        return res.status(403).json({ message: 'Profesional no encontrado' });
      }

      whereAgenda.id_personal_salud = profesional.id_personal_salud;
    }

    const turnos = await Turno.findAll({
      include: [
        { model: EstadoTurno, as: 'estado_turno' },
        { model: MotivoIngreso, as: 'motivo_turno' },
        { model: ObraSocial, as: 'obra_social', attributes: ['nombre'] },
        {
          model: Agenda,
          as: 'agenda',
          where: whereAgenda,
          include: [
            {
              model: PersonalSalud,
              as: 'personal',
              include: [
                { model: Especialidad, as: 'especialidad' }
              ]
            }
          ]
        },
        { model: Paciente, as: 'cliente', 
          attributes: ['nombre_p', 'apellido_p', 'dni_paciente'] 
        }
      ]
    });

    const turnosConvertidos = turnos.map(t => {
      const json = t.toJSON();
      const fecha = new Date(json.fecha_hora); 

      json.fecha_turno = fecha.toLocaleDateString('sv-SE'); 
      json.hora_turno = fecha.toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });

      return json;
    });

    res.json(turnosConvertidos);
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

    const fechaHora = new Date(fecha_hora);
    if (isNaN(fechaHora.getTime()) || fechaHora < new Date()) {
      return res.status(400).json({ message: 'La fecha y hora del turno deben ser futuras' });
    }

    const agendaBase = await Agenda.findByPk(id_agenda);
    if (!agendaBase) return res.status(404).json({ message: 'Agenda no encontrada' });

    const jsToSqlDias = [7, 1, 2, 3, 4, 5, 6];
    const fechaLocal = new Date(fechaHora.getTime() - fechaHora.getTimezoneOffset() * 60000);
    const diaSemana = jsToSqlDias[fechaLocal.getDay()];

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
    const minutosTurno = fechaHora.getHours() * 60 + fechaHora.getMinutes();

    if (minutosTurno < minutosInicio || minutosTurno >= minutosFin) {
      return res.status(400).json({ message: 'La hora del turno está fuera del horario permitido ese día' });
    }

    const duracionNueva = agendaDia.duracion;
    const fechaInicio = new Date(fechaHora);
    const fechaFin = new Date(fechaInicio.getTime() + duracionNueva * 60000);

    const turnosExistentes = await Turno.findAll({
      where: {
        id_agenda: agendaDia.id_agenda
      },
      include: [{
        model: Agenda,
        as: 'agenda',
        attributes: ['duracion']
      }]
    });

    let seSolapa = false;
    for (const t of turnosExistentes) {
      if (!t.agenda || typeof t.agenda.duracion !== 'number') {
        console.warn(`⚠️ Turno ID ${t.id_turno} sin duración válida en agenda.`);
        continue;
      }

      const inicioExistente = new Date(t.fecha_hora);
      const finExistente = new Date(inicioExistente.getTime() + t.agenda.duracion * 60000);

     const haySolapamiento = fechaInicio < finExistente && fechaFin > inicioExistente;

      const contiguoPorInicio = fechaInicio.getTime() === finExistente.getTime();
      const contiguoPorFin = fechaFin.getTime() === inicioExistente.getTime();

      if (haySolapamiento && !contiguoPorInicio && !contiguoPorFin) {
        console.warn(`❌ Solapamiento detectado con turno ID ${t.id_turno}`);
        seSolapa = true;
        break;
      }
    }


    if (seSolapa) {
      return res.status(400).json({ message: 'Ya existe un turno que se superpone en ese horario' });
    }

    const nuevo = await Turno.create({
      id_paciente,
      id_agenda: agendaDia.id_agenda,
      fecha_hora: fechaHora,
      id_estado: id_estado || 1,
      id_motivo: id_motivo || 12
    });

    res.status(201).json(nuevo);
  } catch (error) {
    console.error('❌ Error en createTurno:', error);

    if (error?.original?.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Ya existe un turno en ese horario para esta agenda' });
    }

    res.status(500).json({ message: 'Error al crear turno' });
  }
};

export const getTurnoById = async (req, res) => {
  try {
    const turno = await Turno.findByPk(req.params.id, {
      include: [
        {
          model: Agenda,
          as: 'agenda',
          include: [{ model: PersonalSalud, as: 'personal' }]
        },
        { model: EstadoTurno, as: 'estado_turno' },
        { model: Paciente, as: 'cliente' },
        { model: MotivoIngreso, as: 'motivo_turno' }
      ]
    });

    if (!turno) return res.status(404).json({ message: 'No encontrado' });

    const json = turno.toJSON();

    if (json.fecha_hora) {
      const fecha = new Date(json.fecha_hora); 

      json.fecha_turno = fecha.toLocaleDateString('sv-SE'); 
      json.hora_turno = fecha.toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
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

    const nuevaFechaHora = new Date(fecha_hora);
    if (isNaN(nuevaFechaHora.getTime()) || nuevaFechaHora < new Date()) {
      return res.status(400).json({ message: 'La fecha y hora deben ser válidas y futuras' });
    }

    const agendaActual = await Agenda.findByPk(turno.id_agenda);
    if (!agendaActual) return res.status(404).json({ message: 'Agenda asociada no encontrada' });

    const jsToSqlDias = [7, 1, 2, 3, 4, 5, 6];
    const fechaLocal = new Date(nuevaFechaHora.getTime() - nuevaFechaHora.getTimezoneOffset() * 60000);
    const diaSemana = jsToSqlDias[fechaLocal.getDay()];

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
    const minutosTurno = nuevaFechaHora.getHours() * 60 + nuevaFechaHora.getMinutes();

    if (minutosTurno < minutosInicio || minutosTurno >= minutosFin) {
      return res.status(400).json({ message: 'La hora del turno está fuera del horario permitido ese día' });
    }

    const duracionNueva = agendaActiva.duracion;
    const fechaInicio = new Date(nuevaFechaHora);
    const fechaFin = new Date(fechaInicio.getTime() + duracionNueva * 60000);

    const turnosExistentes = await Turno.findAll({
      where: {
        id_agenda: agendaActiva.id_agenda,
        id_turno: { [Op.ne]: turno.id_turno }
      },
      include: [{
        model: Agenda,
        as: 'agenda',
        attributes: ['duracion']
      }]
    });

    let seSolapa = false;
    for (const t of turnosExistentes) {
      if (!t.agenda || typeof t.agenda.duracion !== 'number') {
        console.warn(`⚠️ Turno ID ${t.id_turno} sin duración válida en agenda.`);
        continue;
      }

      const inicioExistente = new Date(t.fecha_hora);
      const finExistente = new Date(inicioExistente.getTime() + t.agenda.duracion * 60000);

      if (fechaInicio < finExistente && fechaFin > inicioExistente) {
        console.warn(`❌ Solapamiento detectado con turno ID ${t.id_turno}`);
        seSolapa = true;
        break;
      }
    }

    if (seSolapa) {
      return res.status(400).json({ message: 'Ya existe un turno que se superpone en ese horario' });
    }

    await turno.update({
      fecha_hora: nuevaFechaHora,
      id_agenda: agendaActiva.id_agenda,
      id_estado,
      id_motivo
    });

    res.json(turno);
  } catch (error) {
    console.error('❌ Error en updateTurno:', error);

    if (error?.original?.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Ya existe un turno en ese horario para esta agenda' });
    }

    res.status(500).json({ message: 'Error al actualizar turno' });
  }
};

export const deleteTurno = async (req, res) => {
  try {
    const turno = await Turno.findByPk(req.params.id);
    if (!turno) return res.status(404).json({ message: 'Turno no encontrado' });

    await turno.destroy(); 
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ message: 'Error al cancelar turno' });
  }
};

export const vistaTurnos = (req, res) => {
  res.render('turno', {
    usuario: req.session.usuario,
    autenticado: true
  });
};
