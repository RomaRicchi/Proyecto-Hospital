import {
	Admision,
	Paciente,
	ObraSocial,
	Usuario,
	Cama,
	MotivoIngreso,
	MovimientoHabitacion,
	PersonalSalud,
} from '../models/index.js';
import { Op } from 'sequelize';

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
			include: ['paciente', 'obra_social', 'personal_admin', 'personal_salud'],
		});
		res.json(admisiones);
	} catch (error) {
		res.status(500).json({ message: error.message });
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

export const createAdmision = async (req, res) => {
  try {
    const {
      id_cama,
      id_mov,
      fecha_hora_ingreso,
      fecha_hora_egreso
    } = req.body;

    const fechaIngreso = new Date(fecha_hora_ingreso);
    const fechaEgreso = fecha_hora_egreso ? new Date(fecha_hora_egreso) : null;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); // hora 00:00

    // ❌ No permitir fecha pasada en ningún caso
    if (fechaIngreso < hoy) {
      return res
        .status(400)
        .json({ message: 'No se permite una fecha de ingreso en el pasado' });
    }

    // ❌ Si es reserva, solo se permite fecha futura
    if (id_mov === 3 && fechaIngreso <= hoy) {
      return res
        .status(400)
        .json({ message: 'La fecha de reserva debe ser futura' });
    }

    // ❌ Si hay fecha de egreso, debe ser posterior o igual a ingreso
    if (fechaEgreso && fechaEgreso < fechaIngreso) {
      return res
        .status(400)
        .json({ message: 'La fecha de egreso no puede ser anterior a la de ingreso' });
    }

    // ✅ Validar que la cama exista
    const cama = id_cama ? await Cama.findByPk(id_cama) : null;
    if (id_cama && !cama) {
      return res.status(400).json({ message: 'Cama no encontrada' });
    }

    // ❌ No permitir admisión en cama sin desinfección
 	if (cama && Number(cama.desinfeccion) !== 1) {
	  return res.status(400).json({ message: 'La cama aún no está desinfectada' });
	}

    // ❌ Validar conflicto de reserva
    if (id_cama && id_mov === 3) {
      await validarConflictoReserva({
        id_cama,
        fecha_hora_ingreso
      });
    }

    // ❌ Validar cama libre
    if (id_cama && cama.estado === 1) {
      return res.status(400).json({ message: 'La cama ya está ocupada' });
    }

    // ❌ Evitar duplicados: si ya tiene una admisión vigente/futura
    const admisionActiva = await Admision.findOne({
      where: {
        id_paciente: req.body.id_paciente,
        fecha_hora_ingreso: { [Op.lte]: fechaIngreso },
        [Op.or]: [
          { fecha_hora_egreso: null },
          { fecha_hora_egreso: { [Op.gt]: fechaIngreso } },
        ],
      },
    });

    if (admisionActiva) {
      return res.status(400).json({
        message: 'El paciente ya tiene una admisión vigente en ese período',
      });
    }

	if (!req.body.num_asociado || req.body.num_asociado.trim() === '') {
		return res.status(400).json({ message: 'El número de asociado es obligatorio' });
	}

    // ✅ Crear admisión
    const nueva = await Admision.create(req.body);

    // ✅ Si tiene fecha de egreso, cerrar movimiento activo
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

    // ✅ Si es ingreso inmediato (id_mov = 1) y la fecha ya es actual, ocupar cama
    if (id_cama && id_mov === 1 && fechaIngreso <= new Date()) {
      cama.estado = 1;
      await cama.save();
    }

    res.status(201).json(nueva);
  } catch (error) {
    console.error('❌ Error en createAdmision:', error);
    res.status(500).json({ message: error.message });
  }
};

