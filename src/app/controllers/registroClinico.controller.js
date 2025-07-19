import { 
  RegistroHistoriaClinica, 
  Admision, 
  Paciente, 
  Familiar,
  Parentesco,
  TipoRegistro,
  Usuario, 
  PersonalSalud,
  MovimientoHabitacion,
  Turno,
  Agenda,
  Cama,             
  Habitacion,        
  Sector, 
} from '../models/index.js';
import { obtenerCamaActual } from './pacientesCamas.controller.js';
import { Op } from 'sequelize';

export const crearRegistro = async (req, res) => {
  try {
    const {
      id_tipo,
      detalle,
      fecha_hora_reg,
      id_usuario,
      id_admision,
      id_paciente
    } = req.body;

    if (!id_tipo || !detalle || !fecha_hora_reg || !id_usuario) {
      return res.status(400).json({ message: 'Faltan datos obligatorios' });
    }

    if (!id_admision && !id_paciente) {
      return res.status(400).json({
        message: 'Debe proporcionar id_admision o id_paciente'
      });
    }

    let admisionId = id_admision;

    if (!admisionId) {
      const turno = await Turno.findOne({
        where: {
          id_paciente,
          fecha_hora: { [Op.lte]: fecha_hora_reg }
        },
        include: [{ model: Agenda, as: 'agenda' }]
      });

      const id_motivo = turno?.id_motivo ?? 12;
      const id_obra_social = turno?.id_obra_social ?? 10;
      const id_personal_salud = turno?.agenda?.id_personal_salud ?? null;

      const fechaIngreso = new Date(fecha_hora_reg);
      const fechaEgreso = new Date(fechaIngreso.getTime() + 30 * 60000); // +30 minutos

      const nuevaAdmision = await Admision.create({
        id_paciente,
        fecha_hora_ingreso: fechaIngreso,
        fecha_hora_egreso: fechaEgreso,
        descripcion: 'Registro ambulatorio',
        id_motivo,
        id_obra_social,
        num_asociado: '-',
        id_personal_salud,
        motivo_egr: 'Finalización automática por consulta ambulatoria'
      });

      admisionId = nuevaAdmision.id_admision;
    }

    const nuevo = await RegistroHistoriaClinica.create({
      id_tipo,
      detalle,
      fecha_hora_reg,
      id_usuario,
      id_admision: admisionId
    });

    res.status(201).json(nuevo);
  } catch (e) {
    console.error('Error al crear registro clínico:', e);
    res.status(500).json({ message: 'Error al crear registro clínico' });
  }
};

export const listarRegistros = async (req, res) => {
  try {
    const registros = await RegistroHistoriaClinica.findAll({
      include: [
        { model: Admision, as: 'admision' },
        { model: TipoRegistro, as: 'tipo' },
        { model: Usuario, as: 'usuario' },
        { model: PersonalSalud, as: 'profesional' }
      ],
      order: [['fecha_hora', 'DESC']]
    });
    res.json(registros);
  } catch (e) {
    res.status(500).json({ message: 'Error al obtener registros' });
  }
};

export const eliminarRegistro = async (req, res) => {
  const { id } = req.params;
  try {
    const reg = await RegistroHistoriaClinica.findByPk(id);
    if (!reg) return res.status(404).json({ message: 'No encontrado' });
    await reg.destroy();
    res.json({ message: 'Eliminado' });
  } catch (e) {
    res.status(500).json({ message: 'Error al eliminar' });
  }
};

