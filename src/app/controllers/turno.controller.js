import { 
  Turno, 
  Agenda, 
  EstadoTurno, 
  Paciente, 
  PersonalSalud, 
  Usuario, 
  Especialidad 
} from '../models/index.js';

import { Op } from 'sequelize';

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

export const createTurno = async (req, res) => {
  try {
    const { id_paciente, id_agenda, fecha_hora, id_motivo } = req.body;

    // Buscar agenda
    const agenda = await Agenda.findByPk(id_agenda);
    if (!agenda) return res.status(400).json({ message: 'Agenda no encontrada' });

    // Comparar día
    const diaTurno = new Date(fecha_hora).getDay(); // 0 (domingo) - 6 (sábado)
    const diaTransformado = diaTurno === 0 ? 7 : diaTurno; // convertimos domingo 0 → 7
    if (agenda.id_dia !== diaTransformado) {
      return res.status(400).json({ message: 'La fecha no coincide con el día de la agenda' });
    }

    // Comparar hora
    const hora = fecha_hora.split('T')[1].slice(0, 5); // HH:mm
    if (hora < agenda.hora_inicio || hora >= agenda.hora_fin) {
      return res.status(400).json({ message: 'La hora no está dentro del rango de la agenda' });
    }

    // Calcular fin del turno
    const fechaInicio = new Date(fecha_hora);
    const fechaFin = new Date(fechaInicio.getTime() + agenda.duracion * 60000);

    // Verificar solapamiento con otros turnos de la misma agenda
    const solapado = await Turno.findOne({
      where: {
        id_agenda,
        fecha_hora: {
          [Op.lt]: fechaFin.toISOString(), // inicio de otro turno < fin nuevo
        },
      },
    });

    if (solapado) {
      return res.status(400).json({ message: 'Ya hay un turno asignado en ese horario' });
    }

    // Verificar que el paciente no tenga otro turno en ese momento
    const turnoDuplicado = await Turno.findOne({
      where: {
        id_paciente,
        fecha_hora: {
          [Op.gte]: fechaInicio.toISOString(),
          [Op.lt]: fechaFin.toISOString()
        },
      }
    });

    if (turnoDuplicado) {
      return res.status(400).json({ message: 'El paciente ya tiene un turno en ese horario' });
    }

    // Estado por defecto: PENDIENTE (id_estado = 1) → cambiá el ID si usás otro
    const nuevo = await Turno.create({
      id_paciente,
      id_agenda,
      fecha_hora,
      id_estado: 1,
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
        { model: Agenda, as: 'agenda' },
        { model: EstadoTurno, as: 'estado' },
        { model: Paciente, as: 'cliente' }
      ]
    });
    if (!turno) return res.status(404).json({ message: 'No encontrado' });
    res.json(turno);
  } catch (error) {
    res.status(500).json({ message: 'Error al buscar turno' });
  }
};

export const updateTurno = async (req, res) => {
  try {
    const turno = await Turno.findByPk(req.params.id);
    if (!turno) return res.status(404).json({ message: 'Turno no encontrado' });

    await turno.update({ fecha_hora: req.body.fecha_hora });
    res.json(turno);
  } catch (error) {
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
