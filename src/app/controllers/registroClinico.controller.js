import { 
  RegistroHistoriaClinica, 
  Admision, 
  Paciente, 
  TipoRegistro,
  Usuario, 
  PersonalSalud 
} from '../models/index.js';

import { toUTC, fromUTCToArgentina } from '../helpers/timezone.helper.js';

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

    // Convertir a UTC
    const fechaUTC = toUTC(fecha_hora_reg);

    let admisionId = id_admision;
    if (!admisionId) {
      const nuevaAdmision = await Admision.create({
        id_paciente,
        fecha_hora_ingreso: fechaUTC,
        descripcion: 'Registro ambulatorio sin internación',
        id_motivo: null,
        id_obra_social: null,
        num_asociado: null,
        id_personal_salud: null,
        fecha_hora_egreso: null,
        motivo_egr: null
      });
      admisionId = nuevaAdmision.id_admision;
    }

    const nuevo = await RegistroHistoriaClinica.create({
      id_tipo,
      detalle,
      fecha_hora_reg: fechaUTC,
      id_usuario,
      id_admision: admisionId
    });

    res.status(201).json(nuevo);
  } catch (e) {
    console.error('❌ Error al crear registro:', e);
    res.status(500).json({ message: 'Error al crear registro clínico' });
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
      attributes: ['id_paciente', 'nombre_p', 'apellido_p', 'fecha_nac', 'dni_paciente']
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

    const adaptados = registros.map(r => ({
      fecha: fromUTCToArgentina(r.fecha_hora_reg).toLocaleString('es-AR'),
      tipo: r.tipo_registro?.nombre || '-',
      id_tipo: r.tipo_registro?.id_tipo || null,
      detalle: r.detalle || '-',
      usuario: r.usuario?.username || '-'
    }));

    res.json({
      paciente,
      registros: adaptados,
      ultimaAdmision: ultimaAdmisionVigente
        ? { id_admision: ultimaAdmisionVigente.id_admision }
        : null
    });
  } catch (err) {
    console.error('❌ Error al buscar por DNI:', err);
    res.status(500).json({ message: 'Error interno' });
  }
};


export const vistaRegistroClinico = async (req, res) => {
  try {
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
          include: [
            {
              model: Paciente,
              as: 'paciente_admision',
              attributes: ['nombre_p', 'apellido_p']
            }
          ]
        }
      ]
    });

    const adaptados = registros.map(r => ({
      id: r.id_registro,
      tipo: r.tipo_registro?.nombre || '-',
      detalle: r.detalle || '-',
      fecha: fromUTCToArgentina(r.fecha_hora_reg).toLocaleString('es-AR'),
      paciente: r.admision_historia?.paciente_admision
        ? `${r.admision_historia.paciente_admision.nombre_p} ${r.admision_historia.paciente_admision.apellido_p}`
        : '-',
      usuario: r.usuario?.username || '-'
    }));

    res.render('registroClinico', { registros: adaptados });
  } catch (error) {
    console.error('💥 Error en vistaRegistroClinico:', error);
    res.status(500).send('Error al mostrar registros clínicos');
  }
};

