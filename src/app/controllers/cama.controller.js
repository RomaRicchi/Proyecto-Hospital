import {
	Cama,
	Habitacion,
	Sector,
	MovimientoHabitacion,
	Movimiento,
	Admision,
	Paciente,
	Genero,
	MotivoIngreso,
} from '../models/index.js';
import { Op } from 'sequelize';
import { toUTC } from '../helpers/timezone.helper.js';

export const getCamasApi = async (req, res) => {
	try {
		const camas = await Cama.findAll();
		res.json(camas);
	} catch (error) {
		res.status(500).json({ message: 'Error al obtener camas' });
	}
};

export const getCamaById = async (req, res) => {
	try {
		const cama = await Cama.findByPk(req.params.id, {
			include: [
				{
					model: Habitacion,
					as: 'habitacion',
					include: [
						{ model: Sector, as: 'sector' } 
					],
				},
			],
		});

		if (cama) {
			res.json(cama);
		} else {
			res.status(404).send('Cama no encontrada');
		}
	} catch (error) {
		console.error('Error al obtener cama:', error);
		res.status(500).send('Error interno del servidor');
	}
};

export const getCamasDisponiblesPorFecha = async (req, res) => {
  try {
    const { fecha } = req.query;
    if (!fecha) return res.status(400).json({ message: 'Fecha requerida' });

    const fechaInicio = toUTC(`${fecha}T00:00:00`);
    const fechaFin = toUTC(`${fecha}T23:59:59`);
    const SECTORES_CON_INTERNACION = [1, 3, 7, 9, 10, 14, 26];

    const camas = await Cama.findAll({
      include: [
        {
          model: Habitacion,
          as: 'habitacion',
          required: true,
          include: [{
            model: Sector,
            as: 'sector',
            required: true,
            where: { id_sector: { [Op.in]: SECTORES_CON_INTERNACION } }
          }]
        },
        {
          model: MovimientoHabitacion,
          as: 'movimientos',
          required: false,
          include: [
            { model: Movimiento, as: 'tipo_movimiento' },
            {
              model: Admision,
              as: 'admision',
              include: [{
                model: Paciente,
                as: 'paciente',
                include: [{ model: Genero, as: 'genero' }]
              }]
            }
          ]
        }
      ],
      order: [['id_cama', 'ASC']],
    });

    const resultado = camas.map((cama) => {
      let estado = 'Disponible';
      let paciente = null;
      let genero = null;

      // Buscar todos los movimientos que cruzan la fecha
      const fechaSelStr = fechaInicio.toISOString().slice(0, 10); // yyyy-MM-dd
		const movimientosEnFecha = cama.movimientos?.filter((mov) => {
		if (!mov.fecha_hora_ingreso) return false;

		const ingresoStr = mov.fecha_hora_ingreso.slice(0, 10);
		const egresoStr = mov.fecha_hora_egreso ? mov.fecha_hora_egreso.slice(0, 10) : null;

		return (
			ingresoStr <= fechaSelStr && (!egresoStr || egresoStr >= fechaSelStr)
		);
		}) || [];


      // Priorizar reservas (id_mov === 3) si existen en la fecha
      const reservaEnFecha = movimientosEnFecha.find(mov => mov.tipo_movimiento?.id_mov === 3);
      let movimientoEnFecha = null;
      if (reservaEnFecha) {
        estado = 'Reservada';
        movimientoEnFecha = reservaEnFecha;
      } else if (movimientosEnFecha.length > 0) {
        estado = 'Ocupada';
        movimientoEnFecha = movimientosEnFecha[0];
      }

      if (movimientoEnFecha) {
        const adm = movimientoEnFecha.admision;
        if (adm?.paciente) {
          paciente = `${adm.paciente.apellido_p} ${adm.paciente.nombre_p}`;
          genero = adm.paciente.genero?.nombre || null;
        }
      }
	  
      return {
        id_cama: cama.id_cama,
        nombre_cama: cama.nombre,
        sector: cama.habitacion?.sector?.nombre || '-',
        habitacion: cama.habitacion?.num || '-',
        estado,
        desinfeccion: cama.desinfeccion,
        paciente,
        genero,
        movimientos: cama.movimientos?.map((mov) => ({
          id_mov: mov.id_mov,
          fecha_hora_ingreso: mov.fecha_hora_ingreso,
          fecha_hora_egreso: mov.fecha_hora_egreso
        })) || []
      };
    });

    res.json(resultado);
  } catch (error) {
    console.error('❌ getCamasDisponiblesPorFecha error:', error);
    res.status(500).json({ message: 'Error al cargar las camas' });
  }
};

