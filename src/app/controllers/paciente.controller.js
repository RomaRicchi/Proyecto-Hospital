import {
	Paciente,
	Genero,
	Localidad,
	Admision,
	ObraSocial,
	Familiar,
	Parentesco,
} from '../models/index.js';
import { calcularEdad } from '../validators/validarSectorPaciente.js';
import { Op } from 'sequelize';

export const vistaPacientes = async (req, res) => {
	try {
		const pacientes = await Paciente.findAll({
			include: [
				{ model: Genero, as: 'genero', attributes: ['nombre'] },
				{ model: Localidad, as: 'localidad', attributes: ['nombre'] },
				{
					model: Admision,
					as: 'admisiones',
					include: [
						{ model: ObraSocial, as: 'obra_social', attributes: ['nombre'] },
					],
					limit: 1,
					order: [['fecha_hora_ingreso', 'DESC']],
				},
				{
					model: Familiar,
					as: 'familiares',
					include: [
						{ model: Parentesco, as: 'parentesco', attributes: ['nombre'] },
					],
				},
			],
			where: { estado: true },
		});

		const pacientesAdaptados = pacientes.map((p) => {
			const ultimaAdmision = p.admisiones?.[0];
			const familiar = p.familiares?.[0];
			return {
				id_paciente: p.id_paciente,
				dni_paciente: p.dni_paciente,
				apellido_p: p.apellido_p,
				nombre_p: p.nombre_p,
				fecha_nac: p.fecha_nac,
				genero: p.genero?.nombre || '-',
				cobertura: ultimaAdmision?.obra_social?.nombre || '-',
				telefono: p.telefono,
				email: p.email,
				direccion: p.direccion,
				localidad: p.localidad?.nombre || '-',
				familiar: familiar
					? `${familiar.nombre} ${familiar.apellido} (${
							familiar.parentesco?.nombre || 'Sin parentesco'
					  })`
					: 'Sin familiar asignado',
			};
		});

		res.render('paciente', { 
			pacientes: pacientesAdaptados || [] , 
  			usuario: req.session.usuario,
  			autenticado: true
		});
	} catch (error) {
		res.status(500).send('Error en el servidor');
	}
};

export const vistaPacienteNuevo = async (req, res) => {
	try {
		const generos = await Genero.findAll({
			attributes: ['id_genero', 'nombre'],
		});
		const localidades = await Localidad.findAll({
			attributes: ['id_localidad', 'nombre'],
		});

		res.render('pacienteNuevo', { 
			generos, 
			localidades , 
  			usuario: req.session.usuario,
  			autenticado: true
		});
	} catch (error) {
		res.status(500).send('Error al cargar formulario de paciente');
	}
};