export const buscarPorDNI = async (req, res) => {
  const { dni } = req.params;

  try {
    const paciente = await Paciente.findOne({
      where: { dni_paciente: dni },
      attributes: ['id_paciente', 'nombre_p', 'apellido_p', 'fecha_nac', 'dni_paciente'],
      include: [
        {
          model: Familiar,
          as: 'familiares',
          where: { estado: true },
          required: false,
          include: [
            {
              model: Parentesco,
              as: 'parentesco',
              attributes: ['nombre']
            }
          ]
        }
      ]
    });

    if (!paciente) {
      return res.status(404).json({ message: 'Paciente no encontrado' });
    }

    const admisiones = await Admision.findAll({
      where: { id_paciente: paciente.id_paciente },
      attributes: ['id_admision', 'fecha_hora_ingreso', 'fecha_hora_egreso']
    });

    let ultimaAdmisionVigente = null;
    const ahora = new Date();

    const admisionesOrdenadas = admisiones.sort(
      (a, b) => new Date(b.fecha_hora_ingreso) - new Date(a.fecha_hora_ingreso)
    );

    for (const adm of admisionesOrdenadas) {
      if (!adm.fecha_hora_egreso || new Date(adm.fecha_hora_egreso) > ahora) {
        ultimaAdmisionVigente = adm;
        break;
      }
    }

    const registros = await RegistroHistoriaClinica.findAll({
      include: [
        {
          model: TipoRegistro,
          as: 'tipo_registro',
          attributes: ['id_tipo', 'nombre']
        },
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['username']
        },
        {
          model: Admision,
          as: 'admision_historia',
          where: { id_paciente: paciente.id_paciente },
          attributes: []
        }
      ],
      order: [['fecha_hora_reg', 'DESC']]
    });

    const movimiento = await MovimientoHabitacion.findOne({
      where: {
        estado: 1,
        id_mov: 1,
      },
      include: [
        {
          model: Admision,
          as: 'admision',
          where: { id_paciente: paciente.id_paciente }
        },
        {
          model: Cama,
          as: 'cama',
          include: [
            {
              model: Habitacion,
              as: 'habitacion',
              include: [{ model: Sector, as: 'sector' }]
            }
          ]
        }
      ]
    });

    let camaAsignada = null;

    if (ultimaAdmisionVigente) {
      camaAsignada = await obtenerCamaActual(ultimaAdmisionVigente.id_admision);
    }

    const adaptados = registros.map(r => ({
      id: r.id_registro,
      fecha: r.fecha_hora_reg,
      tipo: r.tipo_registro?.nombre || '-',
      id_tipo: r.tipo_registro?.id_tipo || null,
      detalle: r.detalle || '-',
      usuario: r.usuario?.username || '-'
    }));
    const esInternado = !!movimiento;
    res.json({
      paciente,
      registros: adaptados,
      ultimaAdmision: ultimaAdmisionVigente
        ? { id_admision: ultimaAdmisionVigente.id_admision }
        : null,
      cama: movimiento
        ? {
            nombre: movimiento.cama?.nombre || '',
            habitacion: movimiento.cama?.habitacion?.num || '',
            sector: movimiento.cama?.habitacion?.sector?.nombre || ''
          }
        : null,
      esInternado
    });

  } catch (err) {
    console.error('Error en buscarPorDNI:', err);
    res.status(500).json({ message: 'Error interno' });
  }
};

export const vistaRegistroClinico = async (req, res) => {
  try {
    const { dni } = req.query;

    // Cargar solo la vista base si no se envió el DNI
    if (!dni) {
      return res.render('registroClinico', {
        usuario: req.session.usuario,
        registros: [],
        dni: null,
        username: req.session.usuario.username,
        idUsuario: req.session.usuario.id
      });
    }

    const paciente = await Paciente.findOne({
      where: { dni_paciente: dni },
      attributes: ['id_paciente', 'nombre_p', 'apellido_p']
    });

    if (!paciente) {
      return res.status(404).send('Paciente no encontrado');
    }

    const registros = await RegistroHistoriaClinica.findAll({
      include: [
        {
          model: TipoRegistro,
          as: 'tipo_registro',
          attributes: ['nombre']
        },
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['username']
        },
        {
          model: Admision,
          as: 'admision_historia',
          where: { id_paciente: paciente.id_paciente },
          required: true,
          include: [
            {
              model: Paciente,
              as: 'paciente_admision',
              attributes: ['nombre_p', 'apellido_p']
            }
          ]
        }
      ],
      order: [['fecha_hora_reg', 'DESC']]
    });

    const adaptados = registros.map(r => ({
      id: r.id_registro,
      tipo: r.tipo_registro?.nombre || '-',
      detalle: r.detalle || '-',
      fecha: r.fecha_hora_reg,
      paciente: r.admision_historia?.paciente_admision
        ? `${r.admision_historia.paciente_admision.nombre_p} ${r.admision_historia.paciente_admision.apellido_p}`
        : '-',
      usuario: r.usuario?.username || '-'
    }));

    res.render('registroClinico', {
      usuario: req.session.usuario,
      registros: adaptados,
      dni,
      username: req.session.usuario.username,
      idUsuario: req.session.usuario.id
    });

  } catch (error) {
    console.error('Error al mostrar registros clínicos:', error);
    res.status(500).send(`Error al mostrar registros clínicos: ${error.message}`);
  }
};

export const editarRegistro = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      id_tipo,
      detalle,
      fecha_hora_reg
    } = req.body;

    if (!id_tipo || !detalle || !fecha_hora_reg) {
      return res.status(400).json({ message: 'Faltan datos obligatorios' });
    }

    const registro = await RegistroHistoriaClinica.findByPk(id);
    if (!registro) {
      return res.status(404).json({ message: 'Registro no encontrado' });
    }

    const fechaUTC = new Date(fecha_hora_reg);
    if (isNaN(fechaUTC)) {
      return res.status(400).json({ message: 'Fecha inválida' });
    }

    registro.id_tipo = id_tipo;
    registro.detalle = detalle;
    registro.fecha_hora_reg = fechaUTC;

    await registro.save();

    res.json({ message: 'Registro actualizado correctamente' });
  } catch (e) {
    console.error('Error al editar registro:', e);
    res.status(500).json({ message: 'Error al editar registro' });
  }
};