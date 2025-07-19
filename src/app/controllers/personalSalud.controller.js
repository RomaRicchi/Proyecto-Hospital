import {
	PersonalSalud,
	RolUsuario,
	Especialidad,
} from '../models/index.js';

export const getPersonalSalud = async (req, res) => {
  try {
    const personal = await PersonalSalud.findAll({
      include: [
        { model: RolUsuario, as: 'rol' },
        { model: Especialidad, as: 'especialidad' }
      ]
    });
    res.json(personal);
  } catch (error) {
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const getPersonalSaludById = async (req, res) => {
	try {
		const persona = await PersonalSalud.findByPk(req.params.id, {
			include: ['usuario', 'rol', 'especialidad'],
		});
		if (!persona) return res.status(404).json({ message: 'No encontrado' });
		res.json(persona);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const createPersonalSalud = async (req, res) => {
	try {
		const nuevo = await PersonalSalud.create(req.body);
		res.status(201).json(nuevo);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const updatePersonalSalud = async (req, res) => {
	try {
		const persona = await PersonalSalud.findByPk(req.params.id);
		if (!persona) return res.status(404).json({ message: 'No encontrado' });

		const { apellido, nombre, matricula, activo } = req.body;

		persona.apellido = apellido;
		persona.nombre = nombre;
		persona.matricula = matricula || null;
		if (typeof activo === 'boolean') persona.activo = activo;

		await persona.save();
		res.json(persona);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const deletePersonalSalud = async (req, res) => {
	try {
		const persona = await PersonalSalud.findByPk(req.params.id);
		if (!persona) return res.status(404).json({ message: 'No encontrado' });
		persona.activo = false;
		await persona.save();
		res.json({ message: 'Baja exitosa' }); 
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const vistaPersonalSalud = async (req, res) => {
	try {
		const personal = await PersonalSalud.findAll({
			include: [
				{ model: RolUsuario, as: 'rol' },
				{ model: Especialidad, as: 'especialidad' }
			],
			where: { activo: true }
		});
		res.render('salud', { 
			personal , 
			usuario: req.session.usuario,
			autenticado: true
		});
	} catch (error) {
		res.status(500).send('Error al cargar personal de salud');
	}
};
