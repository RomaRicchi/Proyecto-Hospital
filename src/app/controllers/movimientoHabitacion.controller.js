import {
	MovimientoHabitacion,
	Admision,
	Habitacion,
	Movimiento,
	Paciente,
	Sector,
	Genero,
	Cama,
} from '../models/index.js';
import { Op } from 'sequelize';

export const verificarGenero = async (req, res) => {
  const { id_cama, id_genero } = req.body;

  if (!id_cama || !id_genero) {
    return res.status(400).json({ message: 'Faltan datos requeridos.' });
  }

  try {
    // Buscar movimiento activo en esa cama
    const movimiento = await MovimientoHabitacion.findOne({
      where: {
        id_cama,
        id_mov: 1, // ingreso / ocupa
        estado: 1,
        fecha_hora_egreso: null,
      },
      include: [{
        model: Admision,
        as: 'admision',
        include: [{
          model: Paciente,
          as: 'paciente',
          include: [{ model: Genero, as: 'genero' }]
        }]
      }]
    });

    if (!movimiento) {
      // No hay nadie en la cama, permitir
      return res.json({ success: true });
    }
    const generoOcupante = Number(movimiento.admision?.paciente?.genero?.id_genero);
    const generoIngresado = Number(id_genero);
    if (
        generoOcupante !== undefined &&
        generoIngresado !== undefined &&
        generoOcupante !== generoIngresado
    ) {
        return res.status(409).json({
            message: 'La cama ya está ocupada por un paciente de otro género.'
        });
    }
       res.json({ success: true });

  } catch (error) {
    res.status(500).json({ message: 'Error interno al verificar género' });
  }
};

export const getMovimientosHabitacion = async (req, res) => {
	try {
		const where = {};
		if (req.query.habitacion) {
			where.id_habitacion = req.query.habitacion;
		}
		const movimientos = await MovimientoHabitacion.findAll({
			where,
			include: [
				{
					model: Admision,
					as: 'admision',
					include: [
						{
							model: Paciente,
							as: 'paciente',
							include: [
								{
									model: Genero,
									as: 'genero',
									attributes: ['id_genero', 'nombre'],
								},
							],
						},
					],
				},
				{
					model: Habitacion,
					as: 'habitacion',
					include: [{ model: Sector, as: 'sector' }],
				},
				{ model: Movimiento, as: 'tipo_movimiento' },
				{ model: Cama, as: 'cama' },
			],
		});
		res.json(movimientos);
	} catch (error) {
		res.status(500).json({ message: 'Error al obtener movimientos habitación' });
	}
};

export const getMovimientoHabitacionById = async (req, res) => {
	try {
		const movimiento = await MovimientoHabitacion.findByPk(req.params.id, {
			include: [
				{
					model: Admision,
					as: 'admision',
					include: [{ model: Paciente, as: 'paciente' }],
				},
				{
					model: Habitacion,
					as: 'habitacion',
					include: [{ model: Sector, as: 'sector' }],
				},
				{ model: Movimiento, as: 'tipo_movimiento' }, 
			],
		});
		if (!movimiento)
			return res.status(404).json({ message: 'Movimiento no encontrado' });
		res.json(movimiento);
	} catch (error) {
		res.status(500).json({ message: 'Error al obtener movimiento habitación' });
	}
};

