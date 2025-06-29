import {
	Cama,
	Habitacion,
	Sector,
	MovimientoHabitacion,
	Movimiento,
	Admision,
	Paciente,
	Genero,
} from '../models/index.js';
import { Op } from 'sequelize';

// 🔸 API: Obtener todas las camas en formato JSON (para DataTable)
export const getCamasApi = async (req, res) => {
	try {
		const camas = await Cama.findAll();
		res.json(camas);
	} catch (error) {
		res.status(500).json({ message: 'Error al obtener camas' });
	}
};
// 🔸 Obtener cama por ID (JSON)
export const getCamaById = async (req, res) => {
	try {
		const cama = await Cama.findByPk(req.params.id, {
			include: [{ model: Habitacion, as: 'habitacion' }],
		});
		if (cama) {
			res.json(cama);
		} else {
			res.status(404).send('Cama no encontrada');
		}
	} catch (error) {
		res.status(500).send('Error interno del servidor');
	}
};

export const getCamasDisponiblesPorFecha = async (req, res) => {
	try {
		const { fecha } = req.query;
		if (!fecha) return res.status(400).json({ message: 'Fecha requerida' });

		const desde = new Date(`${fecha}T00:00:00`);
		const hasta = new Date(`${fecha}T23:59:59`);

		const camas = await Cama.findAll({
			include: [
				{
					model: MovimientoHabitacion,
					as: 'movimientos',
					required: false,
					where: {
						fecha_hora_ingreso: {
							[Op.lte]: hasta,
						},
					},
					include: [
						{
							model: Movimiento,
							as: 'tipo_movimiento',
						},
						{
							model: Admision,
							as: 'admision',
							include: [
								{
									model: Paciente,
									as: 'paciente',
									include: [{ model: Genero, as: 'genero' }],
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
			],
			order: [['id_cama', 'ASC']],
		});

		const resultado = camas.map((cama) => {
			let estado = 'Disponible';
			let paciente = null;
			let genero = null;

			if (Array.isArray(cama.movimientos) && cama.movimientos.length > 0) {
				const movimientosValidos = cama.movimientos.filter((mov) => {
				const fechaMov = new Date(mov.fecha_hora_ingreso);
				return fechaMov >= desde && fechaMov <= hasta;
				});

				const ultimoMovimiento = movimientosValidos[0]; // Podés ordenar antes si hace falta

				if (ultimoMovimiento) {
				const tipo = ultimoMovimiento.tipo_movimiento?.nombre;
				if (tipo === 'Reserva') estado = 'Reservada';
				else estado = 'Ocupada';

				const pac = ultimoMovimiento.admision?.paciente;
				paciente = pac ? `${pac.apellido_p} ${pac.nombre_p}` : null;
				genero = pac?.genero?.nombre || null;
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
					genero
			};
		});

		res.json(resultado);
	} catch (error) {
		console.error('❌ getCamasDisponiblesPorFecha error:', error);
		res.status(500).json({ message: 'Error al cargar las camas' });
	}
};
// 🔸 Crear nueva cama
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
// 🔸 Actualizar cama
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
// 🔸 Eliminar cama
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