export const getPacientes = async (req, res) => {
  try {
    const pacientes = await Paciente.findAll({
      where: { estado: true },
      attributes: ['id_paciente', 'nombre_p', 'apellido_p', 'dni_paciente', 'fecha_nac'],
      include: [
        {
          model: Genero,
          as: 'genero',
          attributes: ['id_genero', 'nombre']
        }
      ]
    });
    res.json(pacientes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPacienteById = async (req, res) => {
	try {
		const paciente = await Paciente.findByPk(req.params.id, {
			include: [
				{ model: Genero, as: 'genero', attributes: ['id_genero', 'nombre'] },
				{
					model: Localidad,
					as: 'localidad',
					attributes: ['id_localidad', 'nombre'],
				},
				{
					model: Familiar,
					as: 'familiares',
					include: [
						{
							model: Parentesco,
							as: 'parentesco',
							attributes: ['nombre'],
						},
					],
				},
			],
		});
		if (!paciente)
			return res.status(404).json({ message: 'Paciente no encontrado' });
		res.json(paciente);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const getLocalidades = async (req, res) => {
	try {
		const localidades = await Localidad.findAll({
			attributes: ['id_localidad', 'nombre'],
		});
		res.json(localidades);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const getGeneros = async (req, res) => {
	try {
		const generos = await Genero.findAll({
			attributes: ['id_genero', 'nombre'],
		});
		res.json(generos);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const createPaciente = async (req, res) => {
  try {
    const { fecha_nac } = req.body;

    if (fecha_nac) {
      const edad = calcularEdad(fecha_nac);
      if (edad < 0 || edad > 120) {
        return res.status(400).json({ message: 'La fecha de nacimiento no es válida.' });
      }
    }

    const nuevo = await Paciente.create(req.body);
    res.status(201).json(nuevo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePaciente = async (req, res) => {
  try {
    const paciente = await Paciente.findByPk(req.params.id);
    if (!paciente)
      return res.status(404).json({ message: 'Paciente no encontrado' });

    const { fecha_nac } = req.body;

    if (fecha_nac) {
      const edad = calcularEdad(fecha_nac);
      if (edad < 0 || edad > 120) {
        return res.status(400).json({ message: 'La fecha de nacimiento no es válida.' });
      }
    }

    await paciente.update(req.body);
    res.json(paciente);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deletePaciente = async (req, res) => {
	try {
		const paciente = await Paciente.findByPk(req.params.id);
		if (!paciente)
			return res.status(404).json({ message: 'Paciente no encontrado' });
		paciente.estado = false;
		await paciente.save();
		res.sendStatus(204);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const buscarPacientes = async (req, res) => {
  try {
    const q = req.query.q?.toLowerCase() || '';
    if (!q || q.length < 2) return res.json([]);

    const pacientes = await Paciente.findAll({
      where: {
        estado: true,
        [Op.or]: [
          { dni_paciente: { [Op.like]: `%${q}%` } },
          { nombre_p: { [Op.like]: `%${q}%` } },
          { apellido_p: { [Op.like]: `%${q}%` } }
        ]
      },
      limit: 10,
      order: [['apellido_p', 'ASC']]
    });

    const resultados = pacientes.map(p => ({
      id: p.id_paciente,
      text: `${p.dni_paciente} - ${p.apellido_p}, ${p.nombre_p}`
    }));

    res.json(resultados);
  } catch (error) {
    res.status(500).json({ message: 'Error en la búsqueda' });
  }
};

export const existeNNPorDNI = async (req, res) => {
  const dni = req.params.dni;

  try {
    const paciente = await Paciente.findOne({
      where: {
        dni_paciente: dni,
        apellido_p: 'NN',
        nombre_p: 'No identificado',
        estado: 1
      },
      include: [{
        model: Admision,
        as: 'admisiones', 
        where: {
          descripcion: { [Op.like]: '%emergencia%' },
          fecha_hora_egreso: null
        }
      }]
    });

    if (paciente) {
      return res.json({ encontrado: true });
    }

    return res.json({ encontrado: false });
  } catch (error) {
    console.error('Error buscando paciente NN:', error);
    return res.status(500).json({ error: 'Error buscando paciente NN' });
  }
};

export const obtenerNNconAdmision = async (req, res) => {
  const dni = req.params.dni;

  try {
    const pacienteNN = await Paciente.findOne({
      where: {
        dni_paciente: dni,
        apellido_p: 'NN',
        nombre_p: 'No identificado',
        estado: 1
      },
      include: [{
        model: Admision,
        as: 'admisiones',
        where: {
          descripcion: { [Op.like]: '%emergencia%' },
          fecha_hora_egreso: null
        },
        required: true
      }]
    });

    if (!pacienteNN) {
      return res.status(404).json({ error: 'Paciente NN no encontrado' });
    }

    res.json({
      paciente: {
        id: pacienteNN.id_paciente,
        dni: pacienteNN.dni_paciente
      }
    });
  } catch (error) {
    console.error('Error al buscar NN:', error);
    res.status(500).json({ error: 'Error interno' });
  }
};

export const obtenerPacientePorDNI = async (req, res) => {
  const dni = req.params.dni;

  const paciente = await Paciente.findOne({ where: { dni_paciente: dni } });

  if (!paciente) return res.status(404).json({ existe: false });

  res.json({
    existe: true,
    paciente: {
      nombre: paciente.nombre_p,
      apellido: paciente.apellido_p,
      fecha_nac: paciente.fecha_nac,
      telefono: paciente.telefono,
      direccion: paciente.direccion,
      email: paciente.email
    }
  });
};