export const createMovimientoHabitacion = async (req, res) => {
	try {
		const {
			id_admision,
			id_habitacion,
			id_cama,
			fecha_hora_ingreso,
			fecha_hora_egreso,
			id_mov,
			estado,
		} = req.body;

		const fechaIngreso = new Date(fecha_hora_ingreso);
		const fechaEgreso = fecha_hora_egreso ? new Date(fecha_hora_egreso) : null;

		const admisionNueva = await Admision.findByPk(id_admision, {
			include: [{ model: Paciente, as: 'paciente' }],
		});
		if (!admisionNueva)
			return res.status(404).json({ message: 'Admisión no encontrada' });

		const movimientoOcupado = await MovimientoHabitacion.findOne({
			where: {
				id_habitacion,
				id_cama: { [Op.ne]: id_cama },
				estado: 1,
				id_mov: 1,
				[Op.or]: [
					{ fecha_hora_egreso: null },
					{ fecha_hora_egreso: { [Op.gt]: new Date() } }
				]
			},
			include: [{
				model: Admision,
				as: 'admision',
				include: [{ model: Paciente, as: 'paciente' }],
			}],
		});

		if (
			movimientoOcupado &&
			movimientoOcupado.admision?.paciente?.id_genero !== admisionNueva.paciente.id_genero
		) {
			return res.status(400).json({
				message: 'No se puede internar porque hay un paciente de diferente género en la otra cama.',
			});
		}

		const nuevo = await MovimientoHabitacion.create({
			id_admision,
			id_habitacion,
			id_cama,
			fecha_hora_ingreso: fechaIngreso,
			fecha_hora_egreso: fechaEgreso,
			id_mov,
			estado: estado || 1,
		});

		if (id_cama) {
			const cama = await Cama.findByPk(id_cama);
			if (cama) {
				cama.estado = 1;
				await cama.save();
			}
		}

		res.status(201).json(nuevo);
	} catch (error) {
		console.error('💥 Error en createMovimientoHabitacion:', error);
		res.status(500).json({ message: 'Error al crear movimiento habitación' });
	}
};

export const updateMovimientoHabitacion = async (req, res) => {
	try {
		const { id } = req.params;
		const movimiento = await MovimientoHabitacion.findByPk(id);
		if (!movimiento)
			return res.status(404).json({ message: 'Movimiento no encontrado' });

		const {
			id_admision,
			id_habitacion,
			id_cama, 
			fecha_hora_ingreso,
			fecha_hora_egreso,
			id_mov,
			estado,
		} = req.body;

		await movimiento.update({
			id_admision,
			id_habitacion,
			id_cama, 
			fecha_hora_ingreso: new Date(fecha_hora_ingreso),
			fecha_hora_egreso: fecha_hora_egreso ? new Date(fecha_hora_egreso) : null,
			id_mov,
			estado,
		});
		
		res.json(movimiento);
	} catch (error) {
		res.status(500).json({ message: 'Error al actualizar movimiento habitación' });
	}
};

export const deleteMovimientoHabitacion = async (req, res) => {
	try {
		const movimiento = await MovimientoHabitacion.findByPk(req.params.id);
		if (!movimiento)
			return res.status(404).json({ message: 'Movimiento no encontrado' });

		await movimiento.destroy();
		res.sendStatus(204);
	} catch (error) {
		res.status(500).json({ message: 'Error al eliminar movimiento habitación' });
	}
};

export const vistaMovimientosHabitacion = async (req, res) => {
	try {
		const movimientos = await MovimientoHabitacion.findAll({
			include: [
				{
					model: Admision,
					as: 'admision',
					include: [{ model: Paciente, as: 'paciente' }],
				},
				{
					model: Habitacion,
					as: 'habitacion',
					include: [{ model: Sector, as: 'sector' }],
				},
				{
					model: Movimiento,
					as: 'tipo_movimiento',
				},
				{
					model: Cama,
					as: 'cama',
				},
			],
		});

		const adaptados = movimientos.map(m => ({
			...m.toJSON(),
			fecha_hora_ingreso: m.fecha_hora_ingreso
				? new Date(m.fecha_hora_ingreso).toLocaleString('es-AR')
				: '-',
			fecha_hora_egreso: m.fecha_hora_egreso
				? new Date(m.fecha_hora_egreso).toLocaleString('es-AR')
				: '-',
		}));

		res.render('movHabitacion', { 
			movimientos: adaptados , 
  			usuario: req.session.usuario,
  			autenticado: true
		});
	} catch (error) {
		res.status(500).send('Error al cargar movimientos habitación');
	}
};

export const getMovimientosActivosPorHabitacion = async (req, res) => {
  try {
    const { id_habitacion } = req.params;

    const movimientos = await MovimientoHabitacion.findAll({
      where: {
        id_habitacion,
        estado: 1,
        id_mov: 1,
        [Op.or]: [
          { fecha_hora_egreso: null },
          { fecha_hora_egreso: { [Op.gt]: new Date() } }
        ]
      },
      include: [
        {
          model: Admision,
          as: 'admision',
          include: [
            {
              model: Paciente,
              as: 'paciente',
              include: [{ model: Genero, as: 'genero' }]
            }
          ]
        }
      ]
    });

    res.json(movimientos);
  } catch (error) {
    console.error('Error al obtener movimientos activos por habitación:', error.message);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