export const vistaAdmisiones = async (req, res) => {
	try {
		const admisiones = await Admision.findAll({
			include: [
				{
					model: Paciente,
					as: 'paciente',
					attributes: ['apellido_p', 'nombre_p', 'dni_paciente']
				},
				{
					model: ObraSocial,
					as: 'obra_social',
					attributes: ['nombre']
				},
				{
					model: Usuario,
					as: 'usuario_asignado', 
					include: [
						{
							model: PersonalSalud,
							as: 'datos_medico',
							attributes: ['nombre', 'apellido']
						}
					]
				},
				{
					model: MotivoIngreso,
					as: 'motivo_ingreso',
					attributes: ['tipo']
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

		const adaptados = admisiones.map((a) => ({
			id_admision: a.id_admision,
			paciente: a.paciente
				? `${a.paciente.apellido_p} ${a.paciente.nombre_p}`
				: 'Sin paciente',
			dni_paciente: a.paciente?.dni_paciente || '-',
			obra_social: a.obra_social?.nombre || 'Sin cobertura',
			num_asociado: a.num_asociado,
			fecha_ingreso: a.fecha_hora_ingreso
				? new Date(a.fecha_hora_ingreso).toLocaleString('es-AR', formatoFechaHora)
				: '-',
			motivo_ingreso: a.motivo_ingreso?.tipo || '-',
			descripcion: a.descripcion || '-',
			fecha_egreso: a.fecha_hora_egreso
				? new Date(a.fecha_hora_egreso).toLocaleString('es-AR', formatoFechaHora)
				: 'En internación',
			motivo_egr: a.motivo_egr || '-',
			usuario_asignado: a.usuario_asignado?.datos_medico
				? `${a.usuario_asignado.datos_medico.get('apellido')}, ${a.usuario_asignado.datos_medico.get('nombre')}`
				: a.usuario_asignado?.username || 'No asignado',
		}));

		res.render('admision', { admisiones: adaptados });
	} catch (error) {
		console.error('❌ Error en vistaAdmisiones:', error);
		res.status(500).send('Error al mostrar admisiones');
	}
};

export const updateAdmision = async (req, res) => {
	try {
		const admision = await Admision.findByPk(req.params.id);
		if (!admision)
			return res.status(404).json({ message: 'Admisión no encontrada' });

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
		await admision.destroy();
		res.sendStatus(204);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const validarAdmisionPorDNI = async (req, res) => {
	try {
		const { dni } = req.params;
		const paciente = await Paciente.findOne({ where: { dni_paciente: dni } });

		if (!paciente) return res.json({ vigente: false });

		const admision = await Admision.findOne({
			where: {
				id_paciente: paciente.id_paciente,
				fecha_hora_ingreso: { [Op.lte]: new Date() },
				[Op.or]: [
					{ fecha_hora_egreso: null },
					{ fecha_hora_egreso: { [Op.gt]: new Date() } },
				],
			},
		});

		res.json({ vigente: !!admision });
	} catch (error) {
		res.status(500).json({ message: 'Error en validación' });
	}
};

// ✅ Validar que la cama no tenga una reserva exacta o solapada
export async function validarConflictoReserva({ id_cama, fecha_hora_ingreso }, transaction = null) {
  const fecha = new Date(fecha_hora_ingreso);

  const conflicto = await MovimientoHabitacion.findOne({
    where: {
      id_cama,
      id_mov: 3, // Reserva
      estado: 1,
      [Op.or]: [
        { fecha_hora_ingreso: fecha },
        {
          [Op.and]: [
            { fecha_hora_ingreso: { [Op.lte]: fecha } },
            {
              [Op.or]: [
                { fecha_hora_egreso: null },
                { fecha_hora_egreso: { [Op.gt]: fecha } }
              ]
            }
          ]
        }
      ]
    },
    transaction
  });

  if (conflicto) {
    throw new Error('La cama ya está reservada en esa fecha y hora.');
  }
}

// ✅ Validar que la cama no esté ocupada
export async function validarEstadoCama(id_cama, transaction = null) {
  const cama = await Cama.findByPk(id_cama, { transaction });
  if (!cama) throw new Error('Cama no encontrada');
  if (cama.estado === 1) throw new Error('La cama ya está ocupada');
}

// ✅ Validar que la fecha no sea en el pasado
export function validarFechaNoPasada(fecha) {
  if (new Date(fecha) < new Date().setHours(0, 0, 0, 0)) {
    throw new Error('No se permite una fecha de ingreso en el pasado');
  }
}

// ✅ Validar que el paciente no tenga una admisión vigente
export async function validarAdmisionActiva(id_paciente, fecha, transaction = null) {
  const existente = await Admision.findOne({
    where: {
      id_paciente,
      fecha_hora_ingreso: { [Op.lte]: new Date(fecha) },
      [Op.or]: [
        { fecha_hora_egreso: null },
        { fecha_hora_egreso: { [Op.gt]: new Date(fecha) } }
      ]
    },
    transaction
  });

  if (existente) {
    throw new Error('El paciente ya tiene una admisión vigente.');
  }
}
