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

// 🔸 API: Obtener todas las camas en formato JSON (para DataTable)
export const getCamasApi = async (req, res) => {
	try {
		const camas = await Cama.findAll();
		res.json(camas);
	} catch (error) {
		console.error('Error al obtener camas:', error);
		res.status(500).json({ message: 'Error al obtener camas' });
	}
};

// 🔸 Vista tradicional: Renderizar la vista PUG con camas
export const getCamas = async (req, res) => {
	try {
		const camas = await Cama.findAll({
			include: [
				{
					model: Habitacion,
					as: 'habitacion',
					include: [{ model: Sector, as: 'sector' }],
				},
			],
		});

		// Campo virtual para vista PUG
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
		console.error('Error al obtener camas:', error);
		res.status(500).send('Error interno del servidor');
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
		console.error('Error al obtener cama:', error);
		res.status(500).send('Error interno del servidor');
	}
};

export const getCamasDisponiblesPorFecha = async (req, res) => {
	const { fecha } = req.query;
	if (!fecha) return res.status(400).json({ message: 'Fecha requerida' });

	try {
		const camas = await Cama.findAll({
			include: [
				{
					model: Habitacion,
					as: 'habitacion',
					include: [{ model: Sector, as: 'sector' }],
				},
			],
			logging: console.log,
		});

		const camasConEstado = await Promise.all(
			camas.map(async (cama) => {
				const movimientos = await MovimientoHabitacion.findAll({
					where: { id_cama: cama.id_cama },
					include: [
						{ model: Movimiento, as: 'tipo_movimiento' },
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
					order: [['fecha_hora_ingreso', 'DESC']],
					logging: console.log,
				});

				// Log para depuración
				console.log('Fecha recibida:', fecha);
				console.log(
					'Movimientos encontrados:',
					movimientos.map((m) => ({
						fecha_hora_ingreso: m.fecha_hora_ingreso,
						fecha_hora_egreso: m.fecha_hora_egreso,
						tipo: m.tipo_movimiento?.nombre,
					}))
				);

				let estado = 'Disponible';
				let paciente = null;
				let genero = null;

				// Convertir fecha a solo YYYY-MM-DD para comparar solo la fecha
				const fechaConsulta = new Date(fecha);
				const soloFecha = (d) => (d ? d.toISOString().slice(0, 10) : null);

				for (const mov of movimientos) {
					const fechaIngreso = mov.fecha_hora_ingreso;
					const fechaEgreso = mov.fecha_hora_egreso;

					if (
						soloFecha(fechaIngreso) <= soloFecha(fechaConsulta) &&
						(!fechaEgreso || soloFecha(fechaEgreso) >= soloFecha(fechaConsulta))
					) {
						if (mov.tipo_movimiento.nombre === 'Ingresa/Ocupa') {
							estado = 'Ocupada';
							paciente = mov.admision?.paciente;
							genero = paciente?.genero?.nombre;
						} else if (mov.tipo_movimiento.nombre === 'Reserva') {
							estado = 'Reservada';
							paciente = mov.admision?.paciente;
							genero = paciente?.genero?.nombre;
						}
						break;
					}
				}

				return {
					id_cama: cama.id_cama,
					nombre_cama: cama.nombre,
					habitacion: cama.habitacion?.num,
					sector: cama.habitacion?.sector?.nombre,
					estado,
					paciente: paciente
						? `${paciente.apellido_p} ${paciente.nombre_p}`
						: null,
					genero,
				};
			})
		);

		res.json(camasConEstado);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Error al buscar camas' });
	}
};

// 🔸 Crear nueva cama
export const createCama = async (req, res) => {
	try {
		const nuevaCama = await Cama.create(req.body);
		res.status(201).json(nuevaCama);
	} catch (error) {
		console.error('Error al crear cama:', error);
		res.status(500).send('Error interno del servidor');
	}
};

// 🔸 Actualizar cama
export const updateCama = async (req, res) => {
	try {
		const cama = await Cama.findByPk(req.params.id);
		if (!cama) {
			return res.status(404).json({ message: 'Cama no encontrada' });
		}
		await cama.update(req.body);
		res.json(cama);
	} catch (error) {
		res.status(500).json({ message: error.message });
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
		console.error('Error al eliminar cama:', error);
		res.status(500).send('Error interno del servidor');
	}
};

// 🔸 Vista de reserva de cama
export const vistaReservarCama = async (req, res) => {
	try {
		const camas = await Cama.findAll({
			where: {
				estado: false, // libres
				desinfeccion: true, // desinfectadas
			},
		});
		res.render('reservaCama', { camas });
	} catch (error) {
		console.error('Error al cargar camas:', error);
		res.status(500).send('Error al cargar camas');
	}
};
