import {
	Admision,
	Paciente,
	ObraSocial,
	Usuario,
	Cama,
	MotivoIngreso,
	MovimientoHabitacion,
	PersonalSalud,
	RegistroHistoriaClinica,
	TipoRegistro,
} from '../models/index.js';
import {
  validarConflictoReserva,
  validarOcupacionCamaPorAdmision,
  validarOcupacionCamaPorAdmisionExcepto,
  validarMovimientoEgresoExistente,
} from '../validators/admision.validator.js';
import { ajustarFechaLocal } from '../helpers/timezone.helper.js';
import { Op } from 'sequelize';

export const validarAdmisionPorDNI = async (req, res) => {
  try {
    const { dni } = req.params;
    const fechaEvaluar = req.query.fecha ? ajustarFechaLocal(req.query.fecha) : new Date();

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
    console.error('Error en validación:', error);
    res.status(500).json({ message: 'Error en validación' });
  }
};

export const createAdmision = async (req, res) => {
  try {
    console.log('📝 Body recibido en createAdmision:', req.body);

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

    req.body.id_usuario = id_usuario;

    const fechaIngreso = ajustarFechaLocal(fecha_hora_ingreso);
    const fechaEgreso = fecha_hora_egreso ? ajustarFechaLocal(fecha_hora_egreso) : null;
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

    const cama = id_cama ? await Cama.findByPk(id_cama) : null;
    if (id_cama && !cama) {
      return res.status(400).json({ message: 'Cama no encontrada' });
    }

    if (cama && Number(cama.desinfeccion) !== 1) {
      return res.status(400).json({ message: 'La cama aún no está desinfectada' });
    }

    if (id_cama && id_mov === 3) {
      await validarConflictoReserva({ id_cama, fecha_hora_ingreso });
    }

    if (id_cama && cama.estado === 1) {
      return res.status(400).json({ message: 'La cama ya está ocupada' });
    }

    const nuevaFecha = ajustarFechaLocal(fecha_hora_ingreso);
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
      }
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

    const nueva = await Admision.create(req.body);

    const tipoIngreso = await TipoRegistro.findOne({
      where: { nombre: { [Op.like]: '%ingreso%' } }
    });

    if (!tipoIngreso) {
      return res.status(400).json({ message: 'No existe un tipo de registro "ingreso" en la base de datos. Debe crearlo en la tabla tipo_registro.' });
    }

    await RegistroHistoriaClinica.create({
      id_admision: nueva.id_admision,
      id_usuario: id_usuario || null,
      fecha_hora_reg: nueva.fecha_hora_ingreso,
      id_tipo: tipoIngreso.id_tipo,
      detalle: `Ingreso hospitalario: ${nueva.descripcion || ''}`,
      estado: 1
    });

    if (fecha_hora_egreso) {
      await MovimientoHabitacion.update(
        { fecha_hora_egreso },
        {
          where: {
            id_admision: nueva.id_admision,
            fecha_hora_egreso: null,
            estado: 1,
            id_mov: 1,
          },
        }
      );
    }

    if (id_cama && id_mov === 1 && fechaIngreso <= new Date()) {
      cama.estado = 1;
      await cama.save();
    }

    res.status(201).json(nueva);
  } catch (error) {
    console.error('❌ Error en createAdmision:', error);
    if (error.code === 'ER_DUP_ENTRY' && error.sqlMessage?.includes('num_asociado')) {
      return res.status(400).json({ message: 'El número de asociado ya está registrado' });
    }
    res.status(500).json({ message: error.message });
  }
};

export const getOpcionesAdmision = async (req, res) => {
	try {
		const [pacientes, obrasSociales, motivos, personal] = await Promise.all([
			Paciente.findAll({
				attributes: ['id_paciente', 'apellido_p', 'nombre_p'],
			}),
			ObraSocial.findAll({ attributes: ['id_obra_social', 'nombre'] }),
			MotivoIngreso.findAll({ attributes: ['id_motivo', 'tipo'] }),
			Usuario.findAll({ attributes: ['id_usuario', 'username'] }),
		]);
		res.json({
			pacientes,
			obrasSociales,
			motivos,
			personal,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
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
          as: 'usuario_asignado',
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
        },
      ],
    });

    const formatoFechaHora = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    };

    const resultado = admisiones.map((a) => {
      const movimientoActivo = a.movimientos_habitacion?.find(
        (m) => m.estado === 1 || m.fecha_hora_egreso == null
      );

      return {
        id_admision: a.id_admision,
        tipo_movimiento: movimientoActivo?.id_mov || null,
        paciente: a.paciente
          ? `${a.paciente.apellido_p} ${a.paciente.nombre_p}`
          : 'Sin paciente',
        dni_paciente: a.paciente?.dni_paciente || '-',
        obra_social: a.obra_social?.nombre || 'Sin cobertura',
        num_asociado: a.num_asociado,
        motivo_ingreso: a.motivo_ingreso?.tipo || '-',
        descripcion: a.descripcion || '-',
        fecha_ingreso: a.fecha_hora_ingreso
          ? new Date(a.fecha_hora_ingreso).toLocaleString('es-AR', formatoFechaHora)
          : '-',
        fecha_egreso: a.fecha_hora_egreso
          ? new Date(a.fecha_hora_egreso).toLocaleString('es-AR', formatoFechaHora)
          : 'En internación',
        motivo_egr: a.motivo_egr || '-',
        usuario_asignado: a.usuario_asignado?.datos_medico
          ? `${a.usuario_asignado.datos_medico.apellido}, ${a.usuario_asignado.datos_medico.nombre}`
          : a.usuario_asignado?.username || 'No asignado',
      };
    });

    res.json(resultado);
  } catch (error) {
    console.error('❌ Error en getAdmisiones:', error);
    res.status(500).json({ error: 'Error al obtener admisiones' });
  }
};

export const getAdmisionById = async (req, res) => {
	try {
		const admision = await Admision.findByPk(req.params.id, {
			include: ['paciente', 'obra_social', 'personal_admin', 'personal_salud'],
		});
		if (!admision)
			return res.status(404).json({ message: 'Admisión no encontrada' });
		res.json(admision);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const vistaAdmisiones = (req, res) => {
  res.render('admision'); 
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
			req.body.fecha_hora_ingreso = ajustarFechaLocal(new Date(fecha_hora_ingreso));
		}
		if (fecha_hora_egreso) {
			req.body.fecha_hora_egreso = ajustarFechaLocal(new Date(fecha_hora_egreso));
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



