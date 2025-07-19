import {
	PersonalAdministrativo,
	RolUsuario,
} from '../models/index.js';

export const getPersonalAdministrativo = async (req, res) => {
	try {
		const lista = await PersonalAdministrativo.findAll({
			include: ['usuario', 'rol'],
		});
		res.json(lista);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const getPersonalAdministrativoById = async (req, res) => {
	try {
		const persona = await PersonalAdministrativo.findByPk(req.params.id, {
			include: ['usuario', 'rol'],
		});
		if (!persona) return res.status(404).json({ message: 'No encontrado' });
		res.json(persona);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const createPersonalAdministrativo = async (req, res) => {
	try {
		const nuevo = await PersonalAdministrativo.create(req.body);
		res.status(201).json(nuevo);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const updatePersonalAdministrativo = async (req, res) => {
	try {
		const persona = await PersonalAdministrativo.findByPk(req.params.id);
		if (!persona) return res.status(404).json({ message: 'No encontrado' });

		const { apellido, nombre, activo } = req.body;

		persona.apellido = apellido;
		persona.nombre = nombre;
		if (typeof activo === 'boolean') persona.activo = activo;

		await persona.save();
		res.json(persona);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const deletePersonalAdministrativo = async (req, res) => {
	try {
		const persona = await PersonalAdministrativo.findByPk(req.params.id);
		if (!persona) return res.status(404).json({ message: 'No encontrado' });
		persona.activo = false;
		await persona.save();
		res.json({ message: 'Baja exitosa' }); 
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const vistaPersonalAdministrativo = async (req, res) => {
	try {
		const personal = await PersonalAdministrativo.findAll({
			include: [{ model: RolUsuario, as: 'rol' }],
			where: { activo: true }
		});
		res.render('administrativo', { 
			personal , 
			usuario: req.session.usuario,
			autenticado: true
		});
	} catch (error) {
		res.status(500).send('Error al cargar personal administrativo');
	}
};

