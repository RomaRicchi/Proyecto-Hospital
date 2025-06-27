import { RegistroHistoriaClinica, Admision, Paciente, TipoRegistro, Usuario, PersonalSalud } from '../models/index.js';

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
    const nuevo = await RegistroHistoriaClinica.create(req.body);
    res.json(nuevo);
  } catch (e) {
    res.status(500).json({ message: 'Error al crear registro' });
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
    const admisiones = await Admision.findAll({
      include: [
        {
          model: Paciente,
          as: 'paciente_admision',
          where: { dni_paciente: dni },
          attributes: ['nombre_p', 'apellido_p', 'fecha_nac', 'dni_p']
        }
      ]
    });

    if (!admisiones.length) return res.status(404).json({ message: 'Paciente no encontrado' });

    const paciente = admisiones[0].paciente_admision;

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
          where: { id_paciente: paciente.id_paciente } // asegura los registros del paciente correcto
        }
      ],
      order: [['fecha_hora_reg', 'DESC']]
    });

    const adaptados = registros.map(r => ({
      fecha: r.fecha_hora_reg,
      tipo: r.tipo_registro?.nombre || '-',
      detalle: r.detalle || '-',
      usuario: r.usuario?.username || '-'
    }));

    res.json({ paciente, registros: adaptados });
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
              as: 'paciente_admision', // este alias debe coincidir con el que definiste en index.js
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
      fecha: new Date(r.fecha_hora_reg).toLocaleString('es-AR'),
      paciente: r.admision_historia?.paciente_admision
        ? `${r.admision_historia.paciente_admision.nombre_p} ${r.admision_historia.paciente_admision.apellido_p}`
        : '-',
      usuario: r.usuario?.username || '-'
    }));

    res.render('registroClinico', { registros: adaptados });
  } catch (error) {
    console.error('💥 Error en vistaRegistroClinico:', error); // 🔴 OBLIGATORIO
    res.status(500).send('Error al mostrar registros clínicos');
  }
};
