import {
	Admision,
	Paciente,
	ObraSocial,
	Usuario,
	Cama,
  Habitacion,
  Sector,
	MotivoIngreso,
	MovimientoHabitacion,
	PersonalSalud,
	RegistroHistoriaClinica,
	TipoRegistro,
  Especialidad,
  sequelize,
} from '../models/index.js';
import {
  validarConflictoReserva,
  validarOcupacionCamaPorAdmision,
  validarOcupacionCamaPorAdmisionExcepto,
  validarMovimientoEgresoExistente,
  verificarGeneroHabitacion,
  validarConflictoConReservaExistente,
} from '../validators/admision.validator.js';
import {
  calcularEdad,
  validarCompatibilidadPacienteSector
} from '../validators/validarSectorPaciente.js';
import { Op } from 'sequelize';

export const validarAdmisionPorDNI = async (req, res) => {
  try {
    const { dni } = req.params;
    const fechaEvaluar = req.query.fecha ? new Date(req.query.fecha) : new Date();
    const paciente = await Paciente.findOne({ where: { dni_paciente: dni } });
    if (!paciente) return res.json({ vigente: false });

    const admision = await Admision.findOne({
      where: {
        id_paciente: paciente.id_paciente,
        fecha_hora_ingreso: { [Op.lte]: fechaEvaluar },
        [Op.or]: [
          { fecha_hora_egreso: null },
          { fecha_hora_egreso: { [Op.gte]: fechaEvaluar } },
        ],
      },
    });

    res.json({ vigente: !!admision });
  } catch (error) {
    res.status(500).json({ message: 'Error en validación' });
  }
};

export const createAdmision = async (req, res) => {
  const t = await sequelize.transaction(); 
  try {
    const {
      id_cama,
      id_mov,
      fecha_hora_ingreso,
      fecha_hora_egreso,
      id_usuario,
      id_paciente
    } = req.body;

    if (!id_paciente) {
      return res.status(400).json({ message: 'Falta el paciente para registrar la admisión.' });
    }

    let medico = null;
    if (id_usuario) {
      medico = await PersonalSalud.findOne({ where: { id_usuario } });
      if (!medico) {
        return res.status(400).json({ message: 'El médico seleccionado no está registrado en personal de salud.' });
      }
    }

    const paciente = await Paciente.findByPk(id_paciente);
    if (!paciente) return res.status(400).json({ message: 'Paciente no encontrado' });
    const genero = paciente.id_genero;
    const fecha_nac = paciente.fecha_nac;
    req.body.id_usuario = id_usuario;

    const fechaIngreso = fecha_hora_ingreso;
    const fechaEgreso = fecha_hora_egreso ? fecha_hora_egreso : null;

    if (id_mov === 1 && !fecha_hora_egreso) {
      const egreso = new Date(fechaIngreso);
      egreso.setDate(egreso.getDate() + 7);
      req.body.fecha_hora_egreso = egreso;
    }

    const hoy = new Date(); hoy.setHours(0, 0, 0, 0);

    if (fechaIngreso < hoy) {
      return res.status(400).json({ message: 'No se permite una fecha de ingreso en el pasado' });
    }

    if (id_mov === 3 && fechaIngreso <= hoy) {
      return res.status(400).json({ message: 'La fecha de reserva debe ser futura' });
    }

    if (fechaEgreso && fechaEgreso < fechaIngreso) {
      return res.status(400).json({ message: 'La fecha de egreso no puede ser anterior a la de ingreso' });
    }

    const cama = id_cama ? await Cama.findByPk(id_cama, {
      include: [
        { model: Habitacion, as: 'habitacion', include: [{ model: Sector, as: 'sector' }] }
      ],
      transaction: t,
    }) : null;

    if (id_cama && !cama) {
      return res.status(400).json({ message: 'Cama no encontrada' });
    }

    if (cama) {
      const habitacionId = cama.id_habitacion;
      await verificarGeneroHabitacion(habitacionId, genero, t);
      const sector = cama.habitacion?.sector?.nombre || '';
      const edad = calcularEdad(fecha_nac);
      const compatible = validarCompatibilidadPacienteSector(edad, genero, sector);
      if (!compatible) {
        throw new Error(`El paciente no cumple los requisitos para el sector "${sector}".`);
      }
    }

    if (id_mov === 1 && cama && Number(cama.desinfeccion) !== 1) {
      return res.status(400).json({ message: 'La cama aún no está desinfectada' });
    }

    if (id_cama && id_mov === 3) {
      await validarConflictoReserva({ id_cama, fecha_hora_ingreso });
    }

    if (id_cama && cama.estado === 1) {
      return res.status(400).json({ message: 'La cama ya está ocupada' });
    }

    if (id_cama && id_mov === 1) {
      await validarConflictoConReservaExistente(id_cama, fechaIngreso, t);
    }
    const nuevaFecha = new Date(fecha_hora_ingreso);
    const solapada = await Admision.findOne({
      where: {
        id_paciente,
        [Op.or]: [
          { fecha_hora_egreso: null },
          {
            fecha_hora_ingreso: { [Op.lte]: nuevaFecha },
            fecha_hora_egreso: { [Op.gte]: nuevaFecha }
          }
        ]
      },
      transaction: t
    });

    if (solapada) {
      return res.status(400).json({
        message: 'El paciente ya tiene una admisión vigente en ese período',
      });
    }

    if (!req.body.num_asociado || req.body.num_asociado.trim() === '') {
      return res.status(400).json({ message: 'El número de asociado es obligatorio' });
    }

    if (id_cama && id_mov === 1) {
      await validarOcupacionCamaPorAdmision(id_cama, fecha_hora_ingreso);
    }

    const nueva = await Admision.create(req.body, { transaction: t });

    await MovimientoHabitacion.create({
      id_admision: nueva.id_admision,
      id_habitacion: cama?.id_habitacion,
      id_cama,
      fecha_hora_ingreso: nueva.fecha_hora_ingreso,
      fecha_hora_egreso: req.body.fecha_hora_egreso || null,
      id_mov,
      estado: 1
    }, { transaction: t });

    if (id_mov === 1) {
      const tipoIngreso = await TipoRegistro.findOne({
        where: { nombre: { [Op.like]: '%ingreso%' } },
        transaction: t
      });

      if (!tipoIngreso) {
        return res.status(400).json({ message: 'No existe un tipo de registro "ingreso"...' });
      }

      await RegistroHistoriaClinica.create({
        id_admision: nueva.id_admision,
        id_usuario: id_usuario || null,
        fecha_hora_reg: nueva.fecha_hora_ingreso,
        id_tipo: tipoIngreso.id_tipo,
        detalle: `Ingreso hospitalario: ${nueva.descripcion || ''}`,
        estado: 1
      }, { transaction: t });
    }


    if (id_cama && id_mov === 1 && fechaIngreso <= new Date()) {
      cama.estado = 1;
      await cama.save({ transaction: t });
    }

    await t.commit();
    res.status(201).json(nueva);

    } catch (error) {
      if (t) await t.rollback();
      const erroresEsperados = [
        'género',
        'requisitos para el sector',
        'asociado',
        'admision vigente',
        'ocupada',
        'reservada',
        'reserva'
      ];

      if (erroresEsperados.some(msg => error.message.toLowerCase().includes(msg))) {
        return res.status(400).json({ error: error.message });
      }

      // Para todo lo demás
      res.status(500).json({ error: 'Error inesperado' });
    }
};

