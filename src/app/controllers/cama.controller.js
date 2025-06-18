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
		res.status(500).send('Error interno del servidor');
	}
};

export const getCamasDisponiblesPorFecha = async (req, res) => {
	const { fecha } = req.query;
	if (!fecha) return res.status(400).json({ message: 'Fecha requerida' });

	console.log('📅 Buscando camas para:', fecha);

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

		const fechaConsulta = new Date(fecha);
		const formatoFecha = (d) => (d ? d.toISOString().slice(0, 10) : null);

		const camasConEstado = await Promise.all(
			camas.map(async (cama) => {
				let estado = 'Disponible';
				let paciente = null;
				let genero = null;

				try {
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
						limit: 1,
					});

					const ultimoMov = movimientos?.[0];

					if (ultimoMov) {
						const fi = ultimoMov.fecha_hora_ingreso;
						const fe = ultimoMov.fecha_hora_egreso;

						const dentroDelRango =
							formatoFecha(fi) <= formatoFecha(fechaConsulta) &&
							(!fe || formatoFecha(fe) >= formatoFecha(fechaConsulta));

						if (dentroDelRango) {
							const tipo = ultimoMov?.tipo_movimiento?.nombre;
							if (tipo === 'Ingresa/Ocupa') estado = 'Ocupada';
							else if (tipo === 'Reserva') estado = 'Reservada';

							const p = ultimoMov?.admision?.paciente;
							if (p) {
								paciente = `${p.apellido_p || ''} ${p.nombre_p || ''}`;
								genero = p.genero?.nombre || null;
							}
						}
					}
				} catch (movError) {
					console.error(`❗ Error al procesar movimientos de cama ${cama.id_cama}:`, movError.message);
				}

				return {
					id_cama: cama.id_cama,
					nombre_cama: cama.numero || cama.nombre || `Cama ${cama.id_cama}`,
					habitacion: cama.habitacion?.num || '-',
					sector: cama.habitacion?.sector?.nombre || '-',
					estado,
					paciente,
					genero,
				};
			})
		);

		console.log(`✅ Camas encontradas: ${camasConEstado.length}`);
		res.json(camasConEstado);
	} catch (error) {
		console.error('❌ Error general al buscar camas disponibles:', error.message);
		res.status(500).json({ message: 'Error al buscar camas' });
	}
};

// 🔸 Crear nueva cama
export const createCama = async (req, res) => {
	try {
		const nuevaCama = await Cama.create(req.body);
		res.status(201).json(nuevaCama);
	} catch (error) {
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
		res.status(500).send('Error al cargar camas');
	}
};