export const createCama = async (req, res) => {
	try {
		const { nombre, id_habitacion } = req.body;

		// Verificar si ya existe una cama con ese nombre en la misma habitación
		const existente = await Cama.findOne({
			where: {
				nombre,
				id_habitacion
			}
		});

		if (existente) {
			return res.status(409).json({
				message: 'Ya existe una cama con ese nombre en esta habitación'
			});
		}

		const nuevaCama = await Cama.create(req.body);
		res.status(201).json(nuevaCama);
	} catch (error) {
		console.error(error);
		res.status(500).send('Error interno del servidor');
	}
};

export const getCamasReservadas = async (req, res) => {
  try {
    const camas = await Cama.findAll({
      include: [
        {
          model: Habitacion,
          as: 'habitacion',
          include: [{ model: Sector, as: 'sector' }]
        },
        {
          model: MovimientoHabitacion,
          as: 'movimientos',
          where: {
            id_mov: 3, // solo reservas
            estado: 1
          },
          required: true,
          include: [
            {
              model: Admision,
              as: 'admision',
              include: [
                { model: Paciente, as: 'paciente' },
                { model: MotivoIngreso, as: 'motivo_ingreso' }
              ]
            }
          ]
        }
      ],
      order: [['id_cama', 'ASC']]
    });

    res.json(camas);
  } catch (error) {
    console.error('❌ Error al obtener camas reservadas:', error);
    res.status(500).json({ message: 'Error al obtener camas reservadas' });
  }
};

export const updateCama = async (req, res) => {
	try {
		const { id } = req.params;
		const { nombre, id_habitacion } = req.body;

		const cama = await Cama.findByPk(id);
		if (!cama) {
			return res.status(404).json({ message: 'Cama no encontrada' });
		}

		// Verificar si ya existe otra cama con el mismo nombre en esa habitación
		const duplicada = await Cama.findOne({
			where: {
				nombre,
				id_habitacion,
				id_cama: { [Op.ne]: id }
			}
		});

		if (duplicada) {
			return res.status(409).json({
				message: 'Ya existe otra cama con ese nombre en esta habitación'
			});
		}

		await cama.update(req.body);
		res.json(cama);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Error al actualizar la cama' });
	}
};

export const deleteCama = async (req, res) => {
	try {
		const deleted = await Cama.destroy({
			where: { id_cama: req.params.id },
		});
		if (deleted) {
			res.send('Cama eliminada correctamente');
		} else {
			res.status(404).send('Cama no encontrada');
		}
	} catch (error) {
		res.status(500).send('Error interno del servidor');
	}
};

export const vistaCama = async (req, res) => {
	try {
		const camas = await Cama.findAll({
			include: [
				{
					model: Habitacion,
					as: 'habitacion',
					include: [{ model: Sector, as: 'sector' }],
				},
			],
			order: [['id_cama', 'ASC']],
		});

		camas.forEach((cama) => {
			const numero = cama.habitacion?.num;
			const sector = cama.habitacion?.sector?.nombre;
			cama.descripcionHabitacion =
				numero && sector
					? `Habitación ${numero} - ${sector}`
					: numero
					? `Habitación ${numero}`
					: '—';
		});

		res.render('cama', { camas });
	} catch (error) {
		console.error('Error al cargar camas:', error);
		res.status(500).send('Error al cargar camas');
	}
};