export const getOpcionesAdmision = async (req, res) => {
  try {
    const [pacientes, obrasSociales, motivos, personal] = await Promise.all([
      Paciente.findAll({
        attributes: ['id_paciente', 'apellido_p', 'nombre_p', 'dni_paciente', 'fecha_nac'],
      }),
      ObraSocial.findAll({ attributes: ['id_obra_social', 'nombre'] }),
      MotivoIngreso.findAll({ attributes: ['id_motivo', 'tipo'] }),
      Usuario.findAll({
        where: {
          '$datos_medico.id_rol_usuario$': 4 
        },
        attributes: ['id_usuario'],
        include: [
          {
            model: PersonalSalud,
            as: 'datos_medico',
            required: true,
            attributes: ['nombre', 'apellido'],
            include: [
              {
                model: Especialidad,
                as: 'especialidad',
                attributes: ['nombre']
              }
            ]
          }
        ]
      })
    ]);

    res.json({
      pacientes,
      obrasSociales,
      motivos,
      personal
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener opciones' });
  }
};

export const getAdmisiones = async (req, res) => {
  try {
    const admisiones = await Admision.findAll({
      include: [
        {
          model: Paciente,
          as: 'paciente',
          attributes: ['nombre_p', 'apellido_p', 'dni_paciente'],
        },
        {
          model: ObraSocial,
          as: 'obra_social',
          attributes: ['nombre'],
        },
        {
          model: Usuario,
          as: 'usuario_medico',
          attributes: ['id_usuario', 'username'],
          include: [
            {
              model: PersonalSalud,
              as: 'datos_medico',
              attributes: ['nombre', 'apellido'],
            },
          ],
        },
        {
          model: MotivoIngreso,
          as: 'motivo_ingreso',
          attributes: ['tipo'],
        },
        {
          model: MovimientoHabitacion,
          as: 'movimientos_habitacion',
          attributes: ['id_mov', 'fecha_hora_egreso', 'estado'],
          required: false, 
        },
      ],
    });

    const ahora = new Date();

    const resultado = admisiones
      .map((a) => {
        const movimientoActivo = a.movimientos_habitacion?.find((m) => {
          const { id_mov, estado, fecha_hora_egreso } = m.dataValues;

          const egreso = fecha_hora_egreso ? new Date(fecha_hora_egreso) : null;

          const esInternacionActiva =
            id_mov === 1 && estado === true && (!egreso || egreso > ahora);

          const esReservaActiva =
            id_mov === 3 && estado === true && egreso && egreso > ahora;

          return esInternacionActiva || esReservaActiva;
        });

        if (!movimientoActivo) return null;

        return {
          id_admision: a.id_admision,
          paciente: a.paciente
            ? `${a.paciente.apellido_p} ${a.paciente.nombre_p}`
            : 'Sin paciente',
          dni_paciente: a.paciente?.dni_paciente || '-',
          obra_social: a.obra_social?.nombre || 'Sin cobertura',
          num_asociado: a.num_asociado,
          motivo_ingreso: a.motivo_ingreso?.tipo || '-',
          descripcion: a.descripcion || '-',
          fecha_ingreso: a.fecha_hora_ingreso
            ? new Date(a.fecha_hora_ingreso).toLocaleString('es-AR')
            : '-',
          fecha_egreso: a.fecha_hora_egreso
            ? new Date(a.fecha_hora_egreso).toLocaleString('es-AR')
            : 'En internación',
          motivo_egr: a.motivo_egr || '-',
          usuario_asignado: a.usuario_medico?.datos_medico
            ? `${a.usuario_medico.datos_medico.apellido}, ${a.usuario_medico.datos_medico.nombre}`
            : a.usuario_medico?.username || 'No asignado',
        };
      })
      .filter(Boolean);

    res.json(resultado);
  } catch (error) {
    console.error('❌ Error en getAdmisiones:', error);
    res.status(500).json({ error: 'Error al obtener admisiones' });
  }
};

export const getAdmisionById = async (req, res) => {
  try {
    const admision = await Admision.findByPk(req.params.id, {
      include: [
        {
          model: Usuario,
          as: 'usuario_asignado',
          include: [
            {
              model: PersonalSalud,
              as: 'datos_medico',
              attributes: ['nombre', 'apellido'],
              required: false, 
            }
          ]
        },
        {
          model: MotivoIngreso,
          as: 'motivo_ingreso',
        },
        {
          model: ObraSocial,
          as: 'obra_social',
        },
        {
          model: Paciente,
          as: 'paciente',
        },
      ]
    });

    if (!admision) return res.status(404).json({ message: 'No encontrada' });

    res.json(admision);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener admisión' });
  }
};

export const vistaAdmisiones = (req, res) => {
  res.render('admision', {
    usuario: req.session.usuario,
    autenticado: true
  });
};

export const updateAdmision = async (req, res) => {
	try {
		const admision = await Admision.findByPk(req.params.id);
		if (!admision)
			return res.status(404).json({ message: 'Admisión no encontrada' });
		
		await validarMovimientoEgresoExistente(admision.id_admision);

		const { id_cama, id_mov, fecha_hora_ingreso, fecha_hora_egreso } = req.body;

		if (id_cama && id_mov === 1 && fecha_hora_ingreso) {
			await validarOcupacionCamaPorAdmisionExcepto(
				id_cama,
				fecha_hora_ingreso,
				admision.id_admision
			);
		}

		if (fecha_hora_ingreso) {
			req.body.fecha_hora_ingreso = new Date(fecha_hora_ingreso);
		}

		if (fecha_hora_egreso) {
			req.body.fecha_hora_egreso = new Date(fecha_hora_egreso);
		}

		// ✅ Si es ingreso y no se definió fecha_hora_egreso, asumir una semana
		if (req.body.id_mov === 1 && !req.body.fecha_hora_egreso) {
			const ingreso = new Date(req.body.fecha_hora_ingreso);
			ingreso.setDate(ingreso.getDate() + 7);
			req.body.fecha_hora_egreso = ingreso;
		}

		await admision.update(req.body);

		if (req.body.fecha_hora_egreso) {
			await MovimientoHabitacion.update(
				{ fecha_hora_egreso: req.body.fecha_hora_egreso },
				{
					where: {
						id_admision: admision.id_admision,
						fecha_hora_egreso: null,
						estado: 1,
						id_mov: 1,
					},
				}
			);
		}

		res.json(admision);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const deleteAdmision = async (req, res) => {
	try {
		const admision = await Admision.findByPk(req.params.id);
		if (!admision)
			return res.status(404).json({ message: 'Admisión no encontrada' });
		await validarMovimientoEgresoExistente(admision.id_admision);
		await admision.destroy();
		res.sendStatus(204);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};



