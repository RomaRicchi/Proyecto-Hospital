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

export const getCamasApi = async (req, res) => {
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
						fecha_hora_egreso: null,
						estado: 1
					},
					required: false,
					include: [
						{
							model: Admision,
							as: 'admision',
							include: [
								{ model: Paciente, as: 'paciente' }
							]
						}
					]
				}
			],
			order: [['id_cama', 'ASC']]
		});

		camas.forEach((cama) => {
			cama.descripcionHabitacion =
				cama.habitacion && cama.habitacion.sector
					? `Habitación ${cama.habitacion.num} - ${cama.habitacion.sector.nombre}`
					: '-';
			cama.dataValues.desinfeccion = cama.desinfeccion;
		});

		res.json(camas);
	} catch (error) {
		console.error('❌ Error al obtener camas API:', error);
		res.status(500).json({ message: 'Error al obtener camas' });
	}
};

export const getCamaById = async (req, res) => {
	try {
		const { id } = req.params;

		if (isNaN(parseInt(id))) {
			return res.status(400).json({ message: 'ID de cama inválido' });
		}

		const cama = await Cama.findByPk(id, {
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

		if (!cama) {
			return res.status(404).json({ message: 'Cama no encontrada' });
		}

		res.json(cama);
	} catch (error) {
		console.error('❌ Error en getCamaById:', error);
		res.status(500).json({ message: 'Error interno del servidor' });
	}
};

export const getCamasDisponiblesPorFecha = async (req, res) => {
  try {
    const { fecha } = req.query;
    if (!fecha) return res.status(400).json({ message: 'Fecha requerida' });
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


      const movimientosEnFecha = cama.movimientos?.filter((mov) => {
        if (!mov.fecha_hora_ingreso) return false;

        const fechaSel = fecha; 
        const ingresoStr = mov.fecha_hora_ingreso.slice(0, 10);
        const egresoStr = mov.fecha_hora_egreso ? mov.fecha_hora_egreso.slice(0, 10) : null;

        return ingresoStr <= fechaSel && (!egresoStr || egresoStr >= fechaSel);
      }) || [];

      const reserva = movimientosEnFecha.find(m => m.tipo_movimiento?.id_mov === 3);
      let movimientoEnFecha = null;

      if (reserva) {
        estado = 'Reservada';
        movimientoEnFecha = reserva;
      } else if (movimientosEnFecha.length > 0) {
        estado = 'Ocupada';
        movimientoEnFecha = movimientosEnFecha[0];
      }

      if (movimientoEnFecha?.admision?.paciente) {
        const p = movimientoEnFecha.admision.paciente;
        paciente = `${p.apellido_p} ${p.nombre_p}`;
        genero = p.genero?.nombre || null;
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
        movimientos: cama.movimientos?.map(m => ({
          id_mov: m.id_mov,
          fecha_hora_ingreso: m.fecha_hora_ingreso,
          fecha_hora_egreso: m.fecha_hora_egreso
        })) || []
      };
    });

    res.json(resultado);
  } catch (error) {
    console.error('❌ Error al cargar camas disponibles:', error);
    res.status(500).json({ message: 'Error al cargar las camas' });
  }
};

export const createCama = async (req, res) => {
  try {
    let { nombre, id_habitacion, desinfeccion, estado } = req.body;

    nombre = nombre.trim().toUpperCase();

    if (!nombre || !id_habitacion) {
      return res.status(400).json({ message: 'Nombre e id_habitacion son obligatorios' });
    }

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

    const nuevaCama = await Cama.create({
      nombre,
      id_habitacion,
      desinfeccion: parseInt(desinfeccion) || 0,
      estado: parseInt(estado) || 0
    });

    res.status(201).json(nuevaCama);

  } catch (error) {
    console.error('❌ Error al crear cama:', error);
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
          include: [
            { model: Sector, as: 'sector' }
          ]
        },
        {
          model: MovimientoHabitacion,
          as: 'movimientos',
          required: true,
          where: {
            id_mov: 3, 
            estado: 1
          },
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

    const resultado = camas.map(c => ({
      id_cama: c.id_cama,
      nombre: c.nombre,
      habitacion: c.habitacion?.num,
      sector: c.habitacion?.sector?.nombre,
      movimientos: c.movimientos.map(m => ({
        id_movimiento: m.id_movimiento,
        fecha_reserva: m.fecha_hora_ingreso,
        paciente: m.admision?.paciente || null,
        motivo: m.admision?.motivo_ingreso?.tipo || 'Sin motivo'
      }))
    }));

    res.json(resultado);

  } catch (error) {
    console.error('❌ Error al obtener camas reservadas:', error);
    res.status(500).json({ message: 'Error al obtener camas reservadas' });
  }
};

export const updateCama = async (req, res) => {
  try {
    const { id } = req.params;
    let { nombre, id_habitacion, desinfeccion, estado } = req.body;

    nombre = nombre.trim().toUpperCase();

    if (!nombre || !id_habitacion) {
      return res.status(400).json({ message: 'Nombre e ID de habitación son requeridos' });
    }

    const cama = await Cama.findByPk(id);
    if (!cama) {
      return res.status(404).json({ message: 'Cama no encontrada' });
    }

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

    await cama.update({
      nombre,
      id_habitacion,
      desinfeccion: parseInt(desinfeccion) || 0,
      estado: parseInt(estado) || 0
    });

    res.json(cama);

  } catch (error) {
    console.error('❌ Error al actualizar la cama:', error);
    res.status(500).json({ message: 'Error interno al actualizar la cama' });
  }
};

export const deleteCama = async (req, res) => {
  try {
    const deleted = await Cama.destroy({
      where: { id_cama: req.params.id },
    });

    if (deleted) {
      return res.status(200).json({ message: 'Cama eliminada correctamente' });
    } else {
      return res.status(404).json({ message: 'Cama no encontrada' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Error interno del servidor' });
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
          ? `${sector} - Habitación ${numero}`
          : numero
          ? `Hab. ${numero}`
          : '—';
		});

		res.render('cama', {
      camas,
      usuario: req.session.usuario,
      autenticado: true
    });
	} catch (error) {
		res.status(500).send('Error al cargar camas');
	}
};

export const getCamasOcupadas = async (req, res) => {
  try {
    const camas = await Cama.findAll({
      include: [
        {
          model: Habitacion,
          as: 'habitacion',
          include: [{ model: Sector, as: 'sector' }],
        },
        {
          model: MovimientoHabitacion,
          as: 'movimientos',
          required: true,
          where: {
            estado: 1,
           
           
          },
          include: [
            {
              model: Admision,
              as: 'admision',
              include: [{ model: Paciente, as: 'paciente',
                include: [{ model: Genero, as: 'genero' }]
               }],
            },
            { model: Movimiento, as: 'tipo_movimiento' },
          ],
        },
      ],
    });

    res.json(camas);
  } catch (error) {
    console.error('Error al obtener camas ocupadas:', error);
    res.status(500).json({ message: 'Error al obtener camas ocupadas' });
  }
};
