import { 
  RegistroHistoriaClinica, 
  Admision, 
  MovimientoHabitacion,
  Paciente,
  TipoRegistro,
  Usuario, 
  PersonalSalud,
  PersonalAdministrativo,
  Turno,
  Agenda,
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

    // Si no hay admisión explícita (registro ambulatorio), validar que no haya otra activa
    if (!admisionId) {
      const admisionesActivas = await Admision.findAll({
        where: {
          id_paciente,
          fecha_hora_ingreso: { [Op.lte]: fecha_hora_reg },
          [Op.or]: [
            { fecha_hora_egreso: null },
            { fecha_hora_egreso: { [Op.gt]: fecha_hora_reg } }
          ]
        }
      });

      if (admisionesActivas.length > 0) {
        return res.status(400).json({
          message: 'Ya existe una admisión activa. No se puede crear otra hasta que se finalice la actual.'
        });
      }

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
  try {
    const { dni } = req.params;

    if (!dni) {
      return res.status(400).json({ message: 'Debe enviar un DNI' });
    }

    const paciente = await Paciente.findOne({ where: { dni_paciente: dni } });
    if (!paciente) {
      return res.status(404).json({ message: 'Paciente no encontrado' });
    }

    const ultimaAdmision = await Admision.findOne({
      where: { id_paciente: paciente.id_paciente },
      order: [['fecha_hora_ingreso', 'DESC']]
    });

    let cama = null;
    if (ultimaAdmision?.id_admision) {
      cama = await obtenerCamaActual(ultimaAdmision.id_admision);
    }

    // Obtener todos los registros clínicos del paciente
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
          attributes: ['id_admision', 'fecha_hora_ingreso'],
          where: { id_paciente: paciente.id_paciente },
          required: true
        }
      ],
      order: [['fecha_hora_reg', 'DESC']]
    });

    const registrosFiltrados = [];

    for (const r of registros) {
      const tieneMovimiento1 = await MovimientoHabitacion.findOne({
        where: {
          id_admision: r.admision_historia.id_admision,
          id_mov: 1
        }
      });

      if (tieneMovimiento1) {
        registrosFiltrados.push({
          id: r.id_registro,
          fecha: r.fecha_hora_reg,
          tipo: r.tipo_registro?.nombre || '-',
          id_tipo: r.tipo_registro?.id_tipo || null,
          detalle: r.detalle || '-',
          usuario: r.usuario?.username || '-',
          id_admision: r.id_admision || null
        });
      }
    }

    return res.json({
      paciente,
      cama,
      ultimaAdmision,
      registros: registrosFiltrados
    });

  } catch (err) {
    console.error('❌ Error en buscarPorDNI:', err);
    return res.status(500).json({
      message: 'Error interno en el servidor',
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};


export const vistaRegistroClinico = async (req, res) => {
  try {
    const idUsuario = req.session.usuario?.id_usuario || req.session.usuario?.id;

    const usuarioCompleto = await Usuario.findByPk(idUsuario, {
      include: [
        {
          model: PersonalSalud,
          as: 'datos_medico',
        },
        {
          model: PersonalAdministrativo,
          as: 'personal_administrativo', 
        }
      ]
    });

    let idRol = null;

    if (usuarioCompleto.datos_medico) {
      idRol = usuarioCompleto.datos_medico.id_rol_usuario;
    } else if (usuarioCompleto.personal_administrativo) {
      idRol = usuarioCompleto.personal_administrativo.id_rol_usuario;
    }

    res.render('registroClinico', {
      usuario: {
        ...req.session.usuario,
        id_rol_usuario: idRol
      },
      autenticado: true
    });
  } catch (err) {
    console.error('❌ Error en vistaRegistroClinico:', err);
    res.status(500).send('Error cargando la vista de registros clínicos');
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